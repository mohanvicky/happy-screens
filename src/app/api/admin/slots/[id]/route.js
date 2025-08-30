import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import TimeSlot from '@/models/TimeSlot'

export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { name, startTime, endTime } = await request.json()

    // Validate fields...
    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, start time, and end time are required' }, 
        { status: 400 }
      )
    }

    // Optionally, validate time format here

    const updated = await TimeSlot.findByIdAndUpdate(
      params.id, 
      { name: name.trim(), startTime, endTime }, 
      { new: true }
    )
    if (!updated) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      slot: {
        id: updated._id.toString(),
        name: updated.name,
        startTime: updated.startTime,
        endTime: updated.endTime,
        isActive: updated.isActive,
        createdAt: updated.createdAt
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    await dbConnect()
    const { params } = await context         // ✅ await the context
    const deleted = await TimeSlot.findByIdAndDelete(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, id: deleted._id.toString() })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
