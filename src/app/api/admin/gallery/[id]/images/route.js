// src/app/api/admin/screens/[id]/images/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireSuperAdmin } from '@/lib/adminAuth'
import Screen from '@/models/Screen'
import { uploadFile } from '@/lib/supabase' // Your existing Supabase utility

export async function POST(request, { params }) {
  try {
    const user = await requireSuperAdmin(request)
    await dbConnect()

    const formData = await request.formData()
    const file = formData.get('image')
    const alt = formData.get('alt') || ''
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Find the screen
    const screen = await Screen.findById(params.id)
    if (!screen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    // Upload to Supabase using your existing utility
    const uploadResult = await uploadFile(file, 'screens')

    if (!uploadResult.success) {
      console.error('Supabase upload error:', uploadResult.error)
      return NextResponse.json({ 
        error: uploadResult.error || 'Failed to upload image' 
      }, { status: 500 })
    }

    // If this is primary, unset other primary images
    if (isPrimary) {
      screen.images.forEach(img => img.isPrimary = false)
    }

    // Add new image
    screen.images.push({
      url: uploadResult.url,
      path: uploadResult.path, // Store Supabase path for potential deletion
      alt: alt || `${screen.name} image`,
      isPrimary
    })

    screen.lastModifiedBy = user._id
    await screen.save()

    return NextResponse.json({
      success: true,
      image: {
        url: uploadResult.url,
        path: uploadResult.path,
        alt: alt || `${screen.name} image`,
        isPrimary
      }
    })

  } catch (error) {
    console.error('Screen image upload error:', error)
    
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Only super admin can upload images' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
