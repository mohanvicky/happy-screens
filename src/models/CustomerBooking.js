import mongoose from 'mongoose'

const customerBookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  customerInfo: {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: { 
      type: String, 
      required: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    }
  },
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
  assignedScreen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen'
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
  numberOfGuests: {
    type: Number,
    required: true,
    min: [1, 'At least 1 guest required']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed'
  },
  assignedAt: Date,
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Prevent overbooking - compound index
customerBookingSchema.index(
  { event: 1, location: 1, timeSlot: 1, date: 1 }
)

// Auto-generate booking ID
customerBookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingId) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    
    const lastBooking = await this.constructor.findOne({
      bookingId: new RegExp(`^HS${year}${month}${day}`)
    }).sort({ bookingId: -1 })
    
    let sequence = 1
    if (lastBooking) {
      const lastSequence = parseInt(lastBooking.bookingId.slice(-3))
      sequence = lastSequence + 1
    }
    
    this.bookingId = `HS${year}${month}${day}${sequence.toString().padStart(3, '0')}`
  }
  next()
})

const CustomerBooking = mongoose.models.CustomerBooking || mongoose.model('CustomerBooking', customerBookingSchema)
export default CustomerBooking
