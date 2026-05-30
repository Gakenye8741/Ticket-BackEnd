import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// --------------------
// 🧾 Types (Preserved and complete)
// --------------------
interface TicketType {
  name: string;
  price: string;
}

interface QrAsset {
  ticketId: number;
  ticketToken: string;
  qrDataUrl: string; // The base64 data string from編 QRCode.toDataURL
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
  qrCodes?: QrAsset[]; 
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

    // 📎 1. Extract all QR codes from all bookings and compile inline attachments
    const emailAttachments: any[] = [];

    bookings.forEach((booking) => {
      if (booking.qrCodes && booking.qrCodes.length > 0) {
        booking.qrCodes.forEach((qr) => {
          // Clean out the data URI metadata prefix if present, leaving the pure base64 code block
          const cleanBase64 = qr.qrDataUrl.replace(/^data:image\/png;base64,/, "");

          emailAttachments.push({
            filename: `ticket-${qr.ticketId}.png`,
            content: Buffer.from(cleanBase64, 'base64'),
            cid: `cid_qr_ticket_${qr.ticketId}`, // 🔑 Matches the lookup anchor inside the HTML string generator
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
      attachments: emailAttachments, // 👈 Injecting the gathered image buffer payloads
    });

    res.status(200).json({ message: 'Ticket email with QR codes sent successfully.' });
  } catch (error) {
    console.error('Error sending ticket email:', error);
    res.status(500).json({ message: 'Failed to send ticket email.' });
  }
});

// --------------------
// ✨ Email Template (Refactored for Content-ID reference layout targets)
// --------------------
function generateTicketEmailHtml(bookings: Booking[], user: User): string {
  const eventTitle = bookings[0]?.event?.title || 'Event';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto; padding: 24px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
      
      <div style="text-align: center; margin-bottom: 24px;">
        <img 
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=250&q=80" 
          alt="Event Celebration" 
          style="width: 100%; max-width: 600px; height: auto; border-radius: 12px;" 
        />
      </div>

      <h2 style="color: #1f2937;">Hello ${user.firstName} ${user.lastName},</h2>

      <p style="font-size: 16px; color: #374151; margin-bottom: 12px;">
        Your payment has been cleared! 🎉 Below are your entry passes for:
      </p>

      <h1 style="color: #3b82f6; font-size: 28px; font-weight: bold; margin-bottom: 24px;">
        ${eventTitle}
      </h1>

      <!-- Booking Pass Details Info Box -->
      <div style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 24px;">
        ${bookings
          .map(
            (booking) => `
              <h3 style="color: #2563eb; font-size: 20px; margin-bottom: 12px;">🧾 Order Summary: Booking #${booking.bookingId}</h3>
              <p><strong>Ticket Tier:</strong> ${booking.ticketType?.name || 'Standard'}</p>
              <p><strong>Total Tickets:</strong> ${booking.quantity}</p>
              <p><strong>Total Amount Paid:</strong> <strong>KSH ${(parseFloat(booking.ticketType?.price || '0') * booking.quantity).toFixed(2)}</strong></p>
              <p><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
              
              <div style="margin-top: 20px; text-align: center;">
                <p style="font-weight: bold; color: #1f2937; margin-bottom: 12px;">👇 PRESENT QR CODE(S) AT THE CHECKPOINT 👇</p>
                
                <!-- Inner loop to render individual high-contrast QR graphics -->
                ${booking.qrCodes && booking.qrCodes.length > 0
                  ? booking.qrCodes.map((qr, index) => `
                      <div style="display: inline-block; background: #ffffff; border: 2px dashed #3b82f6; padding: 16px; margin: 10px; border-radius: 12px; max-width: 240px; text-align: center;">
                        <span style="font-size: 12px; font-weight: bold; color: #4b5563; display: block; margin-bottom: 8px;">TICKET ${index + 1} OF ${booking.quantity}</span>
                        
                        <!-- 🎯 THE TARGETED FIX: Use the unique attachment CID link instead of raw data string -->
                        <img src="cid:cid_qr_ticket_${qr.ticketId}" alt="Gate Access QR Code" style="width: 180px; height: 180px; display: block; margin: 0 auto;" />
                        
                        <span style="font-family: monospace; font-size: 11px; color: #9ca3af; display: block; margin-top: 8px;">ID: ${qr.ticketToken.slice(0, 8).toUpperCase()}...</span>
                      </div>
                    `).join('')
                  : `<p style="color: #dc2626;">⚠️ QR Codes missing. Please contact gate support immediately.</p>`
                }
              </div>
              <hr style="margin: 24px 0; border: 0; border-top: 1px solid #eee;" />
            `
          )
          .join('')}
      </div>

      <!-- Critical Entry Instructions -->
      <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
        <p style="font-size: 15px; color: #7c3aed; font-weight: bold; margin-top: 0;">
          📌 Important Security & Entry Rules
        </p>
        <ul style="font-size: 14px; color: #333; padding-left: 20px; margin-top: 8px; line-height: 1.4;">
          <li>Each QR code displayed above represents exactly <strong>one individual admission</strong>.</li>
          <li>Once scanned at the gate checkpoint, that specific QR code is <strong>deactivated instantly</strong> in our system.</li>
          <li>Do not share copies or screenshots of these graphics to prevent unauthorized usage.</li>
          <li>Ensure your mobile screen brightness is turned up to full when presenting code to the scanner.</li>
        </ul>
      </div>

      <p style="font-size: 15px; margin-top: 24px; color: #374151;">
        🕒 Set up your schedule early to beat entry queues and carry your national ID matching your order configuration.
      </p>

      <p style="font-size: 15px; margin-top: 12px; color: #4b5563;">
        For maps, directions, and scheduling context, head over to our main platform portal:<br/>
        <a href="https://ticketstream-events.netlify.app" style="color: #3b82f6; text-decoration: underline;" target="_blank">
          ticketstream-events.netlify.app
        </a>
      </p>

      <p style="font-size: 15px; margin-top: 16px; color: #4b5563;">
        Need technical assistance? Drop a line to <a href="mailto:support@madollar.com" style="color: #3b82f6;">support@madollar.com</a>
      </p>

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
        — The TicketStream Tickets Team
      </p>
    </div>
  `;
}

export default router;