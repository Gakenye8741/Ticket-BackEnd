import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { tickets } from "../../drizzle/schema"; // Removed 'bookings' from here
import QRCode from "qrcode";
import crypto from "node:crypto";

/**
 * 1. Generates a secure Base64 PNG Image URL from a ticket token string.
 * High error correction ('H') ensures it scans fast even on cracked phone screens.
 */
export const generateQrCodeDataUrl = async (token: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: "H", // High tolerance for fast gate scanning
      margin: 2,
      width: 300,
      color: {
        dark: "#000000",  // Crisp black pixels
        light: "#FFFFFF", // Clean white background
      },
    });
    return dataUrl; // Format: "data:image/png;base64,iVBORw0KG..."
  } catch (error) {
    console.error("❌ QR Generation Error:", error);
    throw new Error("Failed to generate scannable QR Code asset.");
  }
};

/**
 * 2. Fetches a ticket structure by its random token.
 * Pulls event metadata and holder details so the scanner app displays context.
 */
export const findTicketByTokenService = async (token: string) => {
  return await db.query.tickets.findFirst({
    where: eq(tickets.ticketToken, token),
    with: {
      event: true, // Pulls title, date, location context
      user: {
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * 3. Marks a valid ticket as scanned inside a central timestamp transaction.
 */
export const markTicketAsScannedService = async (ticketId: number) => {
  return await db
    .update(tickets)
    .set({
      isScanned: true,
      scannedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tickets.ticketId, ticketId))
    .returning();
};

/**
 * 4. Generates raw database ticket rows and maps corresponding scannable base64 image strings.
 * Use this right after your M-Pesa callbacks or Stripe Webhooks report a successful transaction.
 */
export const issueTicketsAndQrsService = async (
  bookingId: number,
  eventId: number,
  nationalId: number,
  quantity: number
) => {
  // A. Build raw row records using unguessable UUID values
  const ticketsToInsert = Array.from({ length: quantity }).map(() => ({
    bookingId,
    eventId,
    nationalId,
    ticketToken: crypto.randomUUID(),
  }));

  // B. Save to Postgres
  const savedTickets = await db.insert(tickets).values(ticketsToInsert).returning();

  // C. Map database tokens into scannable image strings concurrently
  const qrCodes = await Promise.all(
    savedTickets.map(async (ticket) => {
      const qrDataUrl = await generateQrCodeDataUrl(ticket.ticketToken);
      return {
        ticketId: ticket.ticketId,
        ticketToken: ticket.ticketToken,
        qrDataUrl, // Hand this property over to your email service template generator
      };
    })
  );

  return qrCodes;
};