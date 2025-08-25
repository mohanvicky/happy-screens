import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireSuperAdmin } from '@/lib/adminAuth'
import User from '@/models/User'

// Get specific admin
export async function GET(request, { params }) {
  try {
    await requireSuperAdmin(request)
    await dbConnect()

    // Find admin using Mongoose (excludes password by default in schema)
    const admin = await User.findById(params.id)
      .populate('assignedLocations', 'name address.area address.city')
      .populate('createdBy', 'username email')
      .select('-password') // Explicitly exclude password
      .lean() // Returns plain JS object for better performance

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      admin: {
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
      }
    })

  } catch (error) {
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    console.error('Get admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update admin
export async function PUT(request, { params }) {
  try {
    await requireSuperAdmin(request)
    await dbConnect()

    const { email, phone, assignedLocations, isActive } = await request.json()

    // Find the admin first
    const admin = await User.findById(params.id)
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Don't allow modifying super admin
    if (admin.role === 'super_admin') {
      return NextResponse.json({ 
        error: 'Cannot modify Super Admin' 
      }, { status: 400 })
    }

    // Update fields if provided
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: params.id }
      })
      
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email already in use by another admin' 
        }, { status: 409 })
      }
      
      admin.email = email.toLowerCase().trim()
    }

    if (phone) {
      admin.phone = phone.trim()
    }

    if (assignedLocations !== undefined) {
      admin.assignedLocations = assignedLocations
    }

    if (isActive !== undefined) {
      admin.isActive = isActive
      
      // If deactivating, reset login attempts and locks
      if (!isActive) {
        admin.failedLoginAttempts = 0
        admin.accountLockedUntil = null
      }
    }

    // Save the admin (triggers validation and pre-save hooks)
    await admin.save()

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        assignedLocations: admin.assignedLocations,
        isActive: admin.isActive,
        updatedAt: admin.updatedAt
      }
    })

  } catch (error) {
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }
    
    console.error('Update admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete admin (soft delete)
export async function DELETE(request, { params }) {
  try {
    await requireSuperAdmin(request)
    await dbConnect()

    // Find the admin
    const admin = await User.findById(params.id)

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Don't allow deleting super admin
    if (admin.role === 'super_admin') {
      return NextResponse.json({ 
        error: 'Cannot delete Super Admin' 
      }, { status: 400 })
    }

    // Don't allow deleting already inactive admin
    if (!admin.isActive) {
      return NextResponse.json({ 
        error: 'Admin is already deactivated' 
      }, { status: 400 })
    }

    // Soft delete - mark as inactive and reset security fields
    admin.isActive = false
    admin.failedLoginAttempts = 0
    admin.accountLockedUntil = null
    
    await admin.save()

    // Optional: Clean up related data
    // Remove any pending OTPs for this user
    const OTP = require('@/models/OTP').default
    await OTP.deleteMany({ 
      targetUserId: admin._id,
      isUsed: false 
    })

    return NextResponse.json({
      success: true,
      message: 'Admin deactivated successfully'
    })

  } catch (error) {
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    console.error('Delete admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
