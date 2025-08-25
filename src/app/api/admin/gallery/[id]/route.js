import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Gallery from '@/models/Gallery'
import { deleteFile } from '@/lib/supabase' // Your existing Supabase utility

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const galleryItem = await Gallery.findById(params.id)
    
    if (!galleryItem) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      
      if (!userLocationIds.includes(galleryItem.location.toString())) {
        return NextResponse.json({ 
          error: 'You can only delete images from your assigned locations' 
        }, { status: 403 })
      }
    }

    // Delete file from Supabase storage using your existing utility
    if (galleryItem.path) {
      try {
        const deleteResult = await deleteFile(galleryItem.path)
        if (!deleteResult.success) {
          console.warn('Failed to delete from Supabase storage:', deleteResult.error)
          // Continue with database deletion even if file deletion fails
        }
      } catch (e) {
        console.warn('Error deleting file from storage:', e.message)
        // Continue with database deletion
      }
    }

    // Delete from database
    await Gallery.findByIdAndDelete(params.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    })

  } catch (error) {
    console.error('Gallery DELETE error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}
