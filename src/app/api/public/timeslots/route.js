import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import TimeSlot from '@/models/TimeSlot'
import Booking from '@/models/Booking'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const screen = searchParams.get('screen')
    const date = searchParams.get('date')

    if (!screen || !date) {
      return NextResponse.json({ error: 'Screen and date are required' }, { status: 400 })
    }

    // Get all active time slots
    const timeSlots = await TimeSlot.find({
      isActive: true
    }).sort({ startTime: 1 }).lean()

    if (timeSlots.length === 0) {
      return NextResponse.json({ timeSlots: [] })
    }

    // ✅ Get existing bookings for this screen and date
    const bookingDate = new Date(date)
    const existingBookings = await Booking.find({
      screen,
      bookingDate,
      bookingStatus: { $in: ['confirmed', 'pending'] } // Only confirmed/pending bookings
    }).lean()

    // ✅ Filter out booked slots with exact time matching
    const availableSlots = timeSlots.filter(slot => {
      return !existingBookings.some(booking => 
        booking.timeSlot.startTime === slot.startTime &&
        booking.timeSlot.endTime === slot.endTime
      )
    })

    return NextResponse.json({
      success: true,
      timeSlots: availableSlots.map(slot => ({
        id: slot._id.toString(),
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: calculateDuration(slot.startTime, slot.endTime)
      }))
    })

  } catch (error) {
    console.error('Public time slots error:', error)
    return NextResponse.json({ error: 'Failed to load time slots' }, { status: 500 })
  }
}

// Helper function to calculate duration in hours
function calculateDuration(startTime, endTime) {
  const start = startTime.split(':').map(Number)
  const end = endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  return Math.round((endMinutes - startMinutes) / 60 * 100) / 100
}
