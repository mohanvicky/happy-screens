import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import { uploadFile } from '@/lib/supabase'
import Gallery from '@/models/Gallery'

export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const formData = await request.formData()
    const file = formData.get('image')
    const alt = formData.get('alt') || ''
    const location = formData.get('location') || ''
    const screen = formData.get('screen') || null // ✅ Fixed: proper null handling

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (adjust as needed)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 })
    }

    // Upload to Supabase
    console.log('Uploading file to Supabase:', file.name)
    const uploadResult = await uploadFile(file, 'gallery')

    if (!uploadResult.success) {
      console.error('Supabase upload error:', uploadResult.error)
      return NextResponse.json({ 
        error: uploadResult.error || 'Failed to upload image' 
      }, { status: 500 })
    }

    console.log('File uploaded to Supabase:', uploadResult)
    console.log('screen value:', screen)

    // ✅ Fixed: Only save fields that exist in your schema
    const galleryData = {
      title: file.name,
      description: alt,
      imageUrl: uploadResult.url, // ✅ This matches your schema
      location,
      screen: screen || null, // ✅ Optional field
      isActive: true,
      createdBy: user._id
    }

    console.log('Creating gallery entry with data:', galleryData)
    
    // Save to database
    const galleryItem = await Gallery.create(galleryData)

    return NextResponse.json({
      success: true,
      image: {
        id: galleryItem._id.toString(),
        url: galleryItem.imageUrl, // ✅ Return imageUrl not url
        title: galleryItem.title,
        description: galleryItem.description
      }
    })

  } catch (error) {
    console.error('Gallery image upload error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json({ 
        error: 'Validation failed: ' + validationErrors.join(', ')
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 })
  }
}
