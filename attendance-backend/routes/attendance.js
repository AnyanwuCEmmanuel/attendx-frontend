import express from "express";
import jwt from "jsonwebtoken";
import supabase from "../db.js";

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Generate 6 digit token
const generateToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate distance between two GPS coordinates in metres
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// START ATTENDANCE SESSION (lecturer only)
router.post("/start", verifyToken, async (req, res) => {
  const { course_id, latitude, longitude } = req.body;

  if (req.user.role !== "lecturer") {
    return res
      .status(403)
      .json({ error: "Only lecturers can start attendance" });
  }

  try {
    // Check if there is already an open session for this course
    const { data: existing } = await supabase
      .from("attendance_sessions")
      .select("id")
      .eq("course_id", course_id)
      .eq("status", "open")
      .single();

    if (existing) {
      return res.status(400).json({
        error: "An attendance session is already open for this course",
      });
    }

    // Generate token and set expiry to 10 minutes from now
    const token = generateToken();
    const now = new Date();
    const expires_at = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert([
        {
          course_id,
          lecturer_id: req.user.id,
          token,
          expires_at,
          status: "open",
          latitude: latitude || null,
          longitude: longitude || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Attendance session started",
      session: data,
    });
  } catch (err) {
    console.log("Start attendance error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// CLOSE ATTENDANCE SESSION (lecturer only)
router.post("/close/:sessionId", verifyToken, async (req, res) => {
  if (req.user.role !== "lecturer") {
    return res
      .status(403)
      .json({ error: "Only lecturers can close attendance" });
  }

  try {
    const { error } = await supabase
      .from("attendance_sessions")
      .update({ status: "closed" })
      .eq("id", req.params.sessionId)
      .eq("lecturer_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Attendance session closed" });
  } catch (err) {
    console.log("Close attendance error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// MARK ATTENDANCE (student only)
router.post("/mark", verifyToken, async (req, res) => {
  const { token, latitude, longitude } = req.body;

  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Only students can mark attendance" });
  }

  try {
    // Find the session with this token
    const { data: session, error: sessionError } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("token", token)
      .eq("status", "open")
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    // Check if token has expired
    if (new Date() > new Date(session.expires_at)) {
      // Auto close the session
      await supabase
        .from("attendance_sessions")
        .update({ status: "closed" })
        .eq("id", session.id);

      return res.status(400).json({ error: "Token has expired" });
    }

    // Check if student is enrolled in this course
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", req.user.id)
      .eq("course_id", session.course_id)
      .single();

    if (!enrollment) {
      return res.status(403).json({
        error: "You are not enrolled in this course",
      });
    }

    // Check if student already marked attendance
    const { data: existing } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("session_id", session.id)
      .eq("student_id", req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({
        error: "You have already marked attendance for this session",
      });
    }

    // Check geolocation if session has a location
    let location_verified = false;
    let locationError = null;

    if (session.latitude && session.longitude) {
      if (!latitude || !longitude) {
        return res.status(403).json({
          error:
            "Location access is required to mark attendance. Please allow location access and try again.",
        });
      }

      // Calculate distance using Haversine formula
      const distance = getDistance(
        session.latitude,
        session.longitude,
        latitude,
        longitude,
      );

      console.log(`Distance from lecture hall: ${distance} metres`);

      if (distance > 200) {
        return res.status(403).json({
          error: `You are too far from the lecture hall (${Math.round(distance)}m away). You must be within 200 metres.`,
        });
      }

      location_verified = true;
    }

    // Record attendance
    const { error: recordError } = await supabase
      .from("attendance_records")
      .insert([
        {
          session_id: session.id,
          student_id: req.user.id,
          latitude: latitude || null,
          longitude: longitude || null,
          location_verified,
        },
      ]);

    if (recordError) throw recordError;

    res.status(201).json({
      message: "Attendance marked successfully",
      location_verified,
    });
  } catch (err) {
    console.log("Mark attendance error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET ATTENDANCE RECORDS FOR A SESSION (lecturer)
router.get("/session/:sessionId", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("attendance_records")
      .select(
        `
        id,
        submitted_at,
        users (
          name,
          email,
          student_id
        )
      `,
      )
      .eq("session_id", req.params.sessionId);

    if (error) throw error;

    res.json({ records: data });
  } catch (err) {
    console.log("Get records error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET STUDENT ATTENDANCE HISTORY
router.get("/history", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("attendance_records")
      .select(
        `
        id,
        submitted_at,
        attendance_sessions (
          started_at,
          courses (
            course_code,
            course_name
          )
        )
      `,
      )
      .eq("student_id", req.user.id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    res.json({ history: data });
  } catch (err) {
    console.log("Get history error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET ACTIVE SESSIONS COUNT FOR LECTURER
router.get("/active-sessions", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("attendance_sessions")
      .select("id")
      .eq("lecturer_id", req.user.id)
      .eq("status", "open");

    if (error) throw error;

    res.json({ count: data.length });
  } catch (err) {
    console.log("Active sessions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET ALL OPEN SESSIONS FOR LECTURER
router.get("/open-sessions", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("attendance_sessions")
      .select(
        `
        id,
        token,
        started_at,
        expires_at,
        courses (
          course_code,
          course_name
        )
      `,
      )
      .eq("lecturer_id", req.user.id)
      .eq("status", "open")
      .order("started_at", { ascending: false });

    if (error) throw error;

    res.json({ sessions: data });
  } catch (err) {
    console.log("Open sessions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET ATTENDANCE PERCENTAGE PER COURSE FOR STUDENT
router.get("/percentage", verifyToken, async (req, res) => {
  try {
    // Get all courses student is enrolled in
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("course_id, courses(course_code, course_name)")
      .eq("student_id", req.user.id);

    if (enrollError) throw enrollError;
    if (!enrollments || enrollments.length === 0) {
      return res.json({ percentages: [] });
    }

    const percentages = [];

    for (const enrollment of enrollments) {
      const courseId = enrollment.course_id;

      // Get total sessions for this course
      const { data: sessions } = await supabase
        .from("attendance_sessions")
        .select("id")
        .eq("course_id", courseId)
        .eq("status", "closed");

      const totalSessions = sessions?.length || 0;

      // Get sessions student attended
      const { data: attended } = await supabase
        .from("attendance_records")
        .select("id, session_id")
        .eq("student_id", req.user.id)
        .in(
          "session_id",
          totalSessions > 0 ? sessions.map((s) => s.id) : ["none"],
        );

      const attendedCount = attended?.length || 0;
      const percentage =
        totalSessions > 0
          ? Math.round((attendedCount / totalSessions) * 100)
          : 0;

      percentages.push({
        course_id: courseId,
        course_code: enrollment.courses.course_code,
        course_name: enrollment.courses.course_name,
        total_sessions: totalSessions,
        attended: attendedCount,
        percentage,
        status:
          percentage >= 80 ? "safe" : percentage >= 60 ? "warning" : "danger",
      });
    }

    res.json({ percentages });
  } catch (err) {
    console.log("Percentage error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET OVERALL ATTENDANCE RATE FOR STUDENT
router.get("/student-rate", verifyToken, async (req, res) => {
  try {
    // Get all courses student is enrolled in
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", req.user.id);

    if (enrollError) throw enrollError;
    if (!enrollments || enrollments.length === 0) {
      return res.json({ attendance_rate: 0 });
    }

    const courseIds = enrollments.map((e) => e.course_id);

    // Get all sessions for all enrolled courses
    const { data: allSessions } = await supabase
      .from("attendance_sessions")
      .select("id")
      .in("course_id", courseIds)
      .eq("status", "closed");

    const totalSessions = allSessions?.length || 0;

    // Get all sessions student attended
    const { data: attendedSessions } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("student_id", req.user.id)
      .in(
        "session_id",
        totalSessions > 0 ? allSessions.map((s) => s.id) : ["none"],
      );

    const attendedCount = attendedSessions?.length || 0;
    const attendanceRate =
      totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;

    res.json({ attendance_rate: attendanceRate });
  } catch (err) {
    console.log("Student rate error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET ALL STUDENTS ATTENDANCE FOR LECTURER
router.get("/course-students/:courseId", verifyToken, async (req, res) => {
  if (req.user.role !== "lecturer") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const courseId = req.params.courseId;

    // Get all sessions for this course
    const { data: sessions } = await supabase
      .from("attendance_sessions")
      .select("id")
      .eq("course_id", courseId)
      .eq("status", "closed");

    const totalSessions = sessions?.length || 0;

    // Get all enrolled students
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("student_id, users(id, name, email, student_id)")
      .eq("course_id", courseId);

    if (error) throw error;

    const studentStats = [];

    for (const enrollment of enrollments) {
      const student = enrollment.users;

      // Get how many sessions this student attended
      const { data: attended } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("student_id", student.id)
        .in(
          "session_id",
          totalSessions > 0 ? sessions.map((s) => s.id) : ["none"],
        );

      const attendedCount = attended?.length || 0;
      const percentage =
        totalSessions > 0
          ? Math.round((attendedCount / totalSessions) * 100)
          : 0;

      studentStats.push({
        student_id: student.id,
        name: student.name,
        email: student.email,
        matric: student.student_id,
        total_sessions: totalSessions,
        attended: attendedCount,
        percentage,
        status:
          percentage >= 80 ? "safe" : percentage >= 60 ? "warning" : "danger",
      });
    }

    res.json({
      students: studentStats,
      total_sessions: totalSessions,
    });
  } catch (err) {
    console.log("Course students error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
