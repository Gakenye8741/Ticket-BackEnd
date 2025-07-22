"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = require("express");
const bookings_controller_1 = require("./bookings.controller");
const bearAuth_1 = require("../../middleware/bearAuth");
exports.bookingRouter = (0, express_1.Router)();
// 📦 Booking Routes
// 📋 Get all bookings (Admin only)
exports.bookingRouter.get("/bookings", bookings_controller_1.getAllBookings);
// 🔍 Get booking by ID (Admin only)
exports.bookingRouter.get("/bookings/:id", bearAuth_1.adminAuth, bookings_controller_1.getBookingById);
// 👤 Get bookings by user national ID (Authenticated user)
exports.bookingRouter.get("/bookings/user/national-id/:nationalId", bookings_controller_1.getBookingsByUserNationalId);
// 🎟️ Get bookings by event ID (Admin only)
exports.bookingRouter.get("/bookings/event/:eventId", bearAuth_1.adminAuth, bookings_controller_1.getBookingsByEventId);
// ➕ Create a new booking (Authenticated user)
exports.bookingRouter.post("/bookings", bearAuth_1.anyAuthenticatedUser, bookings_controller_1.createBooking);
// 📝 Update an existing booking (Authenticated user)
exports.bookingRouter.put("/bookings/:id", bearAuth_1.anyAuthenticatedUser, bookings_controller_1.updateBooking);
// 🗑️ Delete a booking (Authenticated user)
exports.bookingRouter.delete("/bookings/:id", bearAuth_1.anyAuthenticatedUser, bookings_controller_1.deleteBooking);
// 🔄 Update booking status (Admin only)
exports.bookingRouter.patch("/bookings/:id/status", bearAuth_1.adminAuth, bookings_controller_1.updateBookingStatus);
// ❌ Cancel a booking (Authenticated user)
exports.bookingRouter.patch("/bookings/:id/cancel", bearAuth_1.anyAuthenticatedUser, bookings_controller_1.cancelBooking);
