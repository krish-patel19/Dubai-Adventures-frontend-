import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBookingConfirmation(booking: any, activity: any, pdfBuffer: Buffer) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping confirmation email.");
    return false;
  }

  const bookingRef = booking._id?.toString().toUpperCase() || 'NEW-BOOKING';
  const meetingPoint = activity.location?.details || activity.location?.address || "Please refer to the attached PDF for specific pickup/meeting instructions.";

  const mailOptions = {
    from: `"Dubai Adventures" <${process.env.SMTP_USER}>`,
    to: booking.email,
    subject: `Booking Confirmation: ${booking.activityTitle} [#${bookingRef}]`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1612; max-width: 600px; margin: 0 auto; border: 1px solid #e5c07b; border-radius: 12px; overflow: hidden; background-color: #fcfbf7;">
        <div style="background-color: #1a1612; padding: 40px 20px; text-align: center;">
          <h1 style="color: #d4a045; margin: 0; font-size: 28px; letter-spacing: 4px; font-weight: 300;">DUBAI ADVENTURES</h1>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a1612; font-size: 20px; margin-bottom: 20px;">Dear ${booking.fullName || 'Valued Guest'},</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #645c55;">Your booking for <strong>${booking.activityTitle}</strong> has been successfully confirmed. We look forward to hosting you for this premium experience.</p>
          
          <div style="background-color: #ffffff; border: 1px solid #e5c07b; padding: 25px; border-radius: 10px; margin: 30px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <h3 style="color: #d4a045; margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #fcfbf7; padding-bottom: 10px;">Booking Summary</h3>
            
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
              <tr>
                <td style="padding: 10px 0; color: #645c55; font-size: 13px; width: 100px; vertical-align: top;">Booking Ref:</td>
                <td style="padding: 10px 0; color: #1a1612; font-size: 13px; font-weight: bold; text-align: right; word-break: break-all;">#${bookingRef}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #645c55; font-size: 13px; width: 100px; vertical-align: top;">Experience:</td>
                <td style="padding: 10px 0; color: #1a1612; font-size: 13px; font-weight: bold; text-align: right; word-wrap: break-word; word-break: normal;">${booking.activityTitle}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #645c55; font-size: 13px; width: 100px;">Date:</td>
                <td style="padding: 10px 0; color: #1a1612; font-size: 13px; font-weight: bold; text-align: right;">${booking.date ? new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #645c55; font-size: 13px; width: 100px;">Time Slot:</td>
                <td style="padding: 10px 0; color: #1a1612; font-size: 13px; font-weight: bold; text-align: right;">${booking.timeSlot || 'Not Specified'}</td>
              </tr>
               <tr>
                 <td style="padding: 10px 0; color: #645c55; font-size: 13px; width: 100px;">Guests:</td>
                 <td style="padding: 10px 0; color: #1a1612; font-size: 13px; font-weight: bold; text-align: right;">${booking.adults} Adults, ${booking.children || 0} Children</td>
               </tr>
               ${booking.pickupAddress ? `
               <tr>
                 <td style="padding: 10px 0; color: #645c55; font-size: 13px; width: 100px; vertical-align: top;">Pick-up Address:</td>
                 <td style="padding: 10px 0; color: #1a1612; font-size: 13px; font-weight: bold; text-align: right; word-wrap: break-word;">${booking.pickupAddress}</td>
               </tr>
               ` : ''}
               ${booking.dropoffAddress ? `
               <tr>
                 <td style="padding: 10px 0; color: #645c55; font-size: 13px; width: 100px; vertical-align: top;">Drop-off Address:</td>
                 <td style="padding: 10px 0; color: #1a1612; font-size: 13px; font-weight: bold; text-align: right; word-wrap: break-word;">${booking.dropoffAddress}</td>
               </tr>
               ` : ''}
              <tr>
                <td style="padding: 10px 0; color: #d4a045; font-size: 15px; font-weight: bold; border-top: 1px solid #fcfbf7; padding-top: 15px; width: 100px;">Total Paid:</td>
                <td style="padding: 10px 0; color: #d4a045; font-size: 15px; font-weight: bold; text-align: right; border-top: 1px solid #fcfbf7; padding-top: 15px;">AED ${booking.totalPrice?.toLocaleString()}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #e5c07b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #645c55; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">📍 Meeting / Pickup Point</p>
              <p style="margin: 0; font-size: 13px; color: #1a1612; line-height: 1.5; word-wrap: break-word;">${meetingPoint}</p>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #645c55; line-height: 1.6;">Attached to this email, you will find your official **e-Ticket and Voucher**. Please present this digital voucher upon arrival.</p>
          
          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e5c07b; padding-top: 25px;">
            <p style="font-size: 12px; color: #999;">Need help? Reply to this email or contact our support.</p>
            <p style="font-size: 11px; color: #ccc;">© 2026 Dubai Adventures. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
    attachments: [{ filename: `Voucher_${bookingRef}.pdf`, content: pdfBuffer }],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email successfully dispatched:', info.messageId);
    return true;
  } catch (error) {
    console.error('SMTP Error:', error);
    return false;
  }
}

export async function sendAdminNotification(booking: any, activity: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ADMIN_EMAIL) return false;

  const bookingRef = booking._id?.toString().toUpperCase() || 'NEW-BOOKING';

  const mailOptions = {
    from: `"Dubai Adventures System" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🚨 NEW BOOKING: ${booking.activityTitle} [#${bookingRef}]`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 2px solid #d4a045; padding: 25px; border-radius: 8px;">
        <h2 style="color: #1a1612; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 15px;">New Booking Alert</h2>
        
        <div style="background: #fcfbf7; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Activity:</strong> ${booking.activityTitle}</p>
          <p style="margin: 8px 0;"><strong>Booking Ref:</strong> #${bookingRef}</p>
          <p style="margin: 8px 0;"><strong>Guest:</strong> ${booking.fullName} (${booking.nationality || 'N/A'})</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${booking.email}</p>
          <p style="margin: 8px 0;"><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>Date/Time:</strong> ${new Date(booking.date).toLocaleDateString()} @ ${booking.timeSlot}</p>
          <p style="margin: 8px 0;"><strong>Group Size:</strong> ${booking.adults} Adults, ${booking.children || 0} Children</p>
          ${booking.pickupAddress ? `<p style="margin: 8px 0;"><strong>Pick-up Address:</strong> ${booking.pickupAddress}</p>` : ''}
          ${booking.dropoffAddress ? `<p style="margin: 8px 0;"><strong>Drop-off Address:</strong> ${booking.dropoffAddress}</p>` : ''}
          <p style="margin: 15px 0 0 0; font-size: 18px; color: #d4a045; font-weight: bold;">Revenue: AED ${booking.totalPrice?.toLocaleString()}</p>
        </div>
        
        <a href="${process.env.NEXTAUTH_URL}/admin/bookings" style="display: inline-block; background: #1a1612; color: #d4a045; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px;">MANAGE ALL BOOKINGS</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification dispatched.');
    return true;
  } catch (error) {
    console.error('Admin Email Error:', error);
    return false;
  }
}

export async function sendReviewInvite(booking: any, activity: any) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return false;

  const reviewPath = activity.reviewPath || `/activities/${activity.id || booking.activityId}#reviews`;
  const reviewLink = `${process.env.NEXTAUTH_URL}${reviewPath}`;

  const mailOptions = {
    from: `"Dubai Adventures" <${process.env.SMTP_USER}>`,
    to: booking.email,
    subject: `How was your experience, ${booking.fullName}?`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1612; max-width: 600px; margin: 0 auto; border: 1px solid #e5c07b; border-radius: 12px; overflow: hidden; background-color: #fcfbf7;">
        <div style="background-color: #1a1612; padding: 40px 20px; text-align: center;">
          <h1 style="color: #d4a045; margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 300;">DUBAI ADVENTURES</h1>
        </div>
        
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="color: #1a1612; font-size: 22px; margin-bottom: 20px;">We'd love to hear from you!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #645c55; margin-bottom: 30px;">
            It's been 24 hours since your <strong>${booking.activityTitle}</strong>. We hope you had an unforgettable experience.
          </p>
          
          <p style="font-size: 15px; color: #645c55; margin-bottom: 40px;">
            Your feedback helps us maintain our premium standards and helps other travelers plan their perfect adventure.
          </p>
          
          <a href="${reviewLink}" style="display: inline-block; background-color: #d4a045; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 15px rgba(212, 160, 69, 0.3);">
            Leave a Review
          </a>
          
          <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #e5c07b;">
            <p style="font-size: 13px; color: #8c7e73; font-style: italic;">
              "The best way to predict the future is to create it." — We're creating the future of Dubai tourism with your help.
            </p>
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 25px;">
            <p style="font-size: 11px; color: #ccc;">If you have any private feedback or concerns, please reply directly to this email.</p>
            <p style="font-size: 11px; color: #ccc;">© 2026 Dubai Adventures elite. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Review invitation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Review Email Error:', error);
    return false;
  }
}
