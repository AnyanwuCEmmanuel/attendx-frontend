import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import attendanceRoutes from "./routes/attendance.js";
import assignmentRoutes from "./routes/assignments.js";
import passwordResetRoutes from "./routes/passwordReset.js";
import notesRoutes from "./routes/notes.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-app.vercel.app"],
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AttendX Backend is running" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
