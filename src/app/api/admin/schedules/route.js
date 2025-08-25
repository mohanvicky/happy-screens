import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import EventSchedule from '@/models/EventSchedule'
import Screen from '@/models/Screen'

export async function GET(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('location')
    const date = searchParams.get('date')

    let filter = {}
    
    // Location-based filtering for normal admins
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      filter.location = { $in: userLocationIds }
    }

    if (locationId) filter.location = locationId
    if (date) filter.date = new Date(date)

    const schedules = await EventSchedule.find(filter)
      .populate('event', 'name category duration')
      .populate('location', 'name')
      .populate('screen', 'name')
      .populate('timeSlot', 'name startTime endTime')
      .sort({ date: 1, 'timeSlot.startTime': 1 })
      .lean()

    return NextResponse.json({
      success: true,
      schedules: schedules.map(schedule => ({
        id: schedule._id.toString(),
        event: schedule.event,
        location: schedule.location,
        screen: schedule.screen,
        timeSlot: schedule.timeSlot,
        date: schedule.date,
        isActive: schedule.isActive
      }))
    })

  } catch (error) {
    console.error('Get schedules error:', error)
    return NextResponse.json({ error: 'Failed to load schedules' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { events, locations, screens, timeSlots, dates } = await request.json()

    // Validate inputs
    if (!events?.length || !locations?.length || !screens?.length || !timeSlots?.length || !dates?.length) {
      return NextResponse.json({ 
        error: 'Events, locations, screens, time slots, and dates are required' 
      }, { status: 400 })
    }

    // Check permissions for normal admin
    if (user.role !== 'super_admin') {
      const userLocationIds = user.assignedLocations.map(loc => 
        typeof loc === 'object' ? loc._id.toString() : loc.toString()
      )
      
      const invalidLocations = locations.filter(loc => !userLocationIds.includes(loc))
      if (invalidLocations.length > 0) {
        return NextResponse.json({ 
          error: 'You can only schedule events for your assigned locations' 
        }, { status: 403 })
      }
    }

    const schedules = []
    const conflicts = []

    // Generate all combinations
    for (const eventId of events) {
      for (const locationId of locations) {
        for (const screenId of screens) {
          // Verify screen belongs to location
          const screen = await Screen.findById(screenId)
          if (!screen || screen.location.toString() !== locationId) {
            continue // Skip invalid screen-location combinations
          }

          for (const timeSlotId of timeSlots) {
            for (const dateStr of dates) {
              const date = new Date(dateStr)
              
              // Check for existing schedule
              const existing = await EventSchedule.findOne({
                screen: screenId,
                timeSlot: timeSlotId,
                date: date,
                isActive: true
              })

              if (existing) {
                conflicts.push({
                  screen: screenId,
                  timeSlot: timeSlotId,
                  date: dateStr,
                  reason: 'Screen already scheduled for this slot'
                })
                continue
              }

              schedules.push({
                event: eventId,
                location: locationId,
                screen: screenId,
                timeSlot: timeSlotId,
                date: date,
                createdBy: user._id
              })
            }
          }
        }
      }
    }

    if (schedules.length === 0) {
      return NextResponse.json({ 
        error: 'No valid schedules to create',
        conflicts 
      }, { status: 400 })
    }

    // Create schedules in batch
    const created = await EventSchedule.insertMany(schedules)

    return NextResponse.json({
      success: true,
      created: created.length,
      conflicts: conflicts.length,
      conflictDetails: conflicts
    })

  } catch (error) {
    console.error('Create schedules error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Some schedules conflict with existing ones' 
      }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create schedules' }, { status: 500 })
  }
}
