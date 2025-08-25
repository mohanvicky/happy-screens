import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/models/Event'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let filter = { isActive: true }
    if (category) filter.category = category

    const events = await Event.find(filter)
      .select('name description category duration maxCapacity pricing')
      .sort({ name: 1 })
      .lean()

    const publicEvents = events.map(event => ({
      id: event._id.toString(),
      name: event.name,
      description: event.description,
      category: event.category,
      duration: event.duration, // in minutes
      maxCapacity: event.maxCapacity,
      basePrice: event.pricing.basePrice,
      currency: event.pricing.currency
    }))

    return NextResponse.json({
      success: true,
      events: publicEvents
    })

  } catch (error) {
    console.error('Public events error:', error)
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 })
  }
}
