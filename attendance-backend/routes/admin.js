import express from 'express'
import jwt from 'jsonwebtoken'
import supabase from '../db.js'

const router = express.Router()

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin access required' 
      })
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// GET ALL PENDING LECTURERS
router.get('/pending-lecturers', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('role', 'lecturer')
      .eq('status', 'pending_lecturer')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ lecturers: data })
  } catch (err) {
    console.log('Get pending lecturers error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET ALL USERS
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at, approved_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ users: data })
  } catch (err) {
    console.log('Get users error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// APPROVE LECTURER
router.post('/approve/:userId', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'active',
        approved_by: req.user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', req.params.userId)
      .eq('role', 'lecturer')
      .eq('status', 'pending_lecturer')

    if (error) throw error
    res.json({ message: 'Lecturer approved successfully' })
  } catch (err) {
    console.log('Approve error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// REJECT LECTURER
router.post('/reject/:userId', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: 'suspended' })
      .eq('id', req.params.userId)
      .eq('role', 'lecturer')

    if (error) throw error
    res.json({ message: 'Lecturer rejected' })
  } catch (err) {
    console.log('Reject error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// SUSPEND USER
router.post('/suspend/:userId', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: 'suspended' })
      .eq('id', req.params.userId)

    if (error) throw error
    res.json({ message: 'User suspended' })
  } catch (err) {
    console.log('Suspend error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router