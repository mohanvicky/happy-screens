import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function verifyAdminToken(request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

export function createJWT(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()
    
    const user = await User.findById(decoded.userId)
      .populate('assignedLocations', 'name')
      .lean()
    return user
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function requireAuth(request) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireSuperAdmin(request) {
  const user = await requireAuth(request)
  console.log('user', user);
  
  if (user.role !== 'super_admin') {
    throw new Error('Super Admin access required')
  }
  return user
}
