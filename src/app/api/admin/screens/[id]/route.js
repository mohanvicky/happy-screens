import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth, requireSuperAdmin } from '@/lib/adminAuth'
import Screen from '@/models/Screen'

// Update screen (Super Admin only)
export async function PUT(request, { params }) {
  try {
    const user = await requireSuperAdmin(request)
    await dbConnect()

    const { name, description, capacity, location, amenities, pricePerHour, images, isActive } = await request.json()

    if (!name || !location || !capacity || pricePerHour === undefined) {
      return NextResponse.json({ 
        error: 'Name, location, capacity, and price are required' 
      }, { status: 400 })
    }

    const screen = await Screen.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        description: description?.trim(),
        capacity: parseInt(capacity),
        location,
        amenities: amenities || [],
        pricePerHour: parseFloat(pricePerHour),
        images: images || [],
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('location', 'name')

    if (!screen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

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
    console.error('Update screen error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'A screen with this name already exists in this location' 
      }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to update screen' }, { status: 500 })
  }
}

// Delete screen (Super Admin only)
export async function DELETE(request, { params }) {
  try {
    await requireSuperAdmin(request)
    await dbConnect()

    const screen = await Screen.findByIdAndDelete(params.id)

    if (!screen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Screen deleted successfully'
    })

  } catch (error) {
    console.error('Delete screen error:', error)
    
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Only super admin can delete screens' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Failed to delete screen' }, { status: 500 })
  }
}
