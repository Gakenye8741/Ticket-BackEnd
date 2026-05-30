import { sendTicket, TicketInfo } from "./sendTicket";

const runEmailTest = async (): Promise<void> => {
  console.log("🚀 Initializing mock parameters...");

  const mockTicketPayload: TicketInfo = {
    email: "codingguru8741@gmail.com",
    firstName: "Test",
    lastName: "User",
    nationalId: 123456783,
    eventName: "Color Fest 2026",
    ticketType: "VIP Access",
    quantity: 2,
    price: 1500.00,
    total: 3000.00,
    paymentStatus: "Completed",
    bookingDate: new Date(),
    qrCodes: [
      {
        ticketId: 1001,
        ticketToken: "TK-MADOLLAR-VIP-99x7B8",
        qrDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-MADOLLAR-VIP-99x7B8&color=2c3e50"
      },
      {
        ticketId: 1002,
        ticketToken: "TK-MADOLLAR-VIP-44k2Z1",
        qrDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-MADOLLAR-VIP-44k2Z1&color=2c3e50"
      }
    ],
  };

  const isSuccess = await sendTicket(mockTicketPayload);
  console.log(isSuccess ? "✨ [SUCCESS] Email sent!" : "❌ [FAILURE] Failed.");
};

runEmailTest();