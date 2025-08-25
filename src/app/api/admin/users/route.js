import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireSuperAdmin } from '@/lib/adminAuth'
import { sendWelcomeEmail } from '@/lib/email'
import User from '@/models/User'
import Location from '@/models/Location'  

// Get all admins (Super Admin only)
export async function GET(request) {
    try {
      await requireSuperAdmin(request)  // ← Already async
      await dbConnect()
  
      // Get all admins with populated data
      const admins = await User.find({ 
        role: { $in: ['admin', 'super_admin'] } 
      })
        .populate('assignedLocations', 'name address.area address.city')
        .populate('createdBy', 'username email')
        .select('-password')
        .sort({ createdAt: -1 })
        .lean()
  
      const transformedAdmins = admins.map(admin => ({
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        assignedLocations: admin.assignedLocations || [],
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        failedLoginAttempts: admin.failedLoginAttempts,
        createdBy: admin.createdBy,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }))
  
      return NextResponse.json({ 
        success: true,
        admins: transformedAdmins,
        count: transformedAdmins.length
      })
  
    } catch (error) {
      if (error.message === 'Super Admin access required') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      
      console.error('Get admins error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

// Create new admin (Super Admin only)
export async function POST(request) {
  try {
    const superAdmin = await requireSuperAdmin(request)
    await dbConnect()

    const { username, email, phone, assignedLocations } = await request.json()

    if (!username || !email || !phone) {
      return NextResponse.json({ 
        error: 'Username, email, and phone are required' 
      }, { status: 400 })
    }

    // Validate phone number format (basic validation)
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return NextResponse.json({ 
        error: 'Please enter a valid Indian phone number' 
      }, { status: 400 })
    }

    // Validate email format
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return NextResponse.json({ 
        error: 'Please enter a valid email address' 
      }, { status: 400 })
    }

    // Check if username or email already exists using Mongoose
    const existingUser = await User.findOne({ 
      $or: [
        { username: username.toLowerCase().trim() },
        { email: email.toLowerCase().trim() }
      ]
    })
    
    if (existingUser) {
      const conflictField = existingUser.username === username.toLowerCase().trim() 
        ? 'Username' 
        : 'Email'
      return NextResponse.json({ 
        error: `${conflictField} already exists. Please choose a different one.` 
      }, { status: 409 })
    }

    // Generate temporary password (more secure)
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).slice(-4).toUpperCase()

    // Create admin user using Mongoose model
    const newAdmin = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: tempPassword, // Will be hashed by pre-save hook
      role: 'admin',
      assignedLocations: assignedLocations || [],
      isActive: true,
      createdBy: superAdmin.userId,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLogin: null
    })

    // Save the admin (triggers validation and password hashing)
    await newAdmin.save()

    // Send welcome email with temporary password
    let emailSent = false
    try {
      await sendWelcomeEmail(newAdmin.email, newAdmin.username, tempPassword)
      emailSent = true
    } catch (emailError) {
      console.error('Welcome email failed:', emailError)
      // Continue even if email fails, but notify the super admin
    }

    // Populate the created admin for response
    await newAdmin.populate('assignedLocations', 'name address.area address.city')
    await newAdmin.populate('createdBy', 'username email')

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin._id.toString(),
        username: newAdmin.username,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        assignedLocations: newAdmin.assignedLocations || [],
        isActive: newAdmin.isActive,
        createdBy: newAdmin.createdBy,
        createdAt: newAdmin.createdAt,
        updatedAt: newAdmin.updatedAt
      },
      tempPassword, // Include for super admin to communicate
      emailSent,
      message: emailSent 
        ? 'Admin created successfully. Welcome email sent.' 
        : 'Admin created successfully. Please manually share the temporary password.'
    })

  } catch (error) {
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    // Handle duplicate key errors (MongoDB level)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json({ 
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      }, { status: 409 })
    }
    
    console.error('Create admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
