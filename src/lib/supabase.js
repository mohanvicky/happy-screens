import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Updated upload function for Happy Screens media
export const uploadFile = async (file, folder = 'screens') => {
  try {
    const fileName = generateFileName(file.name, folder)
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from('happy-screens-media') // Your bucket name
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Supabase upload error:', error)
      throw error
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('happy-screens-media')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

// Helper function to generate unique filename
export const generateFileName = (originalName, folder) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${folder}_${timestamp}_${randomString}.${extension}`
}

// Function to delete file
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('happy-screens-media')
      .remove([filePath])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: error.message }
  }
}
