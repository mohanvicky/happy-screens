import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/adminAuth'
import { uploadFile } from '@/lib/supabase' // Your existing Supabase utility

export async function POST(request) {
  try {
    await requireSuperAdmin(request)

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

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    // Upload to Supabase using your existing utility
    const uploadResult = await uploadFile(file, 'screens')

    if (!uploadResult.success) {
      console.error('Supabase upload error:', uploadResult.error)
      return NextResponse.json({ 
        error: uploadResult.error || 'Failed to upload image' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      image: {
        url: uploadResult.url,
        path: uploadResult.path, // Store path for potential deletion
        alt: alt || file.name,
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
