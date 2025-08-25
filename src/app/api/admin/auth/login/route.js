import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { createJWT } from '@/lib/adminAuth'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Connect to database (Mongoose)
    await dbConnect()
    
    // Find active user using Mongoose model
    const user = await User.findOne({ 
      username: username.toLowerCase().trim(),
      isActive: true 
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check account lock
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const lockTimeLeft = Math.ceil((user.accountLockedUntil - new Date()) / (1000 * 60))
      return NextResponse.json(
        { error: `Account locked for ${lockTimeLeft} more minutes. Contact Super Admin.` },
        { status: 423 }
      )
    }

    // Verify password using the model's instance method
    const isValidPassword = await user.comparePassword(password)
    
    if (!isValidPassword) {
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1
      const shouldLock = newFailedAttempts >= 5
      
      // Update using Mongoose
      await User.updateOne(
        { _id: user._id },
        { 
          failedLoginAttempts: newFailedAttempts,
          accountLockedUntil: shouldLock 
            ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            : null,
          updatedAt: new Date()
        }
      )
      
      if (shouldLock) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Account locked for 30 minutes.' },
          { status: 423 }
        )
      }
      
      return NextResponse.json(
        { error: `Invalid credentials. ${5 - newFailedAttempts} attempts remaining.` },
        { status: 401 }
      )
    }

    // Successful login - use the model's static method
    await User.resetFailedAttempts(user._id)

    // Create JWT token
    const token = createJWT({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      assignedLocations: user.assignedLocations || []
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        assignedLocations: user.assignedLocations || [],
        lastLogin: new Date()
      },
      message: 'Login successful'
    })

    // Set secure HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
