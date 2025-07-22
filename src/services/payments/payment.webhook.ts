import { Request, Response } from "express";
import Stripe from "stripe";
import db from "../../drizzle/db";
import { payments } from "../../drizzle/schema";
import { createPaymentService } from "./payment.service";

// Initialize Stripe with API version
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
    console.error("⚠️ Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingId = session.metadata?.bookingId ? Number(session.metadata.bookingId) : undefined;
    const nationalId = session.metadata?.nationalId ? Number(session.metadata.nationalId) : undefined;
    const amount = session.amount_total?.toString();
    const transactionId = session.payment_intent as string;
    const paymentMethod = session.payment_method_types?.[0] ?? "unknown";

    if (!bookingId || !transactionId || !amount || !nationalId) {
      console.error("❌ Missing required metadata in Stripe session");
      res.status(400).json({ error: "Missing required metadata" });
      return;
    }

    let paymentStatus: "Pending" | "Completed" | "Failed" = "Pending";
    const stripeStatus = session.payment_status as string;

    if (stripeStatus === "paid") {
      paymentStatus = "Completed";
    } else if (stripeStatus === "unpaid" || stripeStatus === "failed") {
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

      console.log(`✅ Payment recorded for booking ${bookingId}`);
    } catch (err) {
      console.error("❌ Failed to save payment in DB", err);
      res.status(500).json({ error: "Database insert failed" });
      return;
    }
  }

  res.status(200).json({ received: true });
};
