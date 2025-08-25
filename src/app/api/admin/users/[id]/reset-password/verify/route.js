import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireSuperAdmin } from '@/lib/adminAuth'
import User from '@/models/User'
import OTP from '@/models/OTP'

export async function POST(request, { params }) {
  try {
    const superAdmin = await requireSuperAdmin(request)
    const targetUserId = params.id

    const { otp, newPassword } = await request.json()

    if (!otp || !newPassword) {
      return NextResponse.json(
        { error: 'OTP and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()
    
    // Find the target user
    const targetUser = await User.findOne({ 
      _id: targetUserId,
      isActive: true 
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find valid OTP using model's static method
    const otpRecord = await OTP.findValidOTP(
      targetUser.email, 
      'password_reset', 
      targetUserId
    )

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid, expired, or already used OTP' },
        { status: 400 }
      )
    }

    // Verify OTP using model's instance method
    try {
      await otpRecord.verifyOTP(otp)
    } catch (verifyError) {
      return NextResponse.json(
        { error: verifyError.message },
        { status: 400 }
      )
    }

    // Update user password (pre-save hook will hash it automatically)
    targetUser.password = newPassword
    targetUser.failedLoginAttempts = 0
    targetUser.accountLockedUntil = null
    targetUser.passwordChangedAt = new Date()
    
    await targetUser.save()

    // Mark OTP as used
    await otpRecord.markAsUsed()

    // Clean up any other unused OTPs for this user
    await OTP.deleteMany({
      email: targetUser.email,
      purpose: 'password_reset',
      isUsed: false
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
