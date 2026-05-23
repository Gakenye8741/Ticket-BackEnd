import { sendNotificationEmail } from "./googleMailer";

// 🚀 Structuring the incoming QR asset item
interface QrCodeAsset {
  ticketId: number;
  ticketToken: string;
  qrDataUrl: string; // Base64 data URL string representing the scannable QR image
}

interface TicketInfo {
  email: string;
  firstName: string;
  lastName: string;
  nationalId: number;
  eventName: string;
  ticketType: string;
  quantity: number;
  price: number;
  total: number;
  paymentStatus: "Completed" | "Pending" | "Failed" | "Confirmed"; // Added "Confirmed" to match your Enum states safely
  bookingDate: Date;
  qrCodes: QrCodeAsset[]; // 👈 Added array structure for dynamic gate passes
}

export const sendTicket = async (ticket: TicketInfo): Promise<boolean> => {
  try {
    const subject = `🎟 Your Ticket for ${ticket.eventName} is Confirmed`;

    // 1. Generate text-only details for the plain text fallback version
    const plainQrTicketsText = ticket.qrCodes
      .map((t, idx) => `[Gate Pass ${idx + 1} of ${ticket.quantity}] - Ticket ID: #${t.ticketId}\nToken String: ${t.ticketToken}`)
      .join("\n\n");

    const plainMessage = `
${ticket.eventName}
Name: ${ticket.firstName} ${ticket.lastName}
National ID: ${ticket.nationalId}
Ticket Type: ${ticket.ticketType}
Quantity: ${ticket.quantity}
Price per ticket: KSH ${ticket.price.toFixed(2)}
Total: KSH ${ticket.total.toFixed(2)}
Payment Status: ${ticket.paymentStatus}
Booking Date: ${new Date(ticket.bookingDate).toLocaleString()}

--- GATE PASSES ---
${plainQrTicketsText}
`.trim();

    // 2. Map through the QR codes array to generate custom HTML layout structures dynamically
    const htmlQrPassesMarkup = ticket.qrCodes
      .map((t, idx) => `
        <div style="border: 2px dashed #2c3e50; background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
          <h3 style="margin-top: 0; color: #2c3e50; font-size: 16px;">Gate Pass ${idx + 1} of ${ticket.quantity}</h3>
          <p style="font-size: 13px; color: #555555; margin: 4px 0;"><strong>Ticket ID:</strong> #${t.ticketId}</p>
          
          <!-- Renders the Base64 QR code instantly inside standard mail clients -->
          <img src="${t.qrDataUrl}" alt="Gate Pass QR Scan" style="width: 220px; height: 220px; margin: 15px auto; display: block;" />
          
          <p style="font-size: 11px; color: #777777; font-family: monospace; word-break: break-all; margin: 5px 0 0 0;">
            ${t.ticketToken}
          </p>
          <div style="margin-top: 10px; font-size: 12px; color: #27ae60; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
            ● Valid Admission Pass
          </div>
        </div>
      `).join("");

    // HTML version incorporating your clean structural aesthetics
    const htmlMessage = `
<div style="max-width:600px; margin:auto; font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
  <h2 style="color: #2c3e50;">🎟 ${ticket.eventName}</h2>
  <p><strong>Name:</strong> ${ticket.firstName} ${ticket.lastName}</p>
  <p><strong>National ID:</strong> ${ticket.nationalId}</p>
  <p><strong>Ticket Type:</strong> ${ticket.ticketType}</p>
  <p><strong>Quantity:</strong> ${ticket.quantity}</p>
  <p><strong>Price per ticket:</strong> KSH ${ticket.price.toFixed(2)}</p>
  <p><strong>Total:</strong> KSH ${ticket.total.toFixed(2)}</p>
  <p><strong>Payment Status:</strong> ${ticket.paymentStatus}</p>
  <p><strong>Booking Date:</strong> ${new Date(ticket.bookingDate).toLocaleString()}</p>
  
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <h3 style="color: #2c3e50; text-align: center; margin-bottom: 15px;">Your Access Gate Passes</h3>
  
  <!-- Dynamic QR cards display container -->
  ${htmlQrPassesMarkup}
  
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <p style="font-size: 14px; color: #888; text-align: center;">Thank you for booking with <strong>MAdollar Tickets</strong>.</p>
</div>
`;

    // Send email via your Google Mailer transport handler wrapper
    const emailSent = await sendNotificationEmail(
      ticket.email,
      subject,
      ticket.firstName,
      plainMessage,
      htmlMessage
    );

    if (emailSent) {
      console.log(`[EMAIL SUCCESS] Ticket email sent to ${ticket.email}`);
    } else {
      console.error(`[EMAIL FAILURE] Failed to send ticket email to ${ticket.email}`);
    }

    return emailSent;
  } catch (error) {
    console.error("❌ sendTicket error:", error);
    return false;
  }
};