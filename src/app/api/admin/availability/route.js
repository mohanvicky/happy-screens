import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Booking from '@/models/Booking'
import Screen from '@/models/Screen'

// Check availability for specific date, location, and time slots
export async function GET(request) {
  try {
    await requireAuth(request)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const date = searchParams.get('date')
    const screen = searchParams.get('screen')

    if (!location || !date) {
      return NextResponse.json({ 
        error: 'Location and date are required' 
      }, { status: 400 })
    }

    let screenFilter = { location, isActive: true }
    if (screen) screenFilter._id = screen

    // Get all screens for the location
    const screens = await Screen.find(screenFilter).lean()

    // Get all confirmed bookings for the date
    const bookings = await Booking.find({
      location,
      bookingDate: new Date(date),
      bookingStatus: 'confirmed',
      ...(screen && { screen })
    }).lean()

    // Common time slots
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
        availableSlots,
        bookedSlots: screenBookings.map(booking => ({
          startTime: booking.timeSlot.startTime,
          endTime: booking.timeSlot.endTime,
          bookingId: booking.bookingId,
          customerName: booking.customerInfo.name
        }))
      }
    })

    return NextResponse.json({
      success: true,
      date,
      location,
      availability
    })

  } catch (error) {
    console.error('Check availability error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}
