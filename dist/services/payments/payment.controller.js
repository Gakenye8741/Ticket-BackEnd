"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = exports.deletePayment = exports.updatePayment = exports.createPayment = exports.getPaymentsByStatus = exports.getPaymentsByNationalId = exports.getPaymentsByBookingId = exports.getPaymentById = exports.getAllPayments = void 0;
const stripe_1 = __importDefault(require("stripe"));
const payment_service_1 = require("./payment.service");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
});
// 📥 Get all payments
const getAllPayments = async (req, res) => {
    try {
        const allPayments = await (0, payment_service_1.getAllPaymentsService)();
        if (!allPayments || allPayments.length === 0) {
            res.status(404).json({ message: "🔍 No payments found" });
        }
        else {
            res.status(200).json(allPayments);
        }
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || "Failed to retrieve payments") });
    }
};
exports.getAllPayments = getAllPayments;
// 📥 Get payment by ID
const getPaymentById = async (req, res) => {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
        res.status(400).json({ error: "🚫 Invalid payment ID" });
        return;
    }
    try {
        const payment = await (0, payment_service_1.getPaymentByIdService)(paymentId);
        if (!payment) {
            res.status(404).json({ message: "🔍 Payment not found" });
        }
        else {
            res.status(200).json(payment);
        }
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || "Failed to retrieve payment") });
    }
};
exports.getPaymentById = getPaymentById;
// 📥 Get payments by Booking ID
const getPaymentsByBookingId = async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);
    if (isNaN(bookingId)) {
        res.status(400).json({ error: "🚫 Invalid booking ID" });
        return;
    }
    try {
        const payments = await (0, payment_service_1.getPaymentsByBookingIdService)(bookingId);
        if (!payments || payments.length === 0) {
            res.status(404).json({ message: `🔍 No payments found for booking ID ${bookingId}` });
        }
        else {
            res.status(200).json(payments);
        }
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || `Failed to retrieve payments for booking ID ${bookingId}`) });
    }
};
exports.getPaymentsByBookingId = getPaymentsByBookingId;
// 📥 Get payments by National ID
const getPaymentsByNationalId = async (req, res) => {
    const nationalId = parseInt(req.params.nationalId);
    if (isNaN(nationalId)) {
        res.status(400).json({ error: "🚫 Invalid national ID" });
        return;
    }
    try {
        const payments = await (0, payment_service_1.getPaymentsByNationalIdService)(nationalId);
        if (!payments || payments.length === 0) {
            res.status(404).json({ message: `🔍 No payments found for national ID ${nationalId}` });
        }
        else {
            res.status(200).json(payments);
        }
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || `Failed to retrieve payments for national ID ${nationalId}`) });
    }
};
exports.getPaymentsByNationalId = getPaymentsByNationalId;
// 📥 Get payments by Status
const getPaymentsByStatus = async (req, res) => {
    const status = req.query.status;
    if (!status) {
        res.status(400).json({ error: "⚠️ Missing status query parameter" });
        return;
    }
    const allowedStatuses = ["Pending", "Completed", "Failed"];
    if (!allowedStatuses.includes(status)) {
        res.status(400).json({ error: `🚫 Invalid status value. Allowed values: ${allowedStatuses.join(", ")}` });
        return;
    }
    try {
        const payments = await (0, payment_service_1.getPaymentsByStatusService)(status);
        if (!payments || payments.length === 0) {
            res.status(404).json({ message: `🔍 No payments found with status "${status}"` });
        }
        else {
            res.status(200).json(payments);
        }
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || `Failed to retrieve payments with status "${status}"`) });
    }
};
exports.getPaymentsByStatus = getPaymentsByStatus;
// ➕ Create new payment
const createPayment = async (req, res) => {
    const { bookingId, amount, paymentStatus, paymentMethod, transactionId, nationalId } = req.body;
    if (!bookingId || !amount || !nationalId) {
        res.status(400).json({ error: "⚠️ Required fields: bookingId, amount, nationalId" });
        return;
    }
    const parsedBookingId = parseInt(bookingId);
    const parsedAmount = parseFloat(amount);
    const parsedNationalId = parseInt(nationalId);
    if (isNaN(parsedBookingId) || isNaN(parsedAmount) || isNaN(parsedNationalId)) {
        res.status(400).json({ error: "🚫 Invalid number format for bookingId, amount, or nationalId" });
        return;
    }
    const newPayment = {
        bookingId: parsedBookingId,
        nationalId: parsedNationalId,
        amount: parsedAmount.toString(),
        paymentStatus: paymentStatus || "Pending",
        paymentMethod: paymentMethod || null,
        transactionId: transactionId || null,
    };
    try {
        const message = await (0, payment_service_1.createPaymentService)(newPayment);
        res.status(201).json({ message: "✅ " + message });
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || "Failed to create payment") });
    }
};
exports.createPayment = createPayment;
// 🔄 Update payment
const updatePayment = async (req, res) => {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
        res.status(400).json({ error: "🚫 Invalid payment ID" });
        return;
    }
    const updateData = {};
    for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            let value = req.body[key];
            if (["bookingId", "nationalId"].includes(key)) {
                value = parseInt(value);
                if (isNaN(value)) {
                    res.status(400).json({ error: `🚫 Invalid number format for ${key}` });
                    return;
                }
            }
            else if (key === "amount") {
                value = parseFloat(value);
                if (isNaN(value)) {
                    res.status(400).json({ error: `🚫 Invalid number format for ${key}` });
                    return;
                }
            }
            updateData[key] = value;
        }
    }
    if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: "📝 No fields provided for update" });
        return;
    }
    try {
        const result = await (0, payment_service_1.updatePaymentService)(paymentId, updateData);
        res.status(200).json({ message: "🔄 " + result });
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || "Failed to update payment") });
    }
};
exports.updatePayment = updatePayment;
// 🗑️ Delete payment
const deletePayment = async (req, res) => {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
        res.status(400).json({ error: "🚫 Invalid payment ID" });
        return;
    }
    try {
        const result = await (0, payment_service_1.deletePaymentService)(paymentId);
        res.status(200).json({ message: "🗑️ " + result });
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || "Failed to delete payment") });
    }
};
exports.deletePayment = deletePayment;
// 💳 Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
    const { amount, nationalId, bookingId } = req.body;
    if (typeof amount !== "number" ||
        typeof nationalId !== "number" ||
        typeof bookingId !== "number" ||
        amount <= 0) {
        res.status(400).json({
            error: "🚫 Invalid input. 'amount', 'nationalId', and 'bookingId' must be valid numbers.",
        });
        return;
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: amount, // amount in cents
                        product_data: {
                            name: "Ticket Booking Payment",
                            description: "Paying for the tickets",
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                nationalId: nationalId.toString(),
                bookingId: bookingId.toString(),
            },
            success_url: "http://localhost:5173/Dashboard/MyBookings",
            cancel_url: "http://localhost:5173/",
        });
        res.status(200).json({ url: session.url });
    }
    catch (error) {
        console.error("❌ Stripe checkout session error:", error);
        res.status(500).json({ error: "🚫 Failed to create checkout session" });
    }
};
exports.createCheckoutSession = createCheckoutSession;
