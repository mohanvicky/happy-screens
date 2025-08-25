import mongoose from 'mongoose'

const timeSlotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // e.g., "Morning Show", "Afternoon Slot"
  },
  startTime: {
    type: String,
    required: true, // Format: "HH:MM" e.g., "10:00"
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// ✅ FIXED: Virtual to calculate duration in minutes
timeSlotSchema.virtual('duration').get(function() {
  const start = this.startTime.split(':').map(Number)
  const end = this.endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1] // ✅ Fixed: was start[48]
  const endMinutes = end[0] * 60 + end[1]       // ✅ Fixed: was end[48]
  return Math.round((endMinutes - startMinutes) / 60 * 100) / 100 // Duration in hours
})

timeSlotSchema.index({ startTime: 1, endTime: 1 })
timeSlotSchema.index({ isActive: 1 })

const TimeSlot = mongoose.models.TimeSlot || mongoose.model('TimeSlot', timeSlotSchema)
export default TimeSlot
