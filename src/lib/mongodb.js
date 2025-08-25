// src/lib/mongodb.js
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('⚠️  Please define the MONGODB_URI env variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across
 * hot-reloads in development. This prevents new connections
 * being created on every HMR update.
 */
let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export default async function dbConnect () {
  if (cached.conn) return cached.conn      // already connected

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // Recommended Mongoose options
        autoIndex: true,            // build indexes defined in models
        maxPoolSize: 10,            // maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      })
      .then((mongoose) => mongoose)
  }

  cached.conn = await cached.promise
  return cached.conn
}
