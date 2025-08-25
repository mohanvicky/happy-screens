import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Booking from '@/models/Booking'
import Screen from '@/models/Screen'
import Location from '@/models/Location'

// Get all bookings with filters
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filter = {}

    // For non-super admins, only show bookings from their assigned locations
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      filter.location = { $in: userLocationIds }
    }

    // Apply filters
    if (location) filter.location = location
    if (screen) filter.screen = screen
    if (status) filter.bookingStatus = status

    // Date range filter
    if (startDate || endDate) {
      filter.bookingDate = {}
      if (startDate) filter.bookingDate.$gte = new Date(startDate)
      if (endDate) filter.bookingDate.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    const [bookings, totalCount] = await Promise.all([
      Booking.find(filter)
        .populate('screen', 'name capacity')
        .populate('location', 'name address')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter)
    ])

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
      createdBy: booking.createdBy,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
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
