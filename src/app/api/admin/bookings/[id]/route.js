import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { requireAuth } from '@/lib/auth'
import { sendBookingUpdateEmail, sendBookingCancellationEmail } from '@/lib/email'

export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { id } = await params
    const updates = await request.json()

    const booking = await Booking.findById(id)
      .populate(['screen', 'location'])
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // ✅ Check permissions for non-super admins
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

    // ✅ Handle nested object updates properly
    if (updates.eventType) booking.eventType = updates.eventType
    if (updates.numberOfGuests) booking.numberOfGuests = updates.numberOfGuests
    if (updates.bookingStatus) booking.bookingStatus = updates.bookingStatus
    if (updates.bookingDate) booking.bookingDate = new Date(updates.bookingDate)

    if (updates.timeSlot) {
      booking.timeSlot = {
        ...booking.timeSlot,
        ...updates.timeSlot
      }
    }

    if (updates.specialRequests) {
      booking.specialRequests = {
        decorations: updates.specialRequests.decorations ?? booking.specialRequests.decorations,
        cake: updates.specialRequests.cake ?? booking.specialRequests.cake,
        photography: updates.specialRequests.photography ?? booking.specialRequests.photography,
        customMessage: updates.specialRequests.customMessage ?? booking.specialRequests.customMessage
      }
      booking.markModified('specialRequests')
    }

    booking.lastModifiedBy = user._id
    const updatedBooking = await booking.save()

    // Send update email
    try {
      await sendBookingUpdateEmail(
        updatedBooking.customerInfo, 
        updatedBooking, 
        updates
      )
    } catch (emailError) {
      console.error('Failed to send update email:', emailError)
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

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { id } = await params
    const { reason, refundAmount } = await request.json()

    const booking = await Booking.findById(id)
      .populate(['screen', 'location'])
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // ✅ Check permissions
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
      id,
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

    // Send cancellation email
    try {
      await sendBookingCancellationEmail(
        updatedBooking.customerInfo, 
        updatedBooking, 
        reason || 'Cancelled by admin',
        refundAmount || 0
      )
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
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
