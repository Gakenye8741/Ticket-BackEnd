import { Router } from "express";
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByBookingId,
  getPaymentsByStatus,
  getPaymentsByNationalId, // ✅ Added this
  createPayment,
  updatePayment,
  deletePayment,
  createCheckoutSession,
} from "./payment.controller"; 
import { webhookHandler } from "./payment.webhook";

export const paymentRouter = Router();

// Search payments by status ("Pending", "Completed", "Failed")
paymentRouter.get("/payments-status-search", getPaymentsByStatus);

// ✅ Get payments by national ID
paymentRouter.get("/payments/national-id/:nationalId", getPaymentsByNationalId);

// Get all payments
paymentRouter.get("/payments", getAllPayments);

// Get payment by ID
paymentRouter.get("/payments/:id", getPaymentById);

// Get payments by Booking ID
paymentRouter.get("/payments/booking/:bookingId", getPaymentsByBookingId);

// Create a new payment
paymentRouter.post("/payments", createPayment);

// Update payment
paymentRouter.put("/payments/:id", updatePayment);

// Delete payment
paymentRouter.delete("/payments/:id", deletePayment);

// Stripe Checkout Session
paymentRouter.post("/payments/create-session", createCheckoutSession);

paymentRouter.post('/payment/webhook' ,webhookHandler)
