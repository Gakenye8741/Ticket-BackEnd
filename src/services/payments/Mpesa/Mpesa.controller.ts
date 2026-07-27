import { Request, Response } from "express";
import Stripe from "stripe";
import { initiateStkPush } from "./Mpesa.service";
import { bookings, events, mpesaLogs, users } from "../../../drizzle/schema";
import db from "../../../drizzle/db";
import { eq } from "drizzle-orm"; 
import { createPaymentService } from "../payment.service";
import { sendTicket } from "../../../middleware/sendTicket";
import { issueTicketsAndQrsService } from "../../qrcodeTickets/qrcode.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

type InternalPaymentStatus = "Pending" | "Completed" | "Failed";

// 0. Create Stripe Checkout Session (Initiates payment page)
export const createStripeCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const { bookingId, nationalId, amount, email, eventName, ticketTypeName, quantity } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "kes", // Change to "usd" or your preferred currency if needed
            product_data: {
              name: eventName || "Event Ticket",
              description: `Ticket Type: ${ticketTypeName} (Qty: ${quantity})`,
            },
            unit_amount: Math.round(Number(amount) * 100), // Stripe expects amounts in cents/smallest currency unit
          },
          quantity: quantity || 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-cancelled`,
      metadata: {
        bookingId: bookingId.toString(),
        nationalId: nationalId.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Stripe Checkout Session Error:", error.message);
    res.status(500).json({ error: "Failed to create Stripe checkout session" });
  }
};

// 1. Initiate the prompt on the user's phone (M-Pesa)
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

// 2. The M-Pesa Callback (Webhook) Safaricom hits
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
    
    if (!booking || booking.nationalId === null || booking.eventId === null) {
      console.error("❌ Booking validation failed: Entry not found or missing critical tracking IDs");
      res.status(404).json({ error: "Booking data incomplete" });
      return;
    }

    const verifiedNationalId: number = booking.nationalId;
    const verifiedEventId: number = booking.eventId;

    await createPaymentService({
      bookingId: booking.bookingId,
      nationalId: verifiedNationalId, 
      amount: amount || "0",
      paymentStatus: "Completed",
      paymentMethod: "M-Pesa",
      transactionId: receipt,
    });

    console.log(`✅ [LOG 4/6] Payment status committed to payment records: ${receipt}. Starting ticket construction...`);

    let emailDispatched = false;
    let emailLogSummary = "Email loop skipped - user or event context conditions not fully satisfied.";

    try {
      console.log("🎟️ [LOG 5/6] Generating cryptographic tokens and converting to scannable QR data URIs...");
      const qrCodesArray = await issueTicketsAndQrsService(
        booking.bookingId,
        verifiedEventId,
        verifiedNationalId,
        booking.quantity
      );
      console.log(`✨ Successfully generated ${qrCodesArray.length} ticket record(s) and asset strings.`);

      const [user] = await db.select().from(users).where(eq(users.nationalId, verifiedNationalId));
      const [event] = await db.select().from(events).where(eq(events.eventId, verifiedEventId));

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
        emailDispatched = await sendTicket(ticketInfo);
        
        if (emailDispatched) {
          emailLogSummary = `Ticket successfully emailed and verified by SMTP transmission service to ${user.email}`;
          console.log(`📨 [AUTO-DISPATCH SUCCESS] ${emailLogSummary}`);
        } else {
          emailLogSummary = `Nodemailer transmission rejected or failed for destination address: ${user.email}`;
          console.error(`❌ [AUTO-DISPATCH FAILURE] ${emailLogSummary}`);
        }
      } else {
        console.warn("⚠️ Email preparation aborted. Missing conditions.");
      }
    } catch (bgError: any) {
      emailLogSummary = `An execution error occurred inside the ticketing engine branch: ${bgError.message}`;
      console.error("❌ Critical Failure inside Ticket Automation Pipeline:", bgError);
    }

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

// 3. The Stripe Webhook Handler (Integrated into same controller file)
export const stripeWebhookHandler = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Stripe webhook verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingId = Number(session.metadata?.bookingId);
    const nationalId = Number(session.metadata?.nationalId);
    const amount = session.amount_total?.toString();
    const transactionId = session.payment_intent as string;
    const paymentMethod = session.payment_method_types?.[0] ?? "card";

    if (!bookingId || !nationalId || !transactionId || !amount) {
      console.error("❌ Missing required metadata in session");
      res.status(400).json({ error: "Missing metadata" });
      return;
    }

    let paymentStatus: InternalPaymentStatus = "Pending";
    if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
      paymentStatus = "Completed";
    } else {
      paymentStatus = "Failed";
    }

    try {
      await createPaymentService({
        bookingId,
        nationalId,
        amount,
        paymentStatus,
        paymentMethod,
        transactionId,
      });

      console.log("✅ Stripe Payment recorded in DB:", { bookingId, transactionId });

      if (paymentStatus === "Completed") {
        const [booking] = await db.select().from(bookings).where(eq(bookings.bookingId, bookingId));
        const [user] = await db.select().from(users).where(eq(users.nationalId, nationalId));

        if (!booking || !booking.eventId || booking.eventId === null) {
          console.error("❌ Booking or eventId missing");
          res.status(400).json({ error: "Booking missing or invalid" });
          return;
        }

        const verifiedEventId: number = booking.eventId;
        const [eventRecord] = await db.select().from(events).where(eq(events.eventId, verifiedEventId));

        const qrCodesArray = await issueTicketsAndQrsService(
          booking.bookingId,
          verifiedEventId,
          nationalId,
          booking.quantity
        );

        if (user && eventRecord && user.email && user.firstName && user.lastName && booking.ticketTypeName && booking.totalAmount !== null) {
          const ticketInfo = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            nationalId: user.nationalId,
            eventName: eventRecord.title,
            ticketType: booking.ticketTypeName,
            quantity: booking.quantity,
            price: Number(booking.totalAmount) / booking.quantity,
            total: Number(booking.totalAmount),
            paymentStatus,
            bookingDate: booking.createdAt,
            qrCodes: qrCodesArray,
          };

          const emailResult = await sendTicket(ticketInfo);
          console.log(`📨 Stripe Ticket Email result for ${user.email}:`, emailResult);
        }
      }
    } catch (err) {
      console.error("❌ Stripe Webhook processing failed:", err);
      res.status(500).json({ error: "Webhook processing failed" });
      return;
    }
  }

  res.status(200).json({ received: true });
};