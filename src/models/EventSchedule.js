import mongoose from 'mongoose'

const eventScheduleSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  timeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  date: {
    type: Date,
    required: true
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
  timestamps: true
})

// Unique index to prevent duplicate scheduling of same screen for same slot on same date
eventScheduleSchema.index(
  { screen: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
)

eventScheduleSchema.index({ location: 1, date: 1 })
eventScheduleSchema.index({ event: 1, date: 1 })

const EventSchedule = mongoose.models.EventSchedule || mongoose.model('EventSchedule', eventScheduleSchema)
export default EventSchedule
