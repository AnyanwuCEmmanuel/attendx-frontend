import express from 'express'
import jwt from 'jsonwebtoken'
import supabase from '../db.js'

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

// CREATE ASSIGNMENT (lecturer only)
router.post('/create', verifyToken, async (req, res) => {
  const { course_id, title, description, deadline, file_url } = req.body

  if (req.user.role !== 'lecturer') {
    return res.status(403).json({
      error: 'Only lecturers can create assignments'
    })
  }

  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert([{
        course_id,
        lecturer_id: req.user.id,
        title,
        description,
        deadline,
        file_url: file_url || null
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: data
    })

  } catch (err) {
    console.log('Create assignment error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET ASSIGNMENTS FOR LECTURER
router.get('/my-assignments', verifyToken, async (req, res) => {
  if (req.user.role !== 'lecturer') {
    return res.status(403).json({ error: 'Access denied' })
  }

  try {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        courses (
          course_code,
          course_name
        )
      `)
      .eq('lecturer_id', req.user.id)
      .order('deadline', { ascending: true })

    if (error) throw error

    res.json({ assignments: data })

  } catch (err) {
    console.log('Get assignments error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET ASSIGNMENTS FOR STUDENT
router.get('/student-assignments', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied' })
  }

  try {
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', req.user.id)

    if (enrollError) throw enrollError

    if (!enrollments || enrollments.length === 0) {
      return res.json({ assignments: [] })
    }

    const courseIds = enrollments.map(e => e.course_id)

    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        courses (
          course_code,
          course_name
        )
      `)
      .in('course_id', courseIds)
      .order('deadline', { ascending: true })

    if (error) throw error

    res.json({ assignments: data })

  } catch (err) {
    console.log('Get student assignments error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE ASSIGNMENT (lecturer only)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'lecturer') {
    return res.status(403).json({ error: 'Access denied' })
  }

  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', req.params.id)
      .eq('lecturer_id', req.user.id)

    if (error) throw error

    res.json({ message: 'Assignment deleted successfully' })

  } catch (err) {
    console.log('Delete assignment error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router