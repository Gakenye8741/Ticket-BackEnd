"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = void 0;
const stripe_1 = __importDefault(require("stripe"));
const payment_service_1 = require("./payment.service");
// Initialize Stripe with API version
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
});
const webhookHandler = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId ? Number(session.metadata.bookingId) : undefined;
        const nationalId = session.metadata?.nationalId ? Number(session.metadata.nationalId) : undefined;
        const amount = session.amount_total?.toString();
        const transactionId = session.payment_intent;
        const paymentMethod = session.payment_method_types?.[0] ?? "unknown";
        if (!bookingId || !transactionId || !amount || !nationalId) {
            console.error("❌ Missing required metadata in Stripe session");
            res.status(400).json({ error: "Missing required metadata" });
            return;
        }
        let paymentStatus = "Pending";
        const stripeStatus = session.payment_status;
        if (stripeStatus === "paid") {
            paymentStatus = "Completed";
        }
        else if (stripeStatus === "unpaid" || stripeStatus === "failed") {
            paymentStatus = "Failed";
        }
        try {
            await (0, payment_service_1.createPaymentService)({
                bookingId,
                nationalId,
                amount,
                paymentStatus,
                paymentMethod,
                transactionId,
            });
            console.log(`✅ Payment recorded for booking ${bookingId}`);
        }
        catch (err) {
            console.error("❌ Failed to save payment in DB", err);
            res.status(500).json({ error: "Database insert failed" });
            return;
        }
    }
    res.status(200).json({ received: true });
};
exports.webhookHandler = webhookHandler;
