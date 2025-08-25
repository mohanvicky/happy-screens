import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireSuperAdmin } from '@/lib/adminAuth'
import { sendOTPEmail } from '@/lib/email'
import User from '@/models/User'
import OTP from '@/models/OTP'

export async function POST(request, { params }) {
  try {
    const superAdmin = await requireSuperAdmin(request)
    const targetUserId = params.id

    // Connect to database
    await dbConnect()
    
    // Find target user using Mongoose
    const targetUser = await User.findOne({ 
      _id: targetUserId,
      isActive: true 
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Rate limiting using OTP model's static method
    const rateLimit = await OTP.checkRateLimit(targetUser.email, 'password_reset')
    
    if (rateLimit.isLimited) {
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      )
    }

    // Get client IP and user agent for security logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create OTP using model's static method
    const { record: otpRecord, plainOTP } = await OTP.createOTP({
      email: targetUser.email,
      purpose: 'password_reset',
      targetUserId: targetUser._id,
      requestedBy: superAdmin.userId,
      ipAddress: clientIP,
      userAgent: userAgent
    })

    // Send OTP email
    try {
      await sendOTPEmail(targetUser.email, plainOTP, targetUser.username)
    } catch (emailError) {
      console.error('OTP email failed:', emailError)
      
      // Clean up the OTP record if email fails
      await OTP.findByIdAndDelete(otpRecord._id)
      
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${targetUser.email}`,
      email: targetUser.email,
      expiresIn: 300, // 5 minutes in seconds
      otpId: otpRecord._id.toString() // For tracking purposes
    })

  } catch (error) {
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    console.error('Request OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
