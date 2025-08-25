import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function isSlotAvailable({ screenId, date, startTime, endTime }) {
  await dbConnect()

  // Check for overlapping bookings
  const existingBooking = await Booking.findOne({
    screen: screenId,
    bookingDate: new Date(date),
    bookingStatus: { $in: ['confirmed', 'pending'] }, // Only check confirmed/pending bookings
    $or: [
      // Case 1: New booking starts during existing booking
      {
        $and: [
          { 'timeSlot.startTime': { $lte: startTime } },
          { 'timeSlot.endTime': { $gt: startTime } }
        ]
      },
      // Case 2: New booking ends during existing booking
      {
        $and: [
          { 'timeSlot.startTime': { $lt: endTime } },
          { 'timeSlot.endTime': { $gte: endTime } }
        ]
      },
      // Case 3: New booking completely overlaps existing booking
      {
        $and: [
          { 'timeSlot.startTime': { $gte: startTime } },
          { 'timeSlot.endTime': { $lte: endTime } }
        ]
      },
      // Case 4: Exact time match
      {
        $and: [
          { 'timeSlot.startTime': startTime },
          { 'timeSlot.endTime': endTime }
        ]
      }
    ]
  })

  return !existingBooking // Returns true if slot is available
}

export async function getUnavailableSlots({ screenId, date }) {
  await dbConnect()

  const bookedSlots = await Booking.find({
    screen: screenId,
    bookingDate: new Date(date),
    bookingStatus: { $in: ['confirmed', 'pending'] }
  }).select('timeSlot').lean()

  return bookedSlots.map(booking => booking.timeSlot)
}
