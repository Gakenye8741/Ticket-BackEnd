import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// --------------------
// 📤 Route to Send Email
// --------------------
router.post('/send-ticket-email', async (req, res) => {
  const { bookings, user } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailAttachments: any[] = [];

    // 1. Prepare attachments with unique CIDs
    bookings.forEach((booking: any) => {
      if (booking.qrCodes && booking.qrCodes.length > 0) {
        booking.qrCodes.forEach((qr: any) => {
          // Remove potential data URI prefix to get clean base64
          const base64Data = qr.qrDataUrl.split(';base64,').pop();
          
          emailAttachments.push({
            filename: `ticket-${qr.ticketId}.png`,
            content: Buffer.from(base64Data, 'base64'),
            encoding: 'base64',
            cid: `qr_ticket_${qr.ticketId}`, // Simplified CID
          });
        });
      }
    });

    const htmlContent = generateTicketEmailHtml(bookings, user);
    const eventTitle = bookings[0]?.event?.title || 'Your Event';

    await transporter.sendMail({
      from: `"TicketStream Tickets" <${process.env.EMAIL_SENDER}>`,
      to: user.email,
      subject: `🎟️ Your Scanable Tickets for ${eventTitle}`,
      html: htmlContent,
      attachments: emailAttachments,
    });

    res.status(200).json({ message: 'Ticket email with QR codes sent successfully.' });
  } catch (error) {
    console.error('Error sending ticket email:', error);
    res.status(500).json({ message: 'Failed to send ticket email.' });
  }
});

// --------------------
// ✨ Email Template
// --------------------
function generateTicketEmailHtml(bookings: any[], user: any): string {
  const eventTitle = bookings[0]?.event?.title || 'Event';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto; padding: 24px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
      
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=250&q=80" alt="Event" style="width: 100%; border-radius: 12px;" />
      </div>

      <h2 style="color: #1f2937;">Hello ${user.firstName} ${user.lastName},</h2>
      <p style="font-size: 16px; color: #374151;">Your payment has been cleared! 🎉 Below are your entry passes.</p>
      
      <h1 style="color: #3b82f6;">${eventTitle}</h1>

      <div style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        ${bookings.map((booking) => `
          <h3 style="color: #2563eb;">🧾 Booking #${booking.bookingId}</h3>
          <p><strong>Tier:</strong> ${booking.ticketType?.name}</p>
          <p><strong>Quantity:</strong> ${booking.quantity}</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <p><strong>👇 PRESENT QR CODE(S) AT CHECKPOINT 👇</strong></p>
            ${booking.qrCodes?.map((qr: any, index: number) => `
              <div style="display: inline-block; border: 2px dashed #3b82f6; padding: 10px; margin: 5px; border-radius: 8px;">
                <p style="font-size: 10px;">TICKET ${index + 1}</p>
                <!-- 🎯 MUST MATCH CID: qr_ticket_ID -->
                <img src="cid:qr_ticket_${qr.ticketId}" style="width: 150px; height: 150px;" />
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center;">— The TicketStream Team</p>
    </div>
  `;
}

export default router;