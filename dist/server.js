"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./middleware/logger");
const user_route_1 = require("./services/users/user.route");
const ticket_route_1 = require("./services/tickets/ticket.route");
const venue_route_1 = require("./services/venue/venue.route");
const events_route_1 = require("./services/events/events.route");
const bookings_route_1 = require("./services/bookings/bookings.route");
const payments_route_1 = require("./services/payments/payments.route");
const auth_route_1 = require("./auth/auth.route");
const ticket_route_2 = require("./services/TicketType/ticket.route");
const media_route_1 = __importDefault(require("./services/media/media.route"));
const response_route_1 = __importDefault(require("./services/AdminResponses/response.route"));
const payment_webhook_1 = require("./services/payments/payment.webhook");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ✅ Webhook route first — requires raw body
app.post("/api/payment/webhook", express_1.default.raw({ type: "application/json" }), payment_webhook_1.webhookHandler);
// ✅ Middlewares (after webhook)
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // ❗ Must come after webhook route
app.use(logger_1.logger); // custom logger middleware
// ✅ Default route
app.get('/', (_req, res) => {
    res.send("🚀 Welcome to the Event Ticketing & Venue Booking System API (Drizzle + PostgreSQL Designed by Gakenye Ndiritu😎)");
});
// ✅ API routes
app.use('/api', auth_route_1.authRouter);
app.use('/api', user_route_1.userRouter);
app.use('/api', ticket_route_1.TicketsRoute);
app.use('/api', venue_route_1.venueRoute);
app.use('/api', events_route_1.eventRouter);
app.use('/api', bookings_route_1.bookingRouter);
app.use('/api', payments_route_1.paymentRouter);
app.use('/api', ticket_route_2.ticketRouter);
app.use('/api', media_route_1.default);
app.use('/api', response_route_1.default);
// ✅ Start server
app.listen(PORT, () => {
    console.log(`
  🚀 Server running at: http://localhost:${PORT}
  ✅ Event_Ticketing_&_Venue_Booking_System Backend Initialized!
  🛠️ Developed by: GAKENYE NDIRITU 😉😎
  `);
});
