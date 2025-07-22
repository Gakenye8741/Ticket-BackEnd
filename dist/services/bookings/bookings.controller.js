"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.updateBookingStatus = exports.deleteBooking = exports.updateBooking = exports.createBooking = exports.getBookingsByEventId = exports.getBookingsByUserNationalId = exports.getBookingById = exports.getAllBookings = void 0;
const bookings_service_1 = require("./bookings.service");
// -----------------------------------------------------------------------------
// 📚 GETTERS
// -----------------------------------------------------------------------------
// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const allBookings = await (0, bookings_service_1.getAllBookingsService)();
        if (!allBookings?.length) {
            res.status(404).json({ message: "🔍 No bookings found" });
            return;
        }
        res.status(200).json(allBookings);
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || "Failed to retrieve bookings"}` });
    }
};
exports.getAllBookings = getAllBookings;
// Get booking by ID
const getBookingById = async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
        res.status(400).json({ error: "🚫 Invalid booking ID" });
        return;
    }
    try {
        const booking = await (0, bookings_service_1.getBookingByIdService)(bookingId);
        if (!booking) {
            res.status(404).json({ message: "🔍 Booking not found" });
            return;
        }
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || "Failed to retrieve booking"}` });
    }
};
exports.getBookingById = getBookingById;
// Get bookings by User National ID
const getBookingsByUserNationalId = async (req, res) => {
    const nationalId = Number(req.params.nationalId);
    if (Number.isNaN(nationalId)) {
        res.status(400).json({ error: "🚫 Invalid national ID" });
        return;
    }
    try {
        const bookings = await (0, bookings_service_1.getBookingsByUserNationalIdService)(nationalId);
        if (!bookings?.length) {
            res.status(404).json({ message: `🔍 No bookings found for national ID ${nationalId}` });
            return;
        }
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || `Failed to retrieve bookings for national ID ${nationalId}`}` });
    }
};
exports.getBookingsByUserNationalId = getBookingsByUserNationalId;
// Get bookings by Event ID
const getBookingsByEventId = async (req, res) => {
    const eventId = Number(req.params.eventId);
    if (Number.isNaN(eventId)) {
        res.status(400).json({ error: "🚫 Invalid event ID" });
        return;
    }
    try {
        const bookings = await (0, bookings_service_1.getBookingsByEventIdService)(eventId);
        if (!bookings?.length) {
            res.status(404).json({ message: `🔍 No bookings found for event ID ${eventId}` });
            return;
        }
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || `Failed to retrieve bookings for event ID ${eventId}`}` });
    }
};
exports.getBookingsByEventId = getBookingsByEventId;
// -----------------------------------------------------------------------------
// ✍️ WRITERS
// -----------------------------------------------------------------------------
// Create new booking
const createBooking = async (req, res) => {
    const { nationalId, eventId, quantity, totalAmount, ticketTypeName } = req.body;
    // Basic presence validation
    if (!nationalId || !eventId || !quantity || !totalAmount || !ticketTypeName) {
        res.status(400).json({
            error: "⚠️ Essential fields (nationalId, eventId, quantity, totalAmount, ticketTypeName) are required",
        });
        return;
    }
    // Type coercion/validation
    const parsedNationalId = Number(nationalId);
    const parsedEventId = Number(eventId);
    const parsedQuantity = Number(quantity);
    const parsedTotalAmount = Number(totalAmount);
    if ([parsedNationalId, parsedEventId, parsedQuantity].some(Number.isNaN) || Number.isNaN(parsedTotalAmount)) {
        res.status(400).json({ error: "🚫 Invalid data types for eventId, quantity, totalAmount, or nationalId" });
        return;
    }
    try {
        // 🔍 Resolve ticket type via service
        const ticketType = await (0, bookings_service_1.getTicketTypeByName)(ticketTypeName);
        if (!ticketType) {
            res.status(404).json({ error: "🚫 Ticket type not found!" });
            return;
        }
        const newBooking = {
            nationalId: parsedNationalId,
            eventId: parsedEventId,
            quantity: parsedQuantity,
            totalAmount: parsedTotalAmount.toString(), // drizzle schema expects string
            ticketTypeId: ticketType.ticketTypeId,
        };
        const result = await (0, bookings_service_1.createBookingService)(newBooking);
        res.status(201).json({ message: "✅ Booking created successfully", booking: result });
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || "Failed to create booking"}` });
    }
};
exports.createBooking = createBooking;
// Update booking
const updateBooking = async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
        res.status(400).json({ error: "🚫 Invalid booking ID" });
        return;
    }
    const updateData = {};
    for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            let value = req.body[key];
            switch (key) {
                case "nationalId":
                case "eventId":
                case "quantity":
                case "ticketTypeId":
                    value = Number(value);
                    if (Number.isNaN(value)) {
                        res.status(400).json({ error: `🚫 Invalid number format for ${key}` });
                        return;
                    }
                    break;
                case "totalAmount":
                    value = Number(value);
                    if (Number.isNaN(value)) {
                        res.status(400).json({ error: `🚫 Invalid number format for ${key}` });
                        return;
                    }
                    value = value.toString();
                    break;
            }
            updateData[key] = value;
        }
    }
    if (!Object.keys(updateData).length) {
        res.status(400).json({ error: "📝 No fields provided for update" });
        return;
    }
    try {
        const result = await (0, bookings_service_1.updateBookingService)(bookingId, updateData);
        res.status(200).json({ message: `🔄 ${result}` });
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || "Failed to update booking"}` });
    }
};
exports.updateBooking = updateBooking;
// Delete booking
const deleteBooking = async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
        res.status(400).json({ error: "🚫 Invalid booking ID" });
        return;
    }
    try {
        const result = await (0, bookings_service_1.deleteBookingService)(bookingId);
        res.status(200).json({ message: `🗑️ ${result}` });
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || "Failed to delete booking"}` });
    }
};
exports.deleteBooking = deleteBooking;
// -----------------------------------------------------------------------------
// 🔄 STATUS HELPERS
// -----------------------------------------------------------------------------
// Update Booking Status
const updateBookingStatus = async (req, res) => {
    const bookingId = Number(req.params.id);
    const { status } = req.body;
    if (Number.isNaN(bookingId)) {
        res.status(400).json({ error: "🚫 Invalid booking ID" });
        return;
    }
    const validStatuses = ["Pending", "Confirmed", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
            error: `🚫 Invalid or missing status. Must be one of: ${validStatuses.join(", ")}`,
        });
        return;
    }
    try {
        const result = await (0, bookings_service_1.updateBookingStatusService)(bookingId, status);
        res.status(200).json({ message: `✅ ${result.message}` });
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || "Failed to update booking status"}` });
    }
};
exports.updateBookingStatus = updateBookingStatus;
// Cancel Booking
const cancelBooking = async (req, res) => {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
        res.status(400).json({ error: "🚫 Invalid booking ID" });
        return;
    }
    try {
        const result = await (0, bookings_service_1.cancelBookingService)(bookingId);
        res.status(200).json({ message: `✅ ${result}` });
    }
    catch (error) {
        res.status(500).json({ error: `🚫 ${error.message || "Failed to cancel booking"}` });
    }
};
exports.cancelBooking = cancelBooking;
// -----------------------------------------------------------------------------
// 📝 NOTE: Controller now aligns with the updated service layer.
// -----------------------------------------------------------------------------
