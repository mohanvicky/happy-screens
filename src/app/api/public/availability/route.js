import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Screen from '@/models/Screen'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const date = searchParams.get('date')

    if (!location || !date) {
      return NextResponse.json({ 
        error: 'Location and date are required' 
      }, { status: 400 })
    }

    // Get active screens for the location
    const screens = await Screen.find({ 
      location, 
      isActive: true 
    }).select('name capacity pricePerHour amenities').lean()

    // Get confirmed bookings for the date
    const bookings = await Booking.find({
      location,
      bookingDate: new Date(date),
      bookingStatus: 'confirmed'
    }).lean()

    // Time slots
    const timeSlots = [
      { startTime: '09:00', endTime: '12:00', duration: 3, name: 'Morning Show' },
      { startTime: '12:30', endTime: '15:30', duration: 3, name: 'Afternoon Show' },
      { startTime: '16:00', endTime: '19:00', duration: 3, name: 'Evening Show' },
      { startTime: '19:30', endTime: '22:30', duration: 3, name: 'Night Show' }
    ]

    const availability = screens.map(screen => {
      const screenBookings = bookings.filter(booking => 
        booking.screen.toString() === screen._id.toString()
      )

      const availableSlots = timeSlots.filter(slot => {
        return !screenBookings.some(booking => 
          booking.timeSlot.startTime === slot.startTime && 
          booking.timeSlot.endTime === slot.endTime
        )
      })

      return {
        screen: {
          id: screen._id.toString(),
          name: screen.name,
          capacity: screen.capacity,
          pricePerHour: screen.pricePerHour,
          amenities: screen.amenities
        },
        availableSlots
      }
    })

    return NextResponse.json({
      success: true,
      date,
      location,
      availability
    })

  } catch (error) {
    console.error('Public availability error:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
