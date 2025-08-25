import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { requireAuth } from '@/lib/adminAuth'

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const screen = searchParams.get('screen')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // ✅ Build query with location restrictions
    let query = {}

    // ✅ Filter by user's assigned locations (unless super admin)
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      query.location = { $in: userLocationIds }
    }

    // Apply additional filters
    if (location) query.location = location
    if (screen) query.screen = screen
    if (status) query.bookingStatus = status
    
    if (startDate || endDate) {
      query.bookingDate = {}
      if (startDate) query.bookingDate.$gte = new Date(startDate)
      if (endDate) query.bookingDate.$lte = new Date(endDate)
    }

    const bookings = await Booking.find(query)
      .populate(['screen', 'location', 'createdBy', 'lastModifiedBy'])
      .sort({ createdAt: -1 })
      .lean()

    const transformedBookings = bookings.map(booking => ({
      id: booking._id.toString(),
      bookingId: booking.bookingId,
      customerInfo: booking.customerInfo,
      screen: booking.screen,
      location: booking.location,
      bookingDate: booking.bookingDate,
      timeSlot: booking.timeSlot,
      eventType: booking.eventType,
      numberOfGuests: booking.numberOfGuests,
      specialRequests: booking.specialRequests,
      pricing: booking.pricing,
      paymentInfo: booking.paymentInfo,
      bookingStatus: booking.bookingStatus,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    return NextResponse.json({ 
      success: true, 
      bookings: transformedBookings 
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}


// Create new booking
export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const bookingData = await request.json()

    // Validate required fields
    if (!bookingData.customerInfo?.name || !bookingData.customerInfo?.email || 
        !bookingData.customerInfo?.phone || !bookingData.screen || 
        !bookingData.location || !bookingData.bookingDate || 
        !bookingData.timeSlot || !bookingData.eventType) {
      return NextResponse.json({ 
        error: 'Missing required booking information' 
      }, { status: 400 })
    }

    // Check screen availability for the requested time slot
    const existingBooking = await Booking.findOne({
      screen: bookingData.screen,
      bookingDate: new Date(bookingData.bookingDate),
      'timeSlot.startTime': bookingData.timeSlot.startTime,
      'timeSlot.endTime': bookingData.timeSlot.endTime,
      bookingStatus: 'confirmed'
    })

    if (existingBooking) {
      return NextResponse.json({ 
        error: 'Screen is already booked for this time slot' 
      }, { status: 409 })
    }

    // Get screen details for pricing
    const screen = await Screen.findById(bookingData.screen)
    if (!screen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    // Calculate pricing
    const duration = bookingData.timeSlot.duration
    const basePrice = screen.pricePerHour * duration
    const totalAmount = basePrice + (bookingData.pricing?.additionalCharges?.reduce((sum, charge) => sum + charge.amount, 0) || 0)

    const booking = await Booking.create({
      ...bookingData,
      pricing: {
        basePrice,
        additionalCharges: bookingData.pricing?.additionalCharges || [],
        discountApplied: bookingData.pricing?.discountApplied || { amount: 0 },
        totalAmount
      },
      paymentInfo: {
        ...bookingData.paymentInfo,
        remainingAmount: totalAmount - (bookingData.paymentInfo?.advancePaid || 0)
      },
      createdBy: user._id
    })

    await booking.populate(['screen', 'location', 'createdBy'])

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        bookingId: booking.bookingId,
        customerInfo: booking.customerInfo,
        totalAmount: booking.pricing.totalAmount,
        bookingStatus: booking.bookingStatus
      }
    })

  } catch (error) {
    console.error('Create booking error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'This time slot is already booked' 
      }, { status: 409 })
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
