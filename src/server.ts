import express, { Application, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { logger } from './middleware/logger';
import { userRouter } from './services/users/user.route';
import { TicketsRoute } from './services/tickets/ticket.route';
import { venueRoute } from './services/venue/venue.route';
import { eventRouter } from './services/events/events.route';
import { bookingRouter } from './services/bookings/bookings.route';
import { paymentRouter } from './services/payments/payments.route';
import { authRouter } from './auth/auth.route';
import { ticketRouter } from './services/TicketType/ticket.route';
import mediaRouter from './services/media/media.route';
import responseRoute from './services/AdminResponses/response.route';
import { webhookHandler } from './services/payments/payment.webhook';
import sendTicketEmailRoute from './middleware/emailTicket'
import MpesaRoute from './services/payments/Mpesa/Mpesa.route';
import router from './services/payments/Mpesa/Mpesa.route';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080; // ✅ Fallback for Azure compatibility

// ✅ Webhook route first — requires raw body
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

// ✅ Middlewares (after webhook)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://ticketstream-events.netlify.app" // ✅ Added protocol for production origin
  ],
  credentials: true,
}));

app.use(express.json()); // Must be after webhook
app.use(logger); // Custom logger middleware

// ✅ Health check / default route
app.get('/', (_req, res: Response) => {
  res.send("🚀 Welcome to the Event Ticketing & Venue Booking System API (Drizzle + PostgreSQL) — Designed by Gakenye Ndiritu 😎");
});

// ✅ Route registration
app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', TicketsRoute);
app.use('/api', venueRoute);
app.use('/api', eventRouter);
app.use('/api', bookingRouter);
app.use('/api', paymentRouter);
app.use('/api', ticketRouter);
app.use('/api', mediaRouter);
app.use('/api', responseRoute);
app.use('/api', sendTicketEmailRoute);
app.use('/api', router)

// ✅ Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Server running on port: ${PORT}
  ✅ Event_Ticketing_&_Venue_Booking_System Backend Initialized!
  🛠️ Developed by: GAKENYE NDIRITU 😉😎
  `);
});
