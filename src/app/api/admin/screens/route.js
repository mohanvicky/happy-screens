import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'
import { requireAuth, requireSuperAdmin } from '@/lib/adminAuth'
import Screen from '@/models/Screen'

// Get all screens
// src/app/api/admin/screens/route.js
export async function GET(request) {
  try {
    await dbConnect()

    // Try to get user, but don't require authentication for public access
    let user = null
    try {
      user = await requireAuth(request)
    } catch (error) {
      // User not authenticated - allow public access with restrictions
      console.log('Public access to screens')
    }

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')

    let filter = { isActive: true } // Only show active screens for public access

    // Apply location filter if provided
    if (location && mongoose.Types.ObjectId.isValid(location)) {
      filter.location = location
    }

    // If user is authenticated, apply role-based filtering
    if (user) {
      if (user.role !== 'super_admin') {
        const userLocationIds = user.assignedLocations.map(loc => 
          typeof loc === 'object' ? loc._id.toString() : loc.toString()
        )
        
        if (location) {
          // Check if the requested location is in user's assigned locations
          if (!userLocationIds.includes(location)) {
            return NextResponse.json({ screens: [] })
          }
        } else {
          filter.location = { $in: userLocationIds }
        }
      }
      
      // For authenticated users, show both active and inactive screens
      delete filter.isActive
    }

    console.log('Screen filter:', filter)

    const screens = await Screen.find(filter)
      .populate('location', 'name address')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean()

    const transformedScreens = screens.map(screen => ({
      id: screen._id.toString(),
      name: screen.name,
      description: screen.description,
      capacity: screen.capacity,
      location: screen.location,
      amenities: screen.amenities,
      pricePerHour: screen.pricePerHour,
      images: screen.images,
      isActive: screen.isActive,
      createdBy: screen.createdBy,
      createdAt: screen.createdAt,
      updatedAt: screen.updatedAt
    }))

    return NextResponse.json({
      success: true,
      screens: transformedScreens
    })

  } catch (error) {
    console.error('Get screens error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



// Create new screen (Super Admin only)
export async function POST(request) {
  try {
    const user = await requireSuperAdmin(request)
    await dbConnect()

    const { name, description, capacity, location, amenities, pricePerHour, images, isActive } = await request.json()

    if (!name || !location || !capacity || pricePerHour === undefined) {
      return NextResponse.json({ 
        error: 'Name, location, capacity, and price are required' 
      }, { status: 400 })
    }

    const screen = await Screen.create({
      name: name.trim(),
      description: description?.trim(),
      capacity: parseInt(capacity),
      location,
      amenities: amenities || [],
      pricePerHour: parseFloat(pricePerHour),
      images: images || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: user._id
    })

    await screen.populate('location', 'name')

    return NextResponse.json({
      success: true,
      screen: {
        id: screen._id.toString(),
        name: screen.name,
        location: screen.location,
        capacity: screen.capacity,
        pricePerHour: screen.pricePerHour
      }
    })

  } catch (error) {
    console.error('Create screen error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'A screen with this name already exists in this location' 
      }, { status: 409 })
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create screen' }, { status: 500 })
  }
}
