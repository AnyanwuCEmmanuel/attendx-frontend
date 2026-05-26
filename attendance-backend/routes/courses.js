import express from 'express'
import supabase from '../db.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (
      decoded.role === 'lecturer' &&
      decoded.status === 'pending_lecturer'
    ) {
      return res.status(403).json({
        error: 'Your account is pending admin approval'
      })
    }

    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

const generateJoinCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// CREATE COURSE (lecturer only)
router.post('/create', verifyToken, async (req, res) => {
  const { course_code, course_name, department, semester, year } = req.body

  if (req.user.role !== 'lecturer') {
    return res.status(403).json({ 
      error: 'Only lecturers can create courses' 
    })
  }

  try {
    const join_code = generateJoinCode()

    const { data, error } = await supabase
      .from('courses')
      .insert([{
        course_code,
        course_name,
        department,
        lecturer_id: req.user.id,
        semester,
        year,
        join_code
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ 
      message: 'Course created successfully', 
      course: data 
    })

  } catch (err) {
    console.log('Create course error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET LECTURER COURSES
router.get('/my-courses', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('lecturer_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ courses: data })

  } catch (err) {
    console.log('Get courses error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// JOIN COURSE (student only)
router.post('/join', verifyToken, async (req, res) => {
  const { join_code } = req.body

  console.log('Join code received:', join_code)

  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      error: 'Only students can join courses' 
    })
  }

  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('join_code', join_code)
      .single()

    console.log('Course found:', course)
    console.log('Course error:', courseError)

    if (courseError || !course) {
      return res.status(404).json({ error: 'Invalid join code' })
    }

    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('course_id', course.id)
      .single()

    if (existing) {
      return res.status(400).json({ 
        error: 'Already enrolled in this course' 
      })
    }

    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert([{
        student_id: req.user.id,
        course_id: course.id
      }])

    if (enrollError) throw enrollError

    res.status(201).json({ 
      message: 'Successfully enrolled', 
      course: course 
    })

  } catch (err) {
    console.log('Join course error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET STUDENT ENROLLED COURSES
router.get('/enrolled', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        enrolled_at,
        courses (
          id,
          course_code,
          course_name,
          department,
          semester,
          year,
          join_code
        )
      `)
      .eq('student_id', req.user.id)

    if (error) throw error

    res.json({ courses: data })

  } catch (err) {
    console.log('Get enrolled courses error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router