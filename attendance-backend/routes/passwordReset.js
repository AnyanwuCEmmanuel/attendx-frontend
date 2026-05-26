import express from 'express'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import supabase from '../db.js'

const router = express.Router()
const resend = new Resend(process.env.RESEND_API_KEY)

// REQUEST PASSWORD RESET
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body

  try {
    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (!user) {
      return res.status(404).json({ 
        error: 'No account found with this email' 
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires_at = new Date(
      Date.now() + 60 * 60 * 1000
    ).toISOString()

    // Save token to database
    await supabase
      .from('password_resets')
      .insert([{ email, token, expires_at }])

    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    // Send email
    await resend.emails.send({
      from: 'AttendX <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your AttendX Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; 
        margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your AttendX account.</p>
          <p>Click the button below to reset your password. 
          This link expires in 1 hour.</p>
          <a href="${resetLink}" 
          style="display: inline-block; background: #4f46e5; 
          color: white; padding: 12px 24px; border-radius: 8px; 
          text-decoration: none; font-weight: bold; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 12px;">
            If you did not request this, ignore this email.
            Your password will not change.
          </p>
        </div>
      `
    })

    res.json({ message: 'Password reset link sent to your email' })

  } catch (err) {
    console.log('Forgot password error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body

  try {
    // Find the token
    const { data: resetRecord } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (!resetRecord) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset link' 
      })
    }

    // Check if expired
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ 
        error: 'Reset link has expired. Request a new one.' 
      })
    }

    // Hash new password
    const password_hash = await bcrypt.hash(password, 10)

    // Update user password
    await supabase
      .from('users')
      .update({ password_hash })
      .eq('email', resetRecord.email)

    // Mark token as used
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetRecord.id)

    res.json({ message: 'Password reset successfully' })

  } catch (err) {
    console.log('Reset password error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router