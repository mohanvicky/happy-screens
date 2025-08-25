import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Booking from '@/models/Booking'
import Screen from '@/models/Screen'
import Location from '@/models/Location'
import User from '@/models/User'

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    let stats = {}

    if (user.role === 'super_admin') {
      // Super admin sees everything
      const [bookings, screens, locations, admins, recentBookings] = await Promise.all([
        Booking.countDocuments(),
        Screen.countDocuments({ isActive: true }),
        Location.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'admin', isActive: true }),
        Booking.find()
          .populate('screen', 'name')
          .populate('location', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ])

      // Monthly revenue
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)
      
      const monthlyBookings = await Booking.aggregate([
        { 
          $match: { 
            createdAt: { $gte: currentMonth },
            bookingStatus: { $in: ['confirmed', 'completed'] }
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$pricing.totalAmount' } 
          } 
        }
      ])

      stats = {
        totalBookings: bookings,
        totalScreens: screens,
        totalLocations: locations,
        totalAdmins: admins,
        monthlyRevenue: monthlyBookings[0]?.total || 0,
        recentBookings
      }

      return NextResponse.json({ 
        success: true, 
        stats, 
        user: { 
          role: user.role, 
          username: user.username,
          assignedLocations: user.assignedLocations
        } 
      })
    } else {
      // Normal admin: extract location IDs and names properly
      const userLocationIds = user.assignedLocations.map(loc => {
        if (typeof loc === 'object' && loc._id) {
          return loc._id.toString()
        }
        return loc.toString()
      })

      // Extract location names for comma-separated string
      const locationNames = user.assignedLocations.map(loc => {
        if (typeof loc === 'object' && loc.name) {
          return loc.name
        }
        // If location is just an ID, we need to fetch the name
        return null
      }).filter(name => name !== null)

      // If we don't have location names (locations are just IDs), fetch them
      let finalLocationNames = locationNames
      if (locationNames.length === 0 && userLocationIds.length > 0) {
        const locationDocs = await Location.find({
          _id: { $in: userLocationIds.map(id => new mongoose.Types.ObjectId(id)) }
        }).select('name').lean()
        finalLocationNames = locationDocs.map(loc => loc.name)
      }

      const [bookings, screens, recentBookings] = await Promise.all([
        Booking.countDocuments({ 
          location: { $in: userLocationIds } 
        }),
        Screen.countDocuments({ 
          location: { $in: userLocationIds }, 
          isActive: true 
        }),
        Booking.find({ 
          location: { $in: userLocationIds } 
        })
          .populate('screen', 'name')
          .populate('location', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ])

      // Monthly revenue for assigned locations only
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)
      
      const monthlyBookings = await Booking.aggregate([
        { 
          $match: { 
            location: { 
              $in: userLocationIds.map(id => new mongoose.Types.ObjectId(id)) 
            },
            createdAt: { $gte: currentMonth },
            bookingStatus: { $in: ['confirmed', 'completed'] }
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$pricing.totalAmount' } 
          } 
        }
      ])

      stats = {
        totalBookings: bookings,
        totalScreens: screens,
        totalLocations: userLocationIds.length,
        totalAdmins: 1,
        monthlyRevenue: monthlyBookings[0]?.total || 0,
        recentBookings
      }

      return NextResponse.json({ 
        success: true, 
        stats, 
        user: { 
          role: user.role, 
          username: user.username,
          assignedLocations: finalLocationNames.join(', ') // Comma-separated location names
        } 
      })
    }

  } catch (error) {
    console.error('Dashboard stats error:', error)
    const code = error.message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: error.message }, { status: code })
  }
}
