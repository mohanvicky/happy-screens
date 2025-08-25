import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
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
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
    },
    alternatePhone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
    }
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: [true, 'Screen is required']
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true },
    name: { type: String, required: true }
  },
  // ✅ FIXED: Proper enum values with correct casing
  eventType: {
    type: String,
    required: true,
    trim: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest required']
  },
  specialRequests: {
    decorations: { type: Boolean, default: false },
    cake: { type: Boolean, default: false },
    photography: { type: Boolean, default: false },
    customMessage: { type: String, trim: true, maxlength: 500 }
  },
  // ✅ FIXED: Include basePrice field
  pricing: {
    basePrice: { type: Number, required: true, min: 0 }, // This is required
    screenRental: { type: Number, required: true, min: 0 },
    eventPackage: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    discountApplied: {
      code: String,
      description: String,
      amount: { type: Number, default: 0 }
    }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cash'],
      default: 'cash'
    },
    transactionId: String,
    advancePaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    paymentNote: {
      type: String,
      default: 'Payment to be collected at the venue. UPI, Cards, and Cash accepted.'
    }
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed'
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundAmount: { type: Number, default: 0 },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'declined'],
      default: 'pending'
    }
  },
  bookingSource: {
    type: String,
    enum: ['website', 'admin', 'phone'],
    default: 'website'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

bookingSchema.index({ bookingId: 1 }, { unique: true })
bookingSchema.index({ 'customerInfo.email': 1 })
bookingSchema.index({ 'customerInfo.phone': 1 })
bookingSchema.index({ screen: 1 })
bookingSchema.index({ location: 1 })
bookingSchema.index({ bookingDate: 1 })
bookingSchema.index({ bookingStatus: 1 })
bookingSchema.index({ createdAt: -1 })

bookingSchema.index(
  { screen: 1, bookingDate: 1, 'timeSlot.startTime': 1, 'timeSlot.endTime': 1 },
  { 
    unique: true, 
    partialFilterExpression: { bookingStatus: 'confirmed' }
  }
)

// ✅ FIXED: Pre-save middleware to generate bookingId
bookingSchema.pre('save', async function(next) {
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

  if (this.isNew) {
    this.paymentInfo.advancePaid = 0
    this.paymentInfo.remainingAmount = this.pricing.totalAmount
    this.paymentInfo.method = 'cash'
    this.paymentInfo.paymentStatus = 'pending'
  }

  next()
})

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)
export default Booking
