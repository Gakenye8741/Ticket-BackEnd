import { sendNotificationEmail } from "./googleMailer";

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
  paymentStatus: "Completed" | "Pending" | "Failed";
  bookingDate: Date;
}

export const sendTicket = async (ticket: TicketInfo): Promise<boolean> => {
  try {
    const subject = `🎟 CONFIRMED: Your Ticket for ${ticket.eventName}`;

    // Plain text version (Clean and readable)
    const plainMessage = `
Madallor Tickets - ORDER CONFIRMED
------------------------------
Event: ${ticket.eventName}
Attendee: ${ticket.firstName} ${ticket.lastName}
National ID: ${ticket.nationalId}
Ticket: ${ticket.ticketType} (Qty: ${ticket.quantity})
Total Paid: KSH ${ticket.total.toFixed(2)}
Status: ${ticket.paymentStatus}
Date: ${new Date(ticket.bookingDate).toLocaleString()}

Thank you for choosing Madallor Tickets!
`.trim();

    // HTML version (Cyberpunk / Professional Hybrid)
    const htmlMessage = `
<div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; text-align: center;">
  <div style="max-width: 500px; margin: auto; background: #1e293b; border-radius: 24px; overflow: hidden; border: 1px solid #334155; shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
    
    <div style="background: linear-gradient(90deg, #6366f1, #a855f7); padding: 30px 20px;">
      <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; color: #ffffff;">Order Confirmed</h1>
      <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">See you at the event!</p>
    </div>

    <div style="padding: 30px;">
      <div style="text-align: left; margin-bottom: 25px;">
        <h2 style="color: #818cf8; margin: 0 0 5px 0; font-size: 20px;">${ticket.eventName}</h2>
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">${new Date(ticket.bookingDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; color: #cbd5e1;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8;">Attendee</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: bold; color: #f1f5f9;">${ticket.firstName} ${ticket.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8;">National ID</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${ticket.nationalId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #334155; color: #94a3b8;">Ticket Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9;">${ticket.ticketType} x ${ticket.quantity}</td>
        </tr>
        <tr>
          <td style="padding: 20px 0 10px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</td>
          <td style="padding: 20px 0 10px; text-align: right; font-size: 22px; font-weight: 800; color: #22c55e;">KSH ${ticket.total.toLocaleString()}</td>
        </tr>
      </table>

      <div style="margin-top: 25px; padding: 12px; border-radius: 12px; background: #0f172a; border: 1px border-style: dashed; border-color: #334155; display: inline-block; width: 100%; box-sizing: border-box;">
        <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px;">Payment Status</span>
        <span style="color: #fbbf24; font-weight: bold; font-size: 14px;">⚡ ${ticket.paymentStatus.toUpperCase()}</span>
      </div>

      <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
        Please present this email or your digital ticket at the venue entrance. 
        Need help? Contact <a href="#" style="color: #818cf8; text-decoration: none;">Madallor Tickets Support</a>.
      </p>
    </div>

    <div style="padding: 20px; background: #1e293b; border-top: 1px solid #334155;">
      <p style="margin: 0; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #475569; text-transform: uppercase;">
        Madallor Tickets Events 👑
      </p>
    </div>
  </div>
</div>
`;

    // Send email
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