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

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT;

// ✅ Webhook route first — requires raw body
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

// ✅ Middlewares (after webhook)
app.use(cors());
app.use(express.json()); // ❗ Must come after webhook route
app.use(logger); // custom logger middleware

// ✅ Default route
app.get('/', (_req, res: Response) => {
  res.send("🚀 Welcome to the Event Ticketing & Venue Booking System API (Drizzle + PostgreSQL Designed by Gakenye Ndiritu😎)");
});

// ✅ API routes
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

// ✅ Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Server running at: http://localhost:${PORT}
  ✅ Event_Ticketing_&_Venue_Booking_System Backend Initialized!
  🛠️ Developed by: GAKENYE NDIRITU 😉😎
  `);
});
