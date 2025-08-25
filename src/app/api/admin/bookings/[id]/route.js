import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Booking from '@/models/Booking'
import { sendBookingUpdateEmail, sendBookingCancellationEmail } from '@/lib/email'

// Get single booking
export async function GET(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const booking = await Booking.findById(params.id)
      .populate('screen', 'name capacity pricePerHour amenities')
      .populate('location', 'name address contactInfo')
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username')

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions for non-super admins
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      
      if (!userLocationIds.includes(booking.location._id.toString())) {
        return NextResponse.json({ 
          error: 'You can only view bookings from your assigned locations' 
        }, { status: 403 })
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
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
        cancellation: booking.cancellation,
        createdBy: booking.createdBy,
        lastModifiedBy: booking.lastModifiedBy,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    })

  } catch (error) {
    console.error('Get booking error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}

// Update booking
export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    // ✅ FIX: Await params to access properties
    const { id } = await params
    const updates = await request.json()

    const booking = await Booking.findById(id) // ✅ Now using awaited id
      .populate(['screen', 'location'])
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions for non-super admins
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      
      if (!userLocationIds.includes(booking.location._id.toString())) {
        return NextResponse.json({ 
          error: 'You can only update bookings from your assigned locations' 
        }, { status: 403 })
      }
    }

    // If changing time slot, check availability
    if (updates.timeSlot && (
        updates.timeSlot.startTime !== booking.timeSlot.startTime ||
        updates.timeSlot.endTime !== booking.timeSlot.endTime ||
        new Date(updates.bookingDate).getTime() !== booking.bookingDate.getTime()
    )) {
      const existingBooking = await Booking.findOne({
        _id: { $ne: id }, // ✅ Using awaited id
        screen: booking.screen._id,
        bookingDate: new Date(updates.bookingDate || booking.bookingDate),
        'timeSlot.startTime': updates.timeSlot.startTime,
        'timeSlot.endTime': updates.timeSlot.endTime,
        bookingStatus: 'confirmed'
      })

      if (existingBooking) {
        return NextResponse.json({ 
          error: 'Screen is already booked for this time slot' 
        }, { status: 409 })
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id, // ✅ Using awaited id
      {
        ...updates,
        lastModifiedBy: user._id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate(['screen', 'location', 'createdBy', 'lastModifiedBy'])

    // ✅ Send update email to customer (now properly imported)
    try {
      await sendBookingUpdateEmail(
        updatedBooking.customerInfo, 
        updatedBooking, 
        updates
      )
      console.log('✅ Update email sent successfully')
    } catch (emailError) {
      console.error('Failed to send update email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: {
        id: updatedBooking._id.toString(),
        bookingId: updatedBooking.bookingId,
        bookingStatus: updatedBooking.bookingStatus,
        customerInfo: updatedBooking.customerInfo
      }
    })

  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

// Cancel/Delete booking
export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    // ✅ FIX: Await params to access properties
    const { id } = await params
    const { reason, refundAmount } = await request.json()

    const booking = await Booking.findById(id) // ✅ Using awaited id
      .populate(['screen', 'location'])
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      
      if (!userLocationIds.includes(booking.location._id.toString())) {
        return NextResponse.json({ 
          error: 'You can only cancel bookings from your assigned locations' 
        }, { status: 403 })
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id, // ✅ Using awaited id
      {
        bookingStatus: 'cancelled',
        cancellation: {
          reason: reason || 'Cancelled by admin',
          cancelledAt: new Date(),
          cancelledBy: user._id,
          refundAmount: refundAmount || 0,
          refundStatus: refundAmount > 0 ? 'pending' : 'processed'
        },
        lastModifiedBy: user._id
      },
      { new: true }
    ).populate(['screen', 'location'])

    // ✅ Send cancellation email to customer (now properly imported)
    try {
      await sendBookingCancellationEmail(
        updatedBooking.customerInfo, 
        updatedBooking, 
        reason || 'Cancelled by admin',
        refundAmount || 0
      )
      console.log('✅ Cancellation email sent successfully')
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully and customer has been notified via email',
      booking: {
        id: updatedBooking._id.toString(),
        bookingId: updatedBooking.bookingId,
        bookingStatus: updatedBooking.bookingStatus
      }
    })

  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}