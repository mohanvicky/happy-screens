import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'admin',
    required: true
  },
  assignedLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'admin'
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
    max: 10
  },
  accountLockedUntil: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// // Indexes for better performance
// userSchema.index({ username: 1 })
// userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ createdBy: 1 })

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now())
})

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    
    // Set password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = new Date()
    }
    
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(username, password) {
  const user = await this.findOne({ 
    username: username.toLowerCase(),
    isActive: true 
  })
  
  if (!user) {
    throw new Error('Invalid credentials')
  }
  
  // Check if account is locked
  if (user.isLocked) {
    throw new Error('Account is temporarily locked')
  }
  
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new Error('Invalid credentials')
  }
  
  return user
}

// Static method to increment failed login attempts
userSchema.statics.incrementFailedAttempts = async function(userId) {
  const user = await this.findById(userId)
  if (!user) return
  
  const updates = { $inc: { failedLoginAttempts: 1 } }
  
  // Lock account if too many failed attempts
  if (user.failedLoginAttempts >= 4) {
    updates.$set = {
      accountLockedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    }
  }
  
  return this.updateOne({ _id: userId }, updates)
}

// Static method to reset failed attempts
userSchema.statics.resetFailedAttempts = async function(userId) {
  return this.updateOne(
    { _id: userId },
    {
      $unset: { accountLockedUntil: 1 },
      $set: { failedLoginAttempts: 0, lastLogin: new Date() }
    }
  )
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
