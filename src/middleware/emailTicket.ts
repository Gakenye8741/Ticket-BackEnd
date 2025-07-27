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
  event: {
    title: string;
  };
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
    const eventTitle = bookings[0]?.event?.title || 'Your Event';

    await transporter.sendMail({
      from: `"Ticket Stream Tickets" <${process.env.EMAIL_SENDER}>`,
      to: user.email,
      subject: `🎟️ Your Tickets for ${eventTitle}`,
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
  const eventTitle = bookings[0]?.event?.title || 'Event';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto; padding: 24px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
      
      <!-- Logo / Banner -->
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=180&q=80" alt="Event Logo" style="max-width: 180px; height: auto;" />
      </div>

      <h2 style="color: #1f2937;">Hello ${user.firstName} ${user.lastName},</h2>

      <p style="font-size: 16px; color: #374151; margin-bottom: 12px;">
        Thank you for your booking! 🎉 We're excited to have you join us at:
      </p>

      <h1 style="color: #3b82f6; font-size: 28px; font-weight: bold; margin-bottom: 24px;">
        ${eventTitle} party
      </h1>

      <div style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 24px;">
        ${bookings
          .map(
            (booking) => `
              <h3 style="color: #2563eb; font-size: 20px; margin-bottom: 12px;">🎟️ Booking #${booking.bookingId}</h3>
              <p><strong>Ticket Type:</strong> ${booking.ticketType?.name || 'N/A'}</p>
              <p><strong>Quantity:</strong> ${booking.quantity}</p>
              <p><strong>Price per Ticket:</strong> $${parseFloat(booking.ticketType?.price || '0').toFixed(2)}</p>
              <p><strong>Total Paid:</strong> <strong>$${(parseFloat(booking.ticketType?.price || '0') * booking.quantity).toFixed(2)}</strong></p>
              <p><strong>Payment Status:</strong> ${booking.paymentStatus || 'Unknown'}</p>
              <p><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
              <hr style="margin: 16px 0;" />
            `
          )
          .join('')}
      </div>

      <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
        <p style="font-size: 15px; color: #7c3aed; font-weight: bold;">
          📌 Important Entry Instructions
        </p>
        <ul style="font-size: 14px; color: #333; padding-left: 20px; margin-top: 8px;">
          <li>This email serves as your <strong>official entry ticket</strong> to <strong>${eventTitle} party</strong>.</li>
          <li><span style="color: red;"><strong>No printed tickets or screenshots</strong></span> will be accepted at the gate.</li>
          <li>Please display this email on your phone during entry.</li>
          <li>Your booking ID and personal information will be verified.</li>
        </ul>
      </div>

      <p style="font-size: 15px; margin-top: 24px; color: #374151;">
        🕒 Arrive early to avoid delays and bring your national ID matching the booking.
      </p>

      <p style="font-size: 15px; margin-top: 12px; color: #4b5563;">
        For event schedule, venue details, and more information, visit our official site:<br/>
        <a href="https://ticketstream-events.netlify.app" style="color: #3b82f6; text-decoration: underline;" target="_blank">
          ticketstream-events.netlify.app
        </a>
      </p>

      <p style="font-size: 15px; margin-top: 16px; color: #4b5563;">
        Need help? Contact us at <a href="mailto:support@yourevent.com" style="color: #3b82f6;">support@yourevent.com</a>
      </p>

      <!-- Social Media Links -->
      <div style="text-align: center; margin-top: 32px;">
        <p style="font-size: 15px; color: #374151;">Stay connected with us:</p>
        <a href="https://facebook.com/yourevent" style="margin: 0 8px;" target="_blank">
          <img src="https://img.icons8.com/ios-filled/24/3b82f6/facebook.png" alt="Facebook" />
        </a>
        <a href="https://instagram.com/yourevent" style="margin: 0 8px;" target="_blank">
          <img src="https://img.icons8.com/ios-filled/24/3b82f6/instagram-new.png" alt="Instagram" />
        </a>
        <a href="https://twitter.com/yourevent" style="margin: 0 8px;" target="_blank">
          <img src="https://img.icons8.com/ios-filled/24/3b82f6/twitter.png" alt="Twitter" />
        </a>
      </div>

      <p style="font-size: 14px; margin-top: 32px; color: #6b7280; text-align: center;">
        — The TicketStream Events Team
      </p>
    </div>
  `;
}

export default router;
