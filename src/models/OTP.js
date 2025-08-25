import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    minlength: [6, 'OTP must be 6 digits'],
    maxlength: [6, 'OTP must be 6 digits']
  },
  purpose: {
    type: String,
    enum: ['password_reset', 'admin_creation', 'account_verification'],
    required: [true, 'Purpose is required']
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Target user ID is required']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester ID is required']
  },
  attempts: {
    type: Number,
    default: 0,
    max: [3, 'Maximum 3 attempts allowed']
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry time is required'],
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Indexes for better performance and TTL
otpSchema.index({ email: 1 })
otpSchema.index({ targetUserId: 1 })
otpSchema.index({ purpose: 1 })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }) // Cleanup after 1 hour

// Virtual for checking if OTP is expired
otpSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date()
})

// Virtual for checking if OTP is valid (not expired, not used, attempts left)
otpSchema.virtual('isValid').get(function() {
  return !this.isExpired && !this.isUsed && this.attempts < this.maxAttempts
})

// Pre-save middleware to hash OTP
otpSchema.pre('save', async function(next) {
  // Only hash the OTP if it has been modified (or is new)
  if (!this.isModified('otp')) return next()

  try {
    // Hash OTP with cost of 10 (faster than password hashing)
    const salt = await bcrypt.genSalt(10)
    this.otp = await bcrypt.hash(this.otp, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to verify OTP
otpSchema.methods.verifyOTP = async function(candidateOTP) {
  try {
    // Check if OTP is valid
    if (!this.isValid) {
      throw new Error('OTP is expired, used, or maximum attempts exceeded')
    }
    
    // Compare OTP
    const isMatch = await bcrypt.compare(candidateOTP.toString(), this.otp)
    
    if (!isMatch) {
      // Increment attempts
      this.attempts += 1
      await this.save()
      throw new Error('Invalid OTP')
    }
    
    return true
  } catch (error) {
    throw error
  }
}

// Instance method to mark OTP as used
otpSchema.methods.markAsUsed = async function() {
  this.isUsed = true
  this.usedAt = new Date()
  return this.save()
}

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Static method to create new OTP
otpSchema.statics.createOTP = async function(data) {
  const { email, purpose, targetUserId, requestedBy, ipAddress, userAgent } = data
  
  // Generate 6-digit OTP
  const otp = this.generateOTP()
  
  // Create new OTP record
  const otpRecord = new this({
    email,
    otp,
    purpose,
    targetUserId,
    requestedBy,
    ipAddress,
    userAgent
  })
  
  await otpRecord.save()
  
  // Return the plain OTP for sending via email
  return {
    record: otpRecord,
    plainOTP: otp
  }
}

// Static method to find valid OTP
otpSchema.statics.findValidOTP = async function(email, purpose, targetUserId) {
  return this.findOne({
    email,
    purpose,
    targetUserId,
    isUsed: false,
    expiresAt: { $gte: new Date() },
    attempts: { $lt: 3 }
  }).populate('targetUserId requestedBy', 'username email role')
}

// Static method to cleanup expired OTPs
otpSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true },
      { attempts: { $gte: 3 } }
    ]
  })
}

// Static method to check rate limiting
otpSchema.statics.checkRateLimit = async function(email, purpose, timeWindow = 3600000) {
  const windowStart = new Date(Date.now() - timeWindow) // 1 hour ago
  
  const recentOTPs = await this.countDocuments({
    email,
    purpose,
    createdAt: { $gte: windowStart }
  })
  
  return {
    count: recentOTPs,
    isLimited: recentOTPs >= 3, // Max 3 OTPs per hour
    resetTime: new Date(windowStart.getTime() + timeWindow)
  }
}

const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema)

export default OTP
