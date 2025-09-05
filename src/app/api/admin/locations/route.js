import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth, requireSuperAdmin } from '@/lib/adminAuth'
import Location from '@/models/Location'

// Get all locations
export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    let filter = {}

    // For non-super admins, only show assigned locations
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      filter._id = { $in: userLocationIds }
    }

    const locations = await Location.find(filter)
      .populate('createdBy', 'username')
      .populate('managedBy', 'username')
      .sort({ createdAt: -1 })
      .lean()

    const transformedLocations = locations.map(location => ({
      id: location._id.toString(),
      name: location.name,
      address: location.address,
      coordinates: location.coordinates,
      contactInfo: location.contactInfo,
      operatingHours: location.operatingHours,
      facilities: location.facilities,
      googleMapsUrl: location.googleMapsUrl,
      isActive: location.isActive,
      managedBy: location.managedBy,
      createdBy: location.createdBy,
      fullAddress: location.fullAddress,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt
    }))

    return NextResponse.json({
      success: true,
      locations: transformedLocations
    })

  } catch (error) {
    console.error('Get locations error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}

// Create new location (Super Admin only)
export async function POST(request) {
  try {
    const user = await requireSuperAdmin(request)
    await dbConnect()

    const locationData = await request.json()

    if (!locationData.name || !locationData.address?.street || !locationData.contactInfo?.phone) {
      return NextResponse.json({ 
        error: 'Name, street address, and phone are required' 
      }, { status: 400 })
    }

    const location = await Location.create({ 
      ...locationData,
      createdBy: user._id
    })

    await location.populate('createdBy', 'username')

    return NextResponse.json({
      success: true,
      location: {
        id: location._id.toString(),
        name: location.name,
        address: location.address,
        isActive: location.isActive
      }
    })

  } catch (error) {
    console.error('Create location error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'A location with this name already exists' 
      }, { status: 409 })
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
}
