import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

// Import all models to prevent schema registration errors
import Screen from '@/models/Screen'
import Location from '@/models/Location'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')

    let filter = { isActive: true } // Only show active screens for public

    // Apply location filter if provided
    if (location) filter.location = location

    const screens = await Screen.find(filter)
      .populate('location', 'name address')
      .sort({ createdAt: -1 })
      .lean()

    // Transform screens for public consumption
    const publicScreens = screens.map(screen => ({
      id: screen._id.toString(),
      name: screen.name,
      description: screen.description,
      capacity: screen.capacity,
      location: screen.location || null,
      amenities: screen.amenities || [],
      pricePerHour: screen.pricePerHour,
      images: screen.images || []
    }))

    return NextResponse.json({
      success: true,
      screens: publicScreens
    })

  } catch (error) {
    console.error('Public screens error:', error)
    return NextResponse.json({ error: 'Failed to load screens' }, { status: 500 })
  }
}
