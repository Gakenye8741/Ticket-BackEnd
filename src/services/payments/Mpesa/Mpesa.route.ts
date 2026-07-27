import { Router, raw } from "express";
import { 
  handleStkPush, 
  mpesaCallbackHandler, 
  stripeWebhookHandler,
  createStripeCheckoutSession
} from "./Mpesa.controller";

const router = Router();

/**
 * STRIPE ROUTES
 */
// CRITICAL: Stripe requires the raw body buffer to verify signatures securely.
// Using raw({ type: "application/json" }) ensures express doesn't parse it prematurely.
router.post(
  "/stripe-webhook", 
  raw({ type: "application/json" }), 
  stripeWebhookHandler
);

// Create Stripe Checkout Session route
router.post("/stripe/create-checkout-session", createStripeCheckoutSession);

/**
 * M-PESA ROUTES
 */

// 1. Initiate the STK Push prompt on the user's phone
router.post("/mpesa/stk-push", handleStkPush);

// 2. The Callback URL that Safaricom hits after user enters PIN
router.post("/mpesa-callback", mpesaCallbackHandler);

export default router;