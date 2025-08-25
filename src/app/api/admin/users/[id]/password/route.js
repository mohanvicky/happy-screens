import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireSuperAdmin } from '@/lib/adminAuth'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function PUT(request, context) {
  try {
    await requireSuperAdmin(request)   // only super-admin allowed
    await dbConnect()

    const { params } = context
    const { id } = await params   // 👈 await params!

    console.log("params.id:", id)

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be ≥6 chars" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await User.findByIdAndUpdate(id, { password: hashed })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Set-password error:", err)
    const code = err.message === "Super Admin access required" ? 403 : 500
    return NextResponse.json({ error: "Failed to update password" }, { status: code })
  }
}

