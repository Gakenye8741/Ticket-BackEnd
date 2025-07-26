import { Request, Response } from "express";
import Stripe from "stripe";
import db from "../../drizzle/db";
import { payments, bookings, users, events } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createPaymentService } from "./payment.service";
import { sendTicket } from "../../middleware/sendTicket";

type InternalPaymentStatus = "Pending" | "Completed" | "Failed";

type TicketInfo = {
  email: string;
  firstName: string;
  lastName: string;
  nationalId: number;
  eventName: string;
  ticketType: string;
  quantity: number;
  price: number;
  total: number;
  paymentStatus: InternalPaymentStatus;
  bookingDate: Date;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export const webhookHandler = async (req: Request, res: Response): Promise<void> => {
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
    const paymentMethod = session.payment_method_types?.[0] ?? "unknown";

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

      console.log("✅ Payment recorded in DB:", { bookingId, transactionId });

      if (paymentStatus === "Completed") {
        const [booking] = await db.select().from(bookings).where(eq(bookings.bookingId, bookingId));
        const [user] = await db.select().from(users).where(eq(users.nationalId, nationalId));

        if (!booking || !booking.eventId) {
          console.error("❌ Booking or eventId missing");
          res.status(400).json({ error: "Booking missing or invalid" });
          return;
        }

        const [event] = await db.select().from(events).where(eq(events.eventId, booking.eventId));

        if (!user || !event || !booking) {
          console.error("❌ Required user/event/booking not found");
          res.status(500).json({ error: "Incomplete data for ticket" });
          return;
        }

        if (
          !user.email ||
          !user.firstName ||
          !user.lastName ||
          !booking.ticketTypeName ||
          booking.totalAmount === null
        ) {
          console.error("❌ Incomplete data for sending ticket");
          res.status(500).json({ error: "Missing booking/user fields" });
          return;
        }

        const ticketInfo: TicketInfo = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          nationalId: user.nationalId,
          eventName: event.title,
          ticketType: booking.ticketTypeName,
          quantity: booking.quantity,
          price: Number(booking.totalAmount) / booking.quantity,
          total: Number(booking.totalAmount),
          paymentStatus,
          bookingDate: booking.createdAt,
        };

        const emailResult = await sendTicket(ticketInfo);
        console.log(`📨 Email result for ${user.email}:`, emailResult);
      }
    } catch (err) {
      console.error("❌ Webhook processing failed:", err);
      res.status(500).json({ error: "Webhook processing failed" });
      return;
    }
  }

  res.status(200).json({ received: true });
};
