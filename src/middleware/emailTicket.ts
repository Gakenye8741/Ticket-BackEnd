import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// --------------------
// 🧾 Types
// --------------------
interface TicketType {
  name: string;
  price: string;
}

interface Booking {
  bookingId: string;
  eventId: string;
  ticketType?: TicketType;
  quantity: number;
  paymentStatus?: string;
  createdAt: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

// --------------------
// 📤 Route to Send Email
// --------------------
router.post('/send-ticket-email', async (req, res) => {
  const { bookings, user }: { bookings: Booking[]; user: User } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const htmlContent = generateTicketEmailHtml(bookings, user);

    await transporter.sendMail({
      from: '"Ticket Stream" <${process.env.EMAIL_SENDER}>',
      to: user.email,
      subject: 'Your Event Tickets',
      html: htmlContent,
    });

    res.status(200).json({ message: 'Ticket email sent successfully.' });
  } catch (error) {
    console.error('Error sending ticket email:', error);
    res.status(500).json({ message: 'Failed to send ticket email.' });
  }
});

// --------------------
// ✨ Email Template
// --------------------
function generateTicketEmailHtml(bookings: Booking[], user: User): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Hello ${user.firstName} ${user.lastName},</h2>
      <p>Thank you for your booking. Here are your ticket details:</p>
      ${bookings
        .map(
          (booking) => `
        <div style="border:1px solid #ddd;padding:16px;margin:16px 0;border-radius:8px;">
          <h3 style="color:#4f46e5;">🎫 Event ID: ${booking.eventId}</h3>
          <p><strong>Ticket Type:</strong> ${booking.ticketType?.name || 'N/A'}</p>
          <p><strong>Quantity:</strong> ${booking.quantity}</p>
          <p><strong>Price per ticket:</strong> $${parseFloat(booking.ticketType?.price || '0').toFixed(2)}</p>
          <p><strong>Total:</strong> $${(parseFloat(booking.ticketType?.price || '0') * booking.quantity).toFixed(2)}</p>
          <p><strong>Payment Status:</strong> ${booking.paymentStatus || 'Unknown'}</p>
          <p><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
        </div>
      `
        )
        .join('')}
      <p style="margin-top:24px;">We look forward to seeing you at the event!</p>
      <p>Best regards,<br/>Event Team</p>
    </div>
  `;
}

export default router;
