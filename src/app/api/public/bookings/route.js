import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Screen from '@/models/Screen'
import Location from '@/models/Location'
import Event from '@/models/Event'
import { isSlotAvailable } from '@/lib/checkAvailability'
import { sendBookingConfirmationEmail } from '@/lib/email'

export async function POST(request) {
  try {
    await dbConnect()

    const {
      customerInfo,
      screen,
      location,
      bookingDate,
      timeSlot,
      eventType,
      eventId,
      numberOfGuests,
      specialRequests
    } = await request.json()

    // Validate required fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone ||
        !screen || !location || !bookingDate || !timeSlot) {
      return NextResponse.json({ error: 'Missing required booking information' }, { status: 400 })
    }

    // ✅ Check slot availability before creating booking
    const slotAvailable = await isSlotAvailable({
      screenId: screen,
      date: bookingDate,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime
    })

    if (!slotAvailable) {
      return NextResponse.json({ 
        error: 'Selected time slot is no longer available. Please choose a different time.' 
      }, { status: 409 })
    }

    // Get screen, location, and event details for pricing and email
    const [screenInfo, locationInfo, eventInfo] = await Promise.all([
      Screen.findById(screen).lean(),
      Location.findById(location).lean(),
      eventId ? Event.findById(eventId).lean() : null
    ])

    if (!screenInfo || !locationInfo) {
      return NextResponse.json({ error: 'Invalid screen or location' }, { status: 400 })
    }

    // ✅ FIXED: Proper number validation and calculation
    const screenPricePerHour = Number(screenInfo.pricePerHour) || 0
    const slotDuration = Number(timeSlot.duration) || 0
    const eventBasePrice = eventInfo ? Number(eventInfo.basePrice) || 0 : 0

    // Validate that we have valid numbers
    if (screenPricePerHour <= 0 || slotDuration <= 0) {
      return NextResponse.json({ 
        error: 'Invalid pricing information. Please contact support.' 
      }, { status: 400 })
    }

    // Calculate pricing with proper number handling
    const screenRental = screenPricePerHour * slotDuration
    const basePrice = eventBasePrice
    const eventPackage = eventBasePrice
    const totalAmount = screenRental + eventPackage

    // ✅ Debug logging to identify NaN issues
    console.log('Pricing calculation:', {
      screenPricePerHour,
      slotDuration,
      eventBasePrice,
      screenRental,
      basePrice,
      totalAmount
    })

    // Ensure no NaN values
    if (isNaN(screenRental) || isNaN(basePrice) || isNaN(totalAmount)) {
      console.error('NaN detected in pricing calculation:', {
        screenRental: isNaN(screenRental),
        basePrice: isNaN(basePrice),
        totalAmount: isNaN(totalAmount)
      })
      return NextResponse.json({ 
        error: 'Pricing calculation error. Please contact support.' 
      }, { status: 400 })
    }

    // ✅ Create booking data matching YOUR exact schema
    const bookingData = {
      customerInfo: {
        name: customerInfo.name.trim(),
        email: customerInfo.email.toLowerCase().trim(),
        phone: customerInfo.phone.trim(),
        alternatePhone: customerInfo.alternatePhone?.trim()
      },
      screen,
      location,
      bookingDate: new Date(bookingDate),
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        duration: slotDuration,
        name: timeSlot.name
      },
      eventType: eventType || 'Movie Night',
      eventId: eventId || undefined,
      numberOfGuests: Number(numberOfGuests) || 1,
      specialRequests: {
        decorations: Boolean(specialRequests?.decorations),
        cake: Boolean(specialRequests?.cake),
        photography: Boolean(specialRequests?.photography),
        customMessage: specialRequests?.customMessage?.trim() || undefined
      },
      // ✅ Pricing object with validated numbers
      pricing: {
        basePrice: basePrice,           // Required field - event price
        screenRental: screenRental,     // Required field - screen rental cost
        eventPackage: eventPackage,     // Event package cost
        totalAmount: totalAmount,       // Required field - total cost
        additionalCharges: [],          // Empty array as default
        discountApplied: {
          amount: 0                     // Default 0 discount
        }
      },
      // ✅ PaymentInfo with validated numbers
      paymentInfo: {
        method: 'cash',
        advancePaid: 0,
        remainingAmount: totalAmount,   // Required field - validated number
        paymentStatus: 'pending',
        paymentNote: 'Payment to be collected at the venue. UPI, Cards, and Cash accepted.'
      },
      bookingStatus: 'confirmed',
      bookingSource: 'website'
    }

    // ✅ Create new booking - your pre-save middleware will handle bookingId
    const newBooking = new Booking(bookingData)
    
    // ✅ Save the booking
    let savedBooking
    try {
      savedBooking = await newBooking.save()
    } catch (dbError) {
      console.error('Database save error:', dbError)
      
      // Handle duplicate booking
      if (dbError.code === 11000) {
        return NextResponse.json({ 
          error: 'This time slot was just booked by another customer. Please select a different time.' 
        }, { status: 409 })
      }
      
      // Handle validation errors
      if (dbError.name === 'ValidationError') {
        const errors = Object.values(dbError.errors).map(err => err.message)
        console.error('Validation errors:', errors)
        return NextResponse.json({ 
          error: `Validation failed: ${errors.join(', ')}` 
        }, { status: 400 })
      }
      
      throw dbError
    }

    // ✅ Prepare booking data for email
    const bookingForEmail = {
      bookingId: savedBooking.bookingId,
      customerInfo: savedBooking.customerInfo,
      screen: screenInfo,
      location: locationInfo,
      bookingDate: savedBooking.bookingDate,
      timeSlot: savedBooking.timeSlot,
      eventType: savedBooking.eventType,
      numberOfGuests: savedBooking.numberOfGuests,
      specialRequests: savedBooking.specialRequests,
      pricing: savedBooking.pricing,
      bookingStatus: savedBooking.bookingStatus
    }

    // ✅ Send confirmation email
    try {
      await sendBookingConfirmationEmail(
        savedBooking.customerInfo,
        bookingForEmail
      )
      console.log('✅ Confirmation email sent to:', savedBooking.customerInfo.email)
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError)
      // Don't fail the booking if email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully! Confirmation email has been sent.',
      booking: {
        bookingId: savedBooking.bookingId,
        customerInfo: savedBooking.customerInfo,
        screen: screenInfo.name,
        location: locationInfo.name,
        date: savedBooking.bookingDate,
        timeSlot: savedBooking.timeSlot,
        eventType: savedBooking.eventType,
        numberOfGuests: savedBooking.numberOfGuests,
        pricing: savedBooking.pricing,
        status: savedBooking.bookingStatus
      }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'This time slot was just booked by another customer. Please select a different time.' 
      }, { status: 409 })
    }

    return NextResponse.json({ 
      error: 'Failed to create booking. Please try again.' 
    }, { status: 500 })
  }
}
