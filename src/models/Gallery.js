import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen'
    // ✅ No required field - this makes it optional
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

// Indexes
gallerySchema.index({ location: 1, screen: 1 })
gallerySchema.index({ isActive: 1 })

// ✅ Force recreate the model to ensure schema changes take effect
delete mongoose.models.Gallery
const Gallery = mongoose.model('Gallery', gallerySchema)

export default Gallery
