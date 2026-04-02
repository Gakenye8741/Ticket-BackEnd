import { Request, Response } from "express";
import { initiateStkPush } from "./Mpesa.service";
import { bookings, events, mpesaLogs, users } from "../../../drizzle/schema";
import db from "../../../drizzle/db";
import { eq, and, isNotNull } from "drizzle-orm"; // Added and, isNotNull for safety
import { createPaymentService } from "../payment.service";
import { sendTicket } from "../../../middleware/sendTicket";

// 1. Initiate the prompt on the user's phone
export const handleStkPush = async (req: Request, res: Response) => {
  const { amount, phoneNumber, bookingId } = req.body;
  try {
    const result = await initiateStkPush(amount, phoneNumber, bookingId);
    
    // Save CheckoutRequestID so we can find this booking when Safaricom calls back
    await db.update(bookings)
      .set({ checkoutRequestId: result.CheckoutRequestID })
      .where(eq(bookings.bookingId, bookingId));
      
    res.status(200).json({ message: "STK Push Sent", id: result.CheckoutRequestID });
  } catch (error: any) {
    console.error("❌ STK Push Error:", error.message);
    res.status(500).json({ error: "Failed to initiate M-Pesa push" });
  }
};

// 2. The Callback (Webhook) Safaricom hits
export const mpesaCallbackHandler = async (req: Request, res: Response): Promise<void> => {
  const { Body } = req.body;
  
  // Safely extract CheckoutRequestID
  const checkoutRequestId = Body?.stkCallback?.CheckoutRequestID;

  if (!checkoutRequestId) {
    res.status(400).json({ error: "Invalid callback payload" });
    return;
  }

  try {
    // RECORD THE CALLBACK LOG (For your audit trail)
    await db.insert(mpesaLogs).values({
      checkoutRequestId,
      rawResponse: Body,
    });

    // Check if the transaction actually passed
    if (Body.stkCallback.ResultCode !== 0) {
      console.warn(`⚠️ M-Pesa Payment Failed [${checkoutRequestId}]: ${Body.stkCallback.ResultDesc}`);
      res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" }); 
      return;
    }

    // Extract Metadata
    const meta = Body.stkCallback.CallbackMetadata?.Item || [];
    const amount = meta.find((i: any) => i.Name === "Amount")?.Value.toString();
    const receipt = meta.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;

    // FIND BOOKING
    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.checkoutRequestId, checkoutRequestId));
    
    // TYPE GUARD: Fixes the "number | null" error
    if (!booking || booking.nationalId === null || booking.eventId === null) {
      console.error("❌ Booking not found or missing required IDs");
      res.status(404).json({ error: "Booking data incomplete" });
      return;
    }

    // 1. RECORD PAYMENT IN DB
    await createPaymentService({
      bookingId: booking.bookingId,
      nationalId: booking.nationalId, // TypeScript is now happy because of the guard above
      amount: amount || "0",
      paymentStatus: "Completed",
      paymentMethod: "M-Pesa",
      transactionId: receipt,
    });

    console.log(`✅ M-Pesa Payment Recorded: ${receipt}`);

    // 2. FETCH USER AND EVENT FOR TICKET
    const [user] = await db.select().from(users).where(eq(users.nationalId, booking.nationalId));
    const [event] = await db.select().from(events).where(eq(events.eventId, booking.eventId));

    // Final safety check before sending email
    if (user?.email && event && user.firstName && user.lastName && booking.ticketTypeName && booking.totalAmount !== null) {
      const ticketInfo = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalId: user.nationalId,
        eventName: event.title,
        ticketType: booking.ticketTypeName,
        quantity: booking.quantity,
        price: Number(booking.totalAmount) / booking.quantity,
        total: Number(booking.totalAmount),
        paymentStatus: "Completed" as const,
        bookingDate: booking.createdAt,
      };

      const emailResult = await sendTicket(ticketInfo);
      console.log(`📨 Ticket sent to ${user.email}:`, emailResult);
    }

    // Tell Safaricom we got the message
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("❌ M-Pesa Callback Critical Error:", error);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
  }
};