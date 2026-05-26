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
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// GET ALL NOTES FOR STUDENT
router.get('/', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ notes: data })
  } catch (err) {
    console.log('Get notes error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// CREATE NOTE
router.post('/create', verifyToken, async (req, res) => {
  const { title, content, reminder_at } = req.body

  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can create notes' })
  }

  try {
    const { data, error } = await supabase
      .from('student_notes')
      .insert([{
        student_id: req.user.id,
        title,
        content,
        reminder_at: reminder_at || null
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ message: 'Note created', note: data })
  } catch (err) {
    console.log('Create note error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// UPDATE NOTE
router.put('/:id', verifyToken, async (req, res) => {
  const { title, content, reminder_at } = req.body

  try {
    const { data, error } = await supabase
      .from('student_notes')
      .update({
        title,
        content,
        reminder_at: reminder_at || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('student_id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json({ message: 'Note updated', note: data })
  } catch (err) {
    console.log('Update note error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE NOTE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('student_notes')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.user.id)

    if (error) throw error
    res.json({ message: 'Note deleted' })
  } catch (err) {
    console.log('Delete note error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router