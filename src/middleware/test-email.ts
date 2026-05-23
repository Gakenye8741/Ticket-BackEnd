import { sendTicket, TicketInfo } from "./sendTicket";

/**
 * 🎨 Test Execution Runner for MAdollar Tickets Email Service
 * Run with: npx ts-node src/middleware/test-email.ts
 */
const runEmailTest = async (): Promise<void> => {
  console.log("🚀 Initializing system mock parameters for email dispatch simulation...");

  // Compiled mock database context structures matching real production records
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
    
    // Dynamic gate passes mock assets array configuration
    qrCodes: [
      {
        ticketId: 1001,
        ticketToken: "TK-MADOLLAR-VIP-99x7B8",
        // Using a highly available, high-resolution QR layout generator API
        qrDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-MADOLLAR-VIP-99x7B8&color=2c3e50"
      },
      {
        ticketId: 1002,
        ticketToken: "TK-MADOLLAR-VIP-44k2Z1",
        qrDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-MADOLLAR-VIP-44k2Z1&color=2c3e50"
      }
    ],
  };

  try {
    console.log(`📨 Attempting to dispatch structured template to: ${mockTicketPayload.email}...`);
    
    const isSuccess = await sendTicket(mockTicketPayload);

    console.log("--------------------------------------------------");
    if (isSuccess) {
      console.log("✨ [SUCCESS] Test mail accepted by SMTP relays. Check your inbox!");
    } else {
      console.error("❌ [FAILURE] The transmission was rejected. Check your mailer credentials.");
    }
    console.log(`📋 Dispatch Execution Result State: ${isSuccess}`);
    console.log("--------------------------------------------------");

  } catch (error) {
    console.error("💥 Critical execution crash caught inside runner framework:", error);
  }
};

// Fire the runner lifecycle
runEmailTest();