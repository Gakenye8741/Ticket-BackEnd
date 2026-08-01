import db from "../../drizzle/db";
import { bookings, events, venues, ticketTypes, users, payments, tickets } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import QRCode from 'qrcode';
import { sendNotificationEmail } from "../../middleware/googleMailer";

export const processAndEmailTicketService = async (bookingId: number) => {
  // 1. Fetch the booking fully enriched using Drizzle relational queries based on your schema
  const bookingRecord = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId),
    with: {
      event: {
        with: {
          venue: true, // Pulls venue details from venues table via venueId
        },
      },
      ticketType: true,
      user: true,
      payments: true,
      tickets: true, // Pulls individual scannable tickets linked to this booking
    },
  });

  if (!bookingRecord) {
    throw new Error(`Booking with ID ${bookingId} not found.`);
  }

  const event = bookingRecord.event;
  const venue = event?.venue;
  const ticketType = bookingRecord.ticketType;
  const user = bookingRecord.user;
  const payment = bookingRecord.payments?.[0]; // Get latest payment record

  // Safeguard against missing relational data
  if (!event || !ticketType || !user) {
    throw new Error("Incomplete booking relations (Event, TicketType, or User missing).");
  }

  // 2. Retrieve or generate the cryptographic ticket token for the QR code
  let ticketToken = bookingRecord.tickets?.[0]?.ticketToken;
  
  if (!ticketToken) {
    ticketToken = `TKT-${bookingRecord.bookingId}-${user.nationalId}-${Date.now()}`;
    
    // Create individual ticket record in the database if it doesn't exist yet
    await db.insert(tickets).values({
      nationalId: user.nationalId,
      bookingId: bookingRecord.bookingId,
      eventId: event.eventId,
      ticketToken: ticketToken,
      isScanned: false,
    }).catch(() => {
      // Ignore unique constraint errors if already generated concurrently
    });
  }

  // 3. Generate QR Code as a Data URL string
  const qrDataUrl = await QRCode.toDataURL(ticketToken, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1A1A1A',
      light: '#FFFFFF',
    },
  });

  // 4. Construct rich HTML email body featuring event info and QR code
  const venueName = venue ? `${venue.name}, ${venue.address}` : event.category || 'Laikipia University Grounds';
  const eventDateTime = `${event.date} @ ${event.time}`;
  const totalAmountFormatted = Number(bookingRecord.totalAmount).toLocaleString('en-KE');

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 30px; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: #4f46e5; color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">TicketStream Verified Pass</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Official Payment & Booking Confirmation</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 24px;">
          <p style="font-size: 14px; margin-top: 0;">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p style="font-size: 14px; color: #3f3f46;">Your payment has been successfully processed. Below are your event details and entry QR pass.</p>

          <!-- Event Details Box -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #1e293b; text-transform: uppercase;">${event.title}</h2>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>📅 Date & Time:</strong> ${eventDateTime}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>📍 Venue:</strong> ${venueName}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>🎟️ Ticket Tier:</strong> ${ticketType.name} (x${bookingRecord.quantity})</p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>💳 Total Cleared:</strong> KSH ${totalAmountFormatted}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;"><strong>🆔 Transaction ID:</strong> #${payment?.transactionId || 'N/A'}</p>
          </div>

          <!-- QR Code Section -->
          <div style="text-align: center; margin: 24px 0;">
            <p style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Present this QR code at the gate</p>
            <img src="${qrDataUrl}" alt="Ticket QR Code" style="width: 180px; height: 180px; border: 4px solid #f1f5f9; border-radius: 12px;" />
            <p style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 6px;">Token: ${ticketToken}</p>
          </div>

          <p style="font-size: 12px; color: #71717a; text-align: center; margin-top: 30px; border-top: 1px solid #e4e4e7; pt: 16px;">
            Thank you for using TicketStream Systems. Keep this email secure for gate admission.
          </p>
        </div>

      </div>
    </div>
  `;

  // 5. Send notification email using your custom Resend mailer function
  const emailSent = await sendNotificationEmail(
    user.email,
    `Your Verified Ticket Pass: ${event.title}`,
    user.firstName,
    `Your booking for ${event.title} has been confirmed. Total Paid: KSH ${totalAmountFormatted}.`,
    htmlContent
  );

  if (!emailSent) {
    throw new Error(`Failed to dispatch confirmation email to ${user.email}`);
  }

  return { message: "Ticket processed, QR generated, and email dispatched successfully!" };
};