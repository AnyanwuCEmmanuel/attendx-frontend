import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import supabase from '../db.js'

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  const { 
    name, email, password, role, 
    studentId, lecturerCode, adminCode 
  } = req.body

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      })
    }

    if (role === 'lecturer') {
      if (!lecturerCode) {
        return res.status(400).json({ 
          error: 'Lecturer registration code is required' 
        })
      }
      if (lecturerCode !== process.env.LECTURER_CODE) {
        return res.status(400).json({ 
          error: 'Invalid lecturer registration code' 
        })
      }
    }

    if (role === 'admin') {
      if (!adminCode) {
        return res.status(400).json({ 
          error: 'Admin registration code is required' 
        })
      }
      if (adminCode !== process.env.ADMIN_CODE) {
        return res.status(400).json({ 
          error: 'Invalid admin registration code' 
        })
      }
    }

    const password_hash = await bcrypt.hash(password, 10)

    let status = 'active'
    let actualRole = role

    if (role === 'lecturer') {
      status = 'pending_lecturer'
      actualRole = 'lecturer'
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password_hash,
        role: actualRole,
        student_id: studentId || null,
        status
      }])
      .select()
      .single()

    if (error) throw error

    const message = role === 'lecturer'
      ? 'Account created. Awaiting admin approval before you can access lecturer features.'
      : 'Account created successfully'

    res.status(201).json({ message })

  } catch (err) {
    console.log('Register error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(400).json({ 
        error: 'Invalid email or password' 
      })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(400).json({ 
        error: 'Invalid email or password' 
      })
    }

    // ✅ Block suspended users
    if (user.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Your account has been suspended. Contact admin.' 
      })
    }

    // ✅ Block pending lecturers from logging in
    if (user.status === 'pending_lecturer') {
      return res.status(403).json({ 
        error: 'Your account is awaiting admin approval. You will be notified once approved.' 
      })
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        name: user.name,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    })

  } catch (err) {
    console.log('Login error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
