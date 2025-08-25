import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import TimeSlot from '@/models/TimeSlot'

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const slots = await TimeSlot.find()
      .sort({ startTime: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      slots: slots.map(slot => ({
        id: slot._id.toString(),
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive,
        createdAt: slot.createdAt
      }))
    })

  } catch (error) {
    console.error('Get slots error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { name, startTime, endTime } = await request.json()

    if (!name || !startTime || !endTime) {
      return NextResponse.json({ 
        error: 'Name, start time, and end time are required' 
      }, { status: 400 })
    }

    // Validate time format and logic
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ 
        error: 'Invalid time format. Use HH:MM format' 
      }, { status: 400 })
    }

    const slot = await TimeSlot.create({
      name: name.trim(),
      startTime,
      endTime,
      createdBy: user._id
    })

    return NextResponse.json({
      success: true,
      slot: {
        id: slot._id.toString(),
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime
      }
    })

  } catch (error) {
    console.error('Create slot error:', error)
    return NextResponse.json({ error: 'Failed to create time slot' }, { status: 500 })
  }
}
