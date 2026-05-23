import { Router } from "express";
import { 
  verifyTicketGatePass, 
  getUserActiveWalletPasses, 
  manualIssueTickets 
} from "./qrcode.controller";
import { adminAuth, anyAuthenticatedUser } from "../../middleware/bearAuth";

const qrTicketRoutes = Router();

/**
 * 🎟️ 1. Gate Validation Scanner Route
 * POST /api/v1/tickets/verify
 * 
 * Secure Access: Restricted to admin accounts or assigned gate-keepers.
 * Validates a scannable QR ticket token and flags double-entries.
 */
qrTicketRoutes.post(
  "/verify", 
  adminAuth, 
  verifyTicketGatePass
);

/**
 * 📱 2. In-App Mobile Wallet Sync Route
 * GET /api/v1/tickets/my-passes/:nationalId
 * 
 * Secure Access: Open to any authenticated platform user profile.
 * Pulls all valid, active tickets and appends dynamic base64 barcodes.
 */
qrTicketRoutes.get(
  "/my-passes/:nationalId", 
  anyAuthenticatedUser, 
  getUserActiveWalletPasses
);

/**
 * 🛠️ 3. Direct Manual Ticket Issuance Route
 * POST /api/v1/tickets/issue
 * 
 * Secure Access: Strictly restricted to administrators.
 * Instantly provisions tickets and assets for debugging or manual bookings.
 */
qrTicketRoutes.post(
  "/issue", 
  adminAuth, 
  manualIssueTickets
);

export default qrTicketRoutes;