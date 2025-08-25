import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Event from '@/models/Event'

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const events = await Event.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      events: events.map(event => ({
        id: event._id.toString(),
        name: event.name,
        description: event.description,
        category: event.category,
        duration: event.duration,
        maxCapacity: event.maxCapacity,
        pricing: event.pricing,
        isActive: event.isActive,
        createdBy: event.createdBy,
        createdAt: event.createdAt
      }))
    })

  } catch (error) {
    console.error('Get events error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { name, description, category, duration, maxCapacity, pricing } = await request.json()

    if (!name || !category || !duration || !pricing?.basePrice) {
      return NextResponse.json({ 
        error: 'Name, category, duration, and base price are required' 
      }, { status: 400 })
    }

    const event = await Event.create({
      name: name.trim(),
      description: description?.trim(),
      category: category.trim(),
      duration: parseInt(duration),
      maxCapacity: parseInt(maxCapacity) || 10,
      pricing: {
        basePrice: parseFloat(pricing.basePrice),
        currency: pricing.currency || 'INR'
      },
      createdBy: user._id
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event._id.toString(),
        name: event.name,
        category: event.category,
        duration: event.duration,
        pricing: event.pricing
      }
    })

  } catch (error) {
    console.error('Create event error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'An event with this name already exists' 
      }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
