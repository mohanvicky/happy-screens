import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth, requireSuperAdmin } from '@/lib/adminAuth'
import Location from '@/models/Location'

// Update location (Super Admin only)
export async function PUT(request, { params }) {
  try {
    const user = await requireSuperAdmin(request)
    await dbConnect()

    const locationData = await request.json()

    if (!locationData.name || !locationData.address?.street || !locationData.contactInfo?.phone) {
      return NextResponse.json({ 
        error: 'Name, street address, and phone are required' 
      }, { status: 400 })
    }

    const location = await Location.findByIdAndUpdate(
      params.id,
      {
        ...locationData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username')

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

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
    console.error('Update location error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'A location with this name already exists' 
      }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

// Delete location (Super Admin only)
export async function DELETE(request, { params }) {
  try {
    await requireSuperAdmin(request)
    await dbConnect()

    const location = await Location.findByIdAndDelete(params.id)

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    })

  } catch (error) {
    console.error('Delete location error:', error)
    
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Only super admin can delete locations' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
}
