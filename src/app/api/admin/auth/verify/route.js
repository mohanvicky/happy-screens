import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/adminAuth'

export async function GET(request) {
  try {
    const user = await verifyAdminToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        assignedLocations: user.assignedLocations || []
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
