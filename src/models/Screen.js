import mongoose from 'mongoose'

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Screen name is required'],
    trim: true,
    maxlength: [100, 'Screen name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [50, 'Capacity cannot exceed 50']
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  amenities: [{
    type: String,
    enum: [
      'AC', 'Projector', 'Sound System', 'Comfortable Seating', 
      'WiFi', 'Snacks Available', 'Decorations Allowed',
      'Gaming Console', 'Karaoke', 'LED TV'
    ]
  }],
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    url: { type: String, required: true },
    path: { type: String }, // ✅ Add this for Supabase file path
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes
screenSchema.index({ location: 1 })
screenSchema.index({ isActive: 1 })
screenSchema.index({ pricePerHour: 1 })
screenSchema.index({ capacity: 1 })

// ✅ Add unique compound index to prevent duplicate screen names per location
screenSchema.index({ name: 1, location: 1 }, { unique: true })

// ✅ Virtual to get primary image
screenSchema.virtual('primaryImage').get(function() {
  return this.images.find(img => img.isPrimary) || this.images[0]
})

const Screen = mongoose.models.Screen || mongoose.model('Screen', screenSchema)

export default Screen
