// src/app/api/admin/screens/available/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/adminAuth'
import Screen from '@/models/Screen'
import Event  from '@/models/Event'

export async function GET (request) {
  try {
    const user = await requireAuth(request)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const date     = new Date(searchParams.get('date'))   // YYYY-MM-DD
    const start    = searchParams.get('start')            // "14:00"
    const end      = searchParams.get('end')

    /* Normal admin can search only within his branches */
    if (user.role!=='super_admin' &&
        !user.assignedLocations.map(id=>id.toString()).includes(location))
      return NextResponse.json({ error:'Forbidden' }, { status:403 })

    /* find screens in location that have NO event overlapping the slot */
    const busyScreens = await Event.find({
      location,
      date,
      status:'booked',
      $or:[
        { 'timeSlot.start': { $lt:end,  $gte:start } },       // overlap cases
        { 'timeSlot.end'  : { $gt:start, $lte:end  } }
      ]
    }).distinct('screen')

    const available = await Screen.find({
      location,
      isActive:true,
      _id: { $nin: busyScreens }
    }).select('name capacity amenities')

    return NextResponse.json({ screens: available })
  } catch (err) {
    return NextResponse.json({ error:'Server error' }, { status:500 })
  }
}
