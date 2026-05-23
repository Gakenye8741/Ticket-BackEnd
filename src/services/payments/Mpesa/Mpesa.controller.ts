import { Request, Response } from "express";
import { initiateStkPush } from "./Mpesa.service";
import { bookings, events, mpesaLogs, users } from "../../../drizzle/schema";
import db from "../../../drizzle/db";
import { eq, and, isNotNull } from "drizzle-orm"; 
import { createPaymentService } from "../payment.service";
import { sendTicket } from "../../../middleware/sendTicket";
import { issueTicketsAndQrsService } from "../../qrcodeTickets/qrcode.service";

// 1. Initiate the prompt on the user's phone
export const handleStkPush = async (req: Request, res: Response) => {
  const { amount, phoneNumber, bookingId } = req.body;
  try {
    const result = await initiateStkPush(amount, phoneNumber, bookingId);
    
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
  const checkoutRequestId = Body?.stkCallback?.CheckoutRequestID;

  console.log("🔍 [LOG 1/6] Incoming M-Pesa Webhook Callback received...");

  if (!checkoutRequestId) {
    console.error("❌ Callback Error: Missing CheckoutRequestID in payload body.");
    res.status(400).json({ error: "Invalid callback payload" });
    return;
  }

  try {
    // 1. Log the incoming audit record instantly
    await db.insert(mpesaLogs).values({
      checkoutRequestId,
      rawResponse: Body,
    });
    console.log(`📝 [LOG 2/6] Raw callback payload inserted into mpesaLogs table for ID: ${checkoutRequestId}`);

    if (Body.stkCallback.ResultCode !== 0) {
      console.warn(`⚠️ M-Pesa Payment Failed [${checkoutRequestId}]: ${Body.stkCallback.ResultDesc}`);
      res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted", internalStatus: "Payment failed or cancelled by user" }); 
      return;
    }

    const meta = Body.stkCallback.CallbackMetadata?.Item || [];
    const amount = meta.find((i: any) => i.Name === "Amount")?.Value.toString();
    const receipt = meta.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;

    console.log(`💵 [LOG 3/6] Payment Success Metadata detected. Receipt: ${receipt}, Amount: KES ${amount}`);

    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.checkoutRequestId, checkoutRequestId));
    
    // TYPE GUARD: Validates structural presence in main thread
    if (!booking || booking.nationalId === null || booking.eventId === null) {
      console.error("❌ Booking validation failed: Entry not found or missing critical tracking IDs");
      res.status(404).json({ error: "Booking data incomplete" });
      return;
    }

    // FIX: Lock down non-nullable types explicitly so the compiler is happy
    const verifiedNationalId: number = booking.nationalId;
    const verifiedEventId: number = booking.eventId;

    // 2. Persist transaction data record immediately
    await createPaymentService({
      bookingId: booking.bookingId,
      nationalId: verifiedNationalId, 
      amount: amount || "0",
      paymentStatus: "Completed",
      paymentMethod: "M-Pesa",
      transactionId: receipt,
    });

    console.log(`✅ [LOG 4/6] Payment status committed to payment records: ${receipt}. Starting ticket construction...`);

    // Variables to track our email outcome status for the HTTP response body
    let emailDispatched = false;
    let emailLogSummary = "Email loop skipped - user or event context conditions not fully satisfied.";

    try {
      // A. Create the secure tickets and QR assets
      console.log("🎟️ [LOG 5/6] Generating cryptographic tokens and converting to scannable QR data URIs...");
      const qrCodesArray = await issueTicketsAndQrsService(
        booking.bookingId,
        verifiedEventId,
        verifiedNationalId,
        booking.quantity
      );
      console.log(`✨ Successfully generated ${qrCodesArray.length} ticket record(s) and asset strings.`);

      // B. Fetch contextual data tables safely using the verified strict primitives
      const [user] = await db.select().from(users).where(eq(users.nationalId, verifiedNationalId));
      const [event] = await db.select().from(events).where(eq(events.eventId, verifiedEventId));

      // C. Dispatch compiled email templates instantly
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
          qrCodes: qrCodesArray, 
        };

        console.log(`📨 [LOG 6/6] Packaging mail options. Transmitting tickets to email client: ${user.email}...`);
        
        // 🚀 We now await this directly so your test client catches the exact resolution state!
        emailDispatched = await sendTicket(ticketInfo);
        
        if (emailDispatched) {
          emailLogSummary = `Ticket successfully emailed and verified by SMTP transmission service to ${user.email}`;
          console.log(`📨 [AUTO-DISPATCH SUCCESS] ${emailLogSummary}`);
        } else {
          emailLogSummary = `Nodemailer transmission rejected or failed for destination address: ${user.email}`;
          console.error(`❌ [AUTO-DISPATCH FAILURE] ${emailLogSummary}`);
        }
      } else {
        console.warn("⚠️ Email preparation aborted. Missing conditions: Ensure User account contains an email address and Event title maps accurately.");
      }
    } catch (bgError: any) {
      emailLogSummary = `An execution error occurred inside the ticketing engine branch: ${bgError.message}`;
      console.error("❌ Critical Failure inside Ticket Automation Pipeline:", bgError);
    }

    // 3. Return the exact diagnostic log report back as a JSON payload response
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: "Success",
      testingDiagnostics: {
        paymentStatus: "Completed",
        mpesaReceipt: receipt,
        emailSentSuccessfully: emailDispatched,
        statusLog: emailLogSummary
      }
    });

  } catch (error) {
    console.error("❌ M-Pesa Callback Critical Error:", error);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
  }
};