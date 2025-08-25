import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

// ✅ FIXED: Import all models that will be populated
import Gallery from '@/models/Gallery'
import Location from '@/models/Location'  // Add this import
import Screen from '@/models/Screen'      // Add this import (even if not using it now)

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const screen = searchParams.get('screen')

    let filter = { isActive: true } // Only show active images for public

    // Apply filters if provided
    if (location) filter.location = location
    if (screen) filter.screen = screen

    const images = await Gallery.find(filter)
      .populate('location', 'name')
      .populate('screen', 'name')  // Now this will work too
      .sort({ createdAt: -1 })
      .lean()

    // Transform images for public consumption
    const publicImages = images
      .filter(image => image.imageUrl && image.imageUrl.includes('supabase.co'))
      .map(image => ({
        id: image._id.toString(),
        title: image.title || '',
        url: image.imageUrl,
        alt: image.description || image.title || '',
        location: image.location || null,
        screen: image.screen || null,
        createdAt: image.createdAt
      }))

    return NextResponse.json({
      success: true,
      images: publicImages
    })

  } catch (error) {
    console.error('Public gallery error:', error)
    return NextResponse.json({ error: 'Failed to load images' }, { status: 500 })
  }
}
