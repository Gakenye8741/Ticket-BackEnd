import { Router } from "express";
import { webhookHandler as stripeWebhook } from "../payment.webhook";
import { 
  handleStkPush, 
  mpesaCallbackHandler 
} from "./Mpesa.controller"; // Ensure the path matches your project structure

const router = Router();

/**
 * STRIPE ROUTES
 */
// Note: Stripe webhooks usually require the raw body for signature verification.
// If you're using a global json() parser, you might need a middleware exception here.
router.post("/stripe-webhook", stripeWebhook);

/**
 * M-PESA ROUTES
 */

// 1. Initiate the STK Push prompt on the user's phone
// URL: /api/v1/payments/mpesa/stk-push
router.post("/mpesa/stk-push", handleStkPush);

// 2. The Callback URL that Safaricom hits after user enters PIN
// URL: /api/v1/payments/mpesa-callback
// This must match the CallBackURL set in your Mpesa.service.ts
router.post("/mpesa-callback", mpesaCallbackHandler);

export default router;