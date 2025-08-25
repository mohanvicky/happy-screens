import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Location from '@/models/Location'

export async function GET(request) {
  try {
    await dbConnect()
    
    console.log('Public locations API called') // Add this for debugging

    const locations = await Location.find({ isActive: true })
      .select('name address contactInfo facilities')
      .sort({ name: 1 })
      .lean()

    const publicLocations = locations.map(location => ({
      id: location._id.toString(),
      name: location.name,
      address: location.address,
      contactInfo: location.contactInfo,
      facilities: location.facilities,
      fullAddress: location.fullAddress
    }))

    return NextResponse.json({
      success: true,
      locations: publicLocations
    })

  } catch (error) {
    console.error('Public locations error:', error)
    return NextResponse.json({ error: 'Failed to load locations' }, { status: 500 })
  }
}
