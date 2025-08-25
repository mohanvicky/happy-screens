import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: [15, 'Event duration must be at least 15 minutes']
  },
  maxCapacity: {
    type: Number,
    default: 10,
    min: [1, 'Max capacity must be at least 1']
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' }
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

eventSchema.index({ name: 1 })
eventSchema.index({ category: 1 })
eventSchema.index({ isActive: 1 })

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema)
export default Event
