import nodemailer from 'nodemailer'

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
})

export async function sendOTPEmail(email, otp, adminName = 'Admin') {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 Happy Screens Admin - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(45deg, #A855F7, #60A5FA); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">Happy Screens</h1>
          <p style="color: white; margin: 5px 0;">Admin Portal</p>
        </div>
        
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello <strong>${adminName}</strong>,</p>
        <p>A password reset has been requested for your admin account. Your OTP is:</p>
        
        <div style="background: #f5f5f5; border: 2px dashed #A855F7; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #A855F7; font-family: monospace;">
            ${otp}
          </div>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏰ This code expires in 5 minutes.</strong></p>
        </div>
        
        <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>🚨 Security Notice:</strong> If you didn't request this reset, please contact the Super Admin immediately.</p>
        </div>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; text-align: center;">
          Happy Screens Admin Panel<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email send error:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendWelcomeEmail(email, username, tempPassword) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🎉 Welcome to Happy Screens Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(45deg, #A855F7, #60A5FA); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">Happy Screens</h1>
          <p style="color: white; margin: 5px 0;">Admin Portal</p>
        </div>
        
        <h2 style="color: #333;">Welcome to the Team!</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Your admin account has been created successfully. Here are your login details:</p>
        
        <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
          <p><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login">${process.env.NEXT_PUBLIC_APP_URL}/admin/login</a></p>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Important:</strong> Please login and ask the Super Admin to change your password for security.</p>
        </div>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; text-align: center;">
          Happy Screens Admin Panel
        </p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Welcome email error:', error)
    throw new Error('Failed to send welcome email')
  }
}

// Send booking cancellation email
export async function sendBookingCancellationEmail(customerInfo, booking, reason, refundAmount = 0) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: `🚫 Booking Cancelled - ${booking.bookingId} | Happy Screens`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .booking-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .status-cancelled { color: #d32f2f; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚫 Booking Cancelled</h1>
                    <p>Your reservation has been cancelled</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${customerInfo.name}</strong>,</p>
                    
                    <p>We regret to inform you that your booking has been cancelled.</p>
                    
                    <div class="booking-details">
                        <h3>Booking Details:</h3>
                        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p><strong>Screen:</strong> ${booking.screen?.name}</p>
                        <p><strong>Location:</strong> ${booking.location?.name}</p>
                        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString('en-IN')}</p>
                        <p><strong>Time:</strong> ${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}</p>
                        <p><strong>Event:</strong> ${booking.eventType}</p>
                        <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
                        <p class="status-cancelled"><strong>Status:</strong> CANCELLED</p>
                    </div>
                    
                    <div class="booking-details">
                        <h3>Cancellation Details:</h3>
                        <p><strong>Reason:</strong> ${reason}</p>
                        <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                        ${refundAmount > 0 ? `<p><strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString()}</p>` : ''}
                    </div>
                    
                    <p>We apologize for any inconvenience caused. If you have any questions or would like to make a new booking, please don't hesitate to contact us.</p>
                    
                    <p><strong>Contact Information:</strong><br>
                    📞 Phone: +91 99451 02299<br>
                    ✉️ Email: ${process.env.EMAIL_USER}</p>
                    
                    <p>Thank you for choosing Happy Screens.</p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Happy Screens. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Cancellation email sent successfully to:', customerInfo.email)
    
  } catch (error) {
    console.error('Error sending cancellation email:', error)
    throw error
  }
}

// Send booking update email
export async function sendBookingUpdateEmail(customerInfo, booking, updates) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: `✅ Booking Updated - ${booking.bookingId} | Happy Screens`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .booking-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .status-confirmed { color: #2e7d32; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .update-highlight { background: #e3f2fd; padding: 10px; border-left: 4px solid #2196f3; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Booking Updated</h1>
                    <p>Your reservation has been modified</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${customerInfo.name}</strong>,</p>
                    
                    <p>Your booking has been successfully updated with new details.</p>
                    
                    <div class="update-highlight">
                        <p><strong>📝 What Changed:</strong></p>
                        <p>${Object.keys(updates).map(key => `• ${key}: Updated`).join('<br>')}</p>
                    </div>
                    
                    <div class="booking-details">
                        <h3>Updated Booking Details:</h3>
                        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p><strong>Screen:</strong> ${booking.screen?.name}</p>
                        <p><strong>Location:</strong> ${booking.location?.name}</p>
                        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString('en-IN')}</p>
                        <p><strong>Time:</strong> ${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}</p>
                        <p><strong>Event:</strong> ${booking.eventType}</p>
                        <p><strong>Guests:</strong> ${booking.numberOfGuests}</p>
                        <p><strong>Total Amount:</strong> ₹${booking.pricing?.totalAmount?.toLocaleString()}</p>
                        <p class="status-confirmed"><strong>Status:</strong> ${booking.bookingStatus.toUpperCase()}</p>
                    </div>
                    
                    <p><strong>📅 Important Reminders:</strong><br>
                    • Please arrive 15 minutes before your scheduled time<br>
                    • Payment can be made at the venue<br>
                    • Bring a valid ID for verification</p>
                    
                    <p><strong>Contact Information:</strong><br>
                    📞 Phone: +91 99451 02299<br>
                    ✉️ Email: ${process.env.EMAIL_USER}</p>
                    
                    <p>Thank you for choosing Happy Screens!</p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Happy Screens. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Update email sent successfully to:', customerInfo.email)
    
  } catch (error) {
    console.error('Error sending update email:', error)
    throw error
  }
}

export async function sendBookingConfirmationEmail(customerInfo, booking) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: `🎉 Booking Confirmed - ${booking.bookingId} | Happy Screens`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .booking-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .status-confirmed { color: #2e7d32; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .highlight { background: #e8f5e8; padding: 10px; border-left: 4px solid #4caf50; margin: 15px 0; }
                .important { background: #fff3e0; padding: 15px; border-radius: 5px; border-left: 4px solid #ff9800; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Booking Confirmed!</h1>
                    <p>Your private theatre experience awaits</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${customerInfo.name}</strong>,</p>
                    
                    <div class="highlight">
                        <p><strong>🎊 Great news! Your booking has been successfully confirmed.</strong></p>
                        <p>Get ready for an amazing private theatre experience at Happy Screens!</p>
                    </div>
                    
                    <div class="booking-details">
                        <h3>🎬 Your Booking Details:</h3>
                        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                        <p><strong>Screen:</strong> ${booking.screen?.name || 'Premium Screen'}</p>
                        <p><strong>Location:</strong> ${booking.location?.name || 'Happy Screens'}</p>
                        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p><strong>Time:</strong> ${booking.timeSlot.startTime} - ${booking.timeSlot.endTime} (${booking.timeSlot.duration} hours)</p>
                        <p><strong>Event:</strong> ${booking.eventType}</p>
                        <p><strong>Guests:</strong> ${booking.numberOfGuests} people</p>
                        <p class="status-confirmed"><strong>Status:</strong> CONFIRMED ✅</p>
                    </div>
                    
                    <div class="booking-details">
                        <h3>💰 Payment Summary:</h3>
                        <p><strong>Screen Rental:</strong> ₹${booking.pricing?.screenAmount?.toLocaleString() || 0}</p>
                        ${booking.pricing?.eventAmount > 0 ? `<p><strong>Event Package:</strong> ₹${booking.pricing.eventAmount.toLocaleString()}</p>` : ''}
                        <p><strong>Total Amount:</strong> <span style="color: #2e7d32; font-size: 18px; font-weight: bold;">₹${booking.pricing?.totalAmount?.toLocaleString() || 0}</span></p>
                    </div>
                    
                    ${booking.specialRequests && (booking.specialRequests.decorations || booking.specialRequests.cake || booking.specialRequests.photography || booking.specialRequests.customMessage) ? `
                    <div class="booking-details">
                        <h3>🎈 Special Requests:</h3>
                        ${booking.specialRequests.decorations ? '<p>• Decorations Arranged</p>' : ''}
                        ${booking.specialRequests.cake ? '<p>• Cake Arrangement</p>' : ''}
                        ${booking.specialRequests.photography ? '<p>• Photography Service</p>' : ''}
                        ${booking.specialRequests.customMessage ? `<p>• Special Message: "${booking.specialRequests.customMessage}"</p>` : ''}
                    </div>
                    ` : ''}
                    
                    <div class="important">
                        <h3>📋 Important Instructions:</h3>
                        <p><strong>📅 Arrival Time:</strong> Please arrive 15 minutes before your scheduled time</p>
                        <p><strong>💳 Payment:</strong> Full payment to be made at the venue</p>
                        <p><strong>💰 Payment Methods:</strong> We accept Cash, UPI, Debit/Credit Cards</p>
                        <p><strong>🆔 ID Proof:</strong> Please bring a valid government ID for verification</p>
                        <p><strong>📱 Contact:</strong> Call us at +91 99451 02299 for any assistance</p>
                    </div>
                    
                    <div class="booking-details" style="text-align: center;">
                        <h3>🏢 Venue Address:</h3>
                        <p><strong>${booking.location?.name || 'Happy Screens'}</strong></p>
                        <p>${booking.location?.address?.street || ''}</p>
                        <p>${booking.location?.address?.area || ''}, ${booking.location?.address?.city || 'Bangalore'}</p>
                        <p>📞 ${booking.location?.contactInfo?.phone || '+91 99451 02299'}</p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <strong>Thank you for choosing Happy Screens!</strong><br>
                        We look forward to making your celebration memorable! 🎬✨
                    </p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Happy Screens. All rights reserved.</p>
                    <p>For support: ${process.env.EMAIL_USER} | +91 99451 02299</p>
                </div>
            </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Booking confirmation email sent successfully to:', customerInfo.email)
    
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    throw error
  }
}

// Test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify()
    console.log('Email server connection verified successfully')
    return true
  } catch (error) {
    console.error('Email server connection failed:', error)
    return false
  }
}