import express, { Application, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { logger } from './middleware/logger';

// Route Imports
import { authRouter } from './auth/auth.route';
import { userRouter } from './services/users/user.route';
import { TicketsRoute } from './services/tickets/ticket.route';
import { venueRoute } from './services/venue/venue.route';
import { eventRouter } from './services/events/events.route';
import { bookingRouter } from './services/bookings/bookings.route';
import { paymentRouter } from './services/payments/payments.route';
import { ticketRouter } from './services/TicketType/ticket.route';
import mediaRouter from './services/media/media.route';
import responseRoute from './services/AdminResponses/response.route';
import sendTicketEmailRoute from './middleware/emailTicket';
import MpesaRoute from './services/payments/Mpesa/Mpesa.route';
import qrTicketRoutes from './services/qrcodeTickets/qrcode.route';
import { webhookHandler } from './services/payments/payment.webhook';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// --- 1. WEBHOOKS (Must be raw) ---
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), webhookHandler);

// --- 2. GLOBAL MIDDLEWARE ---
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://ticketstream-events.netlify.app"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(logger);

// --- 3. HEALTH CHECK ---
app.get('/', (_req, res: Response) => {
  res.status(200).json({
    message: "🚀 TicketStream API Operational",
    developer: "Gakenye Ndiritu",
    status: "Active"
  });
});

// --- 4. API ROUTE REGISTRATION ---
const apiRoutes = [
  { path: '/api', router: authRouter },
  { path: '/api', router: userRouter },
  { path: '/api', router: TicketsRoute },
  { path: '/api', router: venueRoute },
  { path: '/api', router: eventRouter },
  { path: '/api', router: bookingRouter },
  { path: '/api', router: paymentRouter },
  { path: '/api', router: ticketRouter },
  { path: '/api', router: mediaRouter },
  { path: '/api', router: responseRoute },
  { path: '/api', router: sendTicketEmailRoute },
  { path: '/api', router: MpesaRoute },
  { path: '/api/tickets', router: qrTicketRoutes },
];

apiRoutes.forEach(({ path, router }) => app.use(path, router));

// --- 5. SERVER INITIALIZATION ---
app.listen(PORT, () => {
  console.clear();
  console.log(`
  ==========================================================
  🚀 TicketStream Backend Engine Initialized
  ----------------------------------------------------------
  Port:         ${PORT}
  Environment:  ${process.env.NODE_ENV || 'development'}
  Developer:    GAKENYE NDIRITU
  Status:       Ready for Requests ⚡
  ==========================================================
  `);
});