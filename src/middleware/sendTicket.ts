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

export const sendTicket = async (ticket: TicketInfo): Promise<string> => {
  try {
    const subject = `🎟 Your Ticket for ${ticket.eventName} is Confirmed`;

    const plainMessage = `
${ticket.eventName}
Name: ${ticket.firstName} ${ticket.lastName}
National ID: ${ticket.nationalId}
Ticket Type: ${ticket.ticketType}
Quantity: ${ticket.quantity}
Price per ticket: $${ticket.price.toFixed(2)}
Total: $${ticket.total.toFixed(2)}
Payment Status: ${ticket.paymentStatus}
Booking Date: ${new Date(ticket.bookingDate).toLocaleString()}
`.trim();

    const htmlMessage = `
      <div style="max-width:600px; margin:auto; font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2c3e50;">🎟 ${ticket.eventName}</h2>
        <p><strong>Name:</strong> ${ticket.firstName} ${ticket.lastName}</p>
        <p><strong>National ID:</strong> ${ticket.nationalId}</p>
        <p><strong>Ticket Type:</strong> ${ticket.ticketType}</p>
        <p><strong>Quantity:</strong> ${ticket.quantity}</p>
        <p><strong>Price per ticket:</strong> $${ticket.price.toFixed(2)}</p>
        <p><strong>Total:</strong> $${ticket.total.toFixed(2)}</p>
        <p><strong>Payment Status:</strong> ${ticket.paymentStatus}</p>
        <p><strong>Booking Date:</strong> ${new Date(ticket.bookingDate).toLocaleString()}</p>
        <hr />
        <p style="font-size: 14px; color: #888;">Thank you for booking with <strong>TicketStream Events</strong>.</p>
      </div>
    `;

    const result = await sendNotificationEmail(
      ticket.email,
      subject,
      plainMessage,
      ticket.firstName,
      ticket.lastName,
      // optional HTML param if your `sendEmails` supports it
    );

    return result;
  } catch (error) {
    console.error("❌ sendTicket error:", error);
    return "❌ Failed to send ticket email";
  }
};
