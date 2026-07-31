import express, { Request, Response } from "express";
import { Resend } from "resend";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// --------------------
// 📤 Route to Send Email via Resend
// --------------------
router.post("/send-ticket-email", async (req: Request, res: Response): Promise<void> => {
  const { bookings, user } = req.body;

  try {
    const emailAttachments: any[] = [];

    // 1. Prepare attachments for Resend
    bookings.forEach((booking: any) => {
      if (booking.qrCodes && booking.qrCodes.length > 0) {
        booking.qrCodes.forEach((qr: any) => {
          const qrData = qr.qrDataUrl || qr.qrCodeUrl || qr.url;
          if (qrData) {
            const base64Data = qrData.split(";base64,").pop();
            emailAttachments.push({
              filename: `ticket-${qr.ticketId || qr.id || 'pass'}.png`,
              content: Buffer.from(base64Data, "base64"),
            });
          }
        });
      }
    });

    const htmlContent = generateTicketEmailHtml(bookings, user);
    const eventTitle = bookings[0]?.event?.title || bookings[0]?.eventName || "Laikipia Tech Summit 2026";

    // 2. Send via Resend API
    const { data, error } = await resend.emails.send({
      from: `TicketStream <${process.env.EMAIL_SENDER}>`,
      to: [user.email],
      subject: `🎟️ Your Verified Entry Passes for ${eventTitle}`,
      html: htmlContent,
      attachments: emailAttachments,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      res.status(400).json({ message: "Failed to send ticket email.", error });
      return;
    }

    console.log(`📨 Ticket email sent successfully via Resend. ID: ${data?.id}`);
    res.status(200).json({ message: "Ticket email with QR codes sent successfully.", data });
  } catch (error: any) {
    console.error("❌ Error sending ticket email:", error);
    res.status(500).json({ message: "Failed to send ticket email.", error: error.message });
  }
});

// --------------------
// ✨ Clean & Professional Email Template
// --------------------
function generateTicketEmailHtml(bookings: any[], user: any): string {
  const eventTitle = bookings[0]?.event?.title || bookings[0]?.eventName || "Laikipia Tech Summit 2026";
  const venue = bookings[0]?.event?.venue || "Laikipia University Grounds, Nyahururu";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: auto; padding: 30px; background-color: #f4f5f7; border-radius: 16px; color: #1f2937;">
      
      <!-- Header Banner -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #2563eb; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px;">TicketStream Tickets</h2>
        <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; font-weight: bold;">Official Verified Booking Receipt</p>
      </div>

      <!-- Main Container Card -->
      <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        
        <h1 style="color: #111827; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 8px;">${eventTitle}</h1>
        <p style="font-size: 14px; color: #4b5563; margin-top: 0; margin-bottom: 20px;">Hello <strong>${user.firstName} ${user.lastName}</strong>, your payment has been successfully cleared! 🎉 Below are your entry passes.</p>

        <!-- Attendee & Profile Box -->
        <div style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 13px; color: #334155;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">National ID:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right;">${user.nationalId || user.national_id || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Email Address:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Event Venue:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right;">${venue}</td>
            </tr>
          </table>
        </div>

        <!-- Bookings & Itemized Breakdown -->
        ${bookings.map((booking) => {
          const totalAmount = booking.totalAmount || (booking.price * booking.quantity) || 1;
          const unitPrice = booking.price || (totalAmount / booking.quantity) || 1;
          const ticketTier = booking.ticketType?.name || booking.ticketTypeName || "Standard Pass";

          return `
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 800; color: #2563eb;">BOOKING REF: #${booking.bookingId}</span>
                <span style="background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px;">CONFIRMED</span>
              </div>

              <table style="width: 100%; font-size: 13px; color: #374151; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 3px 0;">Ticket Tier / Category:</td>
                  <td style="padding: 3px 0; font-weight: 600; text-align: right;">${ticketTier}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Quantity Purchased:</td>
                  <td style="padding: 3px 0; font-weight: 600; text-align: right;">${booking.quantity} Unit(s)</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Price Per Unit:</td>
                  <td style="padding: 3px 0; font-weight: 600; text-align: right;">KSH ${unitPrice}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; border-top: 1px dashed #e5e7eb; font-weight: bold;">Total Amount Cleared:</td>
                  <td style="padding: 6px 0; border-top: 1px dashed #e5e7eb; font-weight: 900; color: #16a34a; text-align: right;">KSH ${totalAmount}</td>
                </tr>
              </table>

              <!-- QR Codes Grid Section -->
              <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 16px; border-radius: 10px; text-align: center; margin-top: 15px;">
                <p style="font-size: 11px; font-weight: 900; color: #475569; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.5px;">👇 Present QR Code(s) at Gate Checkpoint 👇</p>
                
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;">
                  ${booking.qrCodes?.map((qr: any, index: number) => {
                    const qrSrc = qr.qrDataUrl || qr.qrCodeUrl || qr.url;
                    const ticketId = qr.ticketId || qr.id || `#${index + 1}`;
                    const tokenHash = qr.ticketToken || qr.token || "N/A";

                    return `
                      <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; width: 160px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <p style="font-size: 10px; font-weight: bold; color: #64748b; margin: 0 0 4px 0;">VALID TICKET #${ticketId}</p>
                        ${qrSrc ? `<img src="${qrSrc}" style="width: 130px; height: 130px; display: block; margin: auto; border-radius: 4px;" />` : `<p style="color: red; font-size: 11px;">QR Unavailable</p>`}
                        <p style="font-size: 9px; color: #94a3b8; margin: 6px 0 0 0; word-break: break-all;">Token: ${tokenHash.substring(0, 8)}...</p>
                        <p style="font-size: 9px; font-weight: bold; color: #475569; margin: 2px 0 0 0;">Holder ID: ${user.nationalId}</p>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>

            </div>
          `;
        }).join("")}

      </div>

      <!-- Footer Notice -->
      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 12px; color: #6b7280; line-height: 1.5; margin: 0;">
          Present this digital pass or printed copy along with your National ID at the gate for validation.<br/>
          <strong>— The TicketStream Team</strong>
        </p>
      </div>

    </div>
  `;
}

export default router;