import { Request, Response } from "express";
import Stripe from "stripe";
import db from "../../drizzle/db";
import { payments, bookings, users, events } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createPaymentService } from "./payment.service";
import { sendTicket } from "../../middleware/sendTicket";
import { issueTicketsAndQrsService } from "../qrcodeTickets/qrcode.service";

type InternalPaymentStatus = "Pending" | "Completed" | "Failed";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// 1. Create Stripe Checkout Session
export const createStripeCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const { bookingId, nationalId, amount, email, eventName, ticketTypeName, quantity } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "kes",
            product_data: {
              name: eventName || "Event Ticket",
              description: `Ticket Type: ${ticketTypeName || "Standard"} (Qty: ${quantity || 1})`,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: quantity || 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard/MyBookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard/MyBookings`,
      metadata: {
        bookingId: String(bookingId),
        nationalId: String(nationalId),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Stripe Checkout Session Error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// 2. Stripe Webhook Handler
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
    const amount = session.amount_total ? (session.amount_total / 100).toString() : "0";
    const transactionId = session.payment_intent as string;
    const paymentMethod = session.payment_method_types?.[0] ?? "card";

    if (!bookingId || !nationalId || !transactionId) {
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

        if (!booking || !booking.eventId) {
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