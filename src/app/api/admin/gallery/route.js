import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Gallery from '@/models/Gallery'
import { supabase } from '@/lib/supabase'

// Helper function to get public URL from Supabase path (if needed)
function getPublicImageUrl(path) {
  if (!path) return ''
  
  const { data } = supabase.storage
    .from('happy-screens-media') // Use your actual bucket name
    .getPublicUrl(path)
  
  return data?.publicUrl || ''
}

// Helper function to check if URL is from Supabase
function isSupabaseUrl(url) {
  if (!url) return false
  
  // Check if URL contains supabase domain or starts with http/https
  return url.includes('supabase.co') || url.startsWith('https://') || url.startsWith('http://')
}

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const screen = searchParams.get('screen')

    let filter = {}

    // For non-super admins, only show images from their assigned locations
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      filter.location = { $in: userLocationIds }
    }

    // Apply filters
    if (location) filter.location = location
    if (screen) filter.screen = screen

    const images = await Gallery.find(filter)
      .populate('location', 'name')
      .populate('screen', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean()
    
    console.log('Raw images from DB:', images);

    // ✅ FIXED: Transform images based on your actual data structure
    const transformedImages = images
      .map(image => {
        // Use imageUrl from your database directly since it's already a full Supabase URL
        const imageUrl = image.imageUrl || ''
        
        return {
          id: image._id.toString(),
          title: image.title || '',
          url: imageUrl, // ✅ Use imageUrl directly from DB
          alt: image.alt || image.title || '',
          location: image.location || null,
          screen: image.screen || null,
          createdBy: image.createdBy || null,
          createdAt: image.createdAt
        }
      })
      .filter(image => image.url && isSupabaseUrl(image.url)) // ✅ Only include valid Supabase URLs

    console.log('Transformed images:', transformedImages);

    return NextResponse.json({
      success: true,
      images: transformedImages
    })

  } catch (error) {
    console.error('Get gallery images error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const data = await request.json()
    const { url, alt, title, location, screen } = data

    if (!url || !location) {
      return NextResponse.json({ 
        error: 'Image URL and location are required' 
      }, { status: 400 })
    }

    // Only allow Supabase URLs
    if (!isSupabaseUrl(url)) {
      return NextResponse.json({ 
        error: 'Only external image URLs are allowed' 
      }, { status: 400 })
    }

    const galleryItem = await Gallery.create({
      title: title || alt || 'Untitled',
      imageUrl: url, // ✅ Store as imageUrl to match your schema
      alt: alt || '',
      location,
      screen: screen || null,
      createdBy: user._id
    })

    return NextResponse.json({
      success: true,
      image: {
        id: galleryItem._id.toString(),
        url: galleryItem.imageUrl,
        alt: galleryItem.alt,
        title: galleryItem.title
      }
    })

  } catch (error) {
    console.error('Create gallery image error:', error)
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 })
  }
}
