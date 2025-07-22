"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketTypeByName = exports.cancelBookingService = exports.updateBookingStatusService = exports.createBookingService = exports.deleteBookingService = exports.updateBookingService = exports.getBookingsByEventIdService = exports.getBookingsByUserNationalIdService = exports.getBookingByIdService = exports.getAllBookingsService = void 0;
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Get All Bookings
const getAllBookingsService = async () => {
    const result = await db_1.default
        .select()
        .from(schema_1.bookings)
        .execute();
    if (!result.length) {
        throw new Error("No bookings found");
    }
    return result;
};
exports.getAllBookingsService = getAllBookingsService;
// Get Booking By ID
const getBookingByIdService = async (bookingId) => {
    const result = await db_1.default
        .select()
        .from(schema_1.bookings)
        .where((0, drizzle_orm_1.eq)(schema_1.bookings.bookingId, bookingId))
        .limit(1)
        .execute();
    if (!result.length) {
        throw new Error("Booking not found");
    }
    return result[0];
};
exports.getBookingByIdService = getBookingByIdService;
// Get Bookings By User National ID
const getBookingsByUserNationalIdService = async (nationalId) => {
    const result = await db_1.default
        .select()
        .from(schema_1.bookings)
        .where((0, drizzle_orm_1.eq)(schema_1.bookings.nationalId, nationalId))
        .execute();
    if (!result.length) {
        throw new Error(`No bookings found for national ID ${nationalId}`);
    }
    return result;
};
exports.getBookingsByUserNationalIdService = getBookingsByUserNationalIdService;
// Get Bookings By Event ID
const getBookingsByEventIdService = async (eventId) => {
    const result = await db_1.default
        .select()
        .from(schema_1.bookings)
        .where((0, drizzle_orm_1.eq)(schema_1.bookings.eventId, eventId))
        .execute();
    if (!result.length) {
        throw new Error(`No bookings found for event ID ${eventId}`);
    }
    return result;
};
exports.getBookingsByEventIdService = getBookingsByEventIdService;
// Update Booking
const updateBookingService = async (bookingId, updateData) => {
    const result = await db_1.default
        .update(schema_1.bookings)
        .set(updateData)
        .where((0, drizzle_orm_1.eq)(schema_1.bookings.bookingId, bookingId))
        .returning();
    if (!result.length) {
        throw new Error("Booking not found for update");
    }
    return "Booking updated successfully";
};
exports.updateBookingService = updateBookingService;
// Delete Booking
const deleteBookingService = async (bookingId) => {
    const result = await db_1.default
        .delete(schema_1.bookings)
        .where((0, drizzle_orm_1.eq)(schema_1.bookings.bookingId, bookingId))
        .returning();
    if (!result.length) {
        throw new Error("Booking not found for deletion");
    }
    return "Booking deleted successfully";
};
exports.deleteBookingService = deleteBookingService;
// Create Booking
const createBookingService = async (bookingData) => {
    const { ticketTypeId, quantity, totalAmount, nationalId, eventId } = bookingData;
    if (ticketTypeId === null || typeof ticketTypeId !== 'number') {
        throw new Error("Invalid or missing ticket type ID provided for booking.");
    }
    const ticketTypeResult = await db_1.default
        .select()
        .from(schema_1.ticketTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, ticketTypeId))
        .limit(1)
        .execute();
    if (!ticketTypeResult.length) {
        throw new Error("Ticket type not found");
    }
    const ticket = ticketTypeResult[0];
    if (ticket.quantity === null || ticket.quantity < quantity) {
        throw new Error("Not enough tickets available");
    }
    const transaction = await db_1.default.transaction(async (tx) => {
        try {
            await tx.update(schema_1.ticketTypes)
                .set({ quantity: ticket.quantity - quantity })
                .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, ticketTypeId));
            const newBooking = await tx.insert(schema_1.bookings)
                .values({ ...bookingData, bookingStatus: "Pending" })
                .returning();
            return newBooking;
        }
        catch (error) {
            throw new Error(error.message || "Failed to create booking transaction");
        }
    });
    return transaction;
};
exports.createBookingService = createBookingService;
// Update Booking Status
const updateBookingStatusService = async (bookingId, status) => {
    const bookingQueryResult = await db_1.default
        .select()
        .from(schema_1.bookings)
        .where((0, drizzle_orm_1.eq)(schema_1.bookings.bookingId, bookingId))
        .limit(1)
        .execute();
    if (!bookingQueryResult.length) {
        throw new Error("Booking not found");
    }
    const booking = bookingQueryResult[0];
    if (booking.ticketTypeId === null || typeof booking.ticketTypeId !== 'number') {
        throw new Error("Booking has an invalid or missing ticket type ID.");
    }
    const bookedTicketTypeId = booking.ticketTypeId;
    const ticketTypeQueryResult = await db_1.default
        .select()
        .from(schema_1.ticketTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, bookedTicketTypeId))
        .limit(1)
        .execute();
    if (!ticketTypeQueryResult.length) {
        throw new Error("Ticket type not found for the booking");
    }
    const ticket = ticketTypeQueryResult[0];
    await db_1.default.transaction(async (tx) => {
        if (status === "Confirmed") {
            if (ticket.quantity === null || ticket.quantity < booking.quantity) {
                throw new Error("Not enough tickets available to confirm this booking.");
            }
            await tx.update(schema_1.ticketTypes)
                .set({ quantity: ticket.quantity - booking.quantity })
                .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, bookedTicketTypeId));
        }
        await tx.update(schema_1.bookings)
            .set({ bookingStatus: status })
            .where((0, drizzle_orm_1.eq)(schema_1.bookings.bookingId, bookingId));
    });
    return { message: "Booking status updated successfully" };
};
exports.updateBookingStatusService = updateBookingStatusService;
// Cancel Booking
const cancelBookingService = async (bookingId) => {
    const bookingQueryResult = await db_1.default
        .select()
        .from(schema_1.bookings)
        .where((0, drizzle_orm_1.eq)(schema_1.bookings.bookingId, bookingId))
        .limit(1)
        .execute();
    if (!bookingQueryResult.length) {
        throw new Error("Booking not found");
    }
    const booking = bookingQueryResult[0];
    if (booking.ticketTypeId === null || typeof booking.ticketTypeId !== 'number') {
        throw new Error("Booking has an invalid or missing ticket type ID.");
    }
    const bookedTicketTypeId = booking.ticketTypeId;
    const ticketTypeQueryResult = await db_1.default
        .select()
        .from(schema_1.ticketTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, bookedTicketTypeId))
        .limit(1)
        .execute();
    if (!ticketTypeQueryResult.length) {
        throw new Error("Ticket type not found for the booking");
    }
    const ticket = ticketTypeQueryResult[0];
    await db_1.default.transaction(async (tx) => {
        const newQuantity = (ticket.quantity || 0) + booking.quantity;
        await tx.update(schema_1.ticketTypes)
            .set({ quantity: newQuantity })
            .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, bookedTicketTypeId));
        await tx.update(schema_1.bookings)
            .set({ bookingStatus: "Cancelled" })
            .where((0, drizzle_orm_1.eq)(schema_1.bookings.bookingId, bookingId));
    });
    return { message: "Booking cancelled and ticket quantity updated" };
};
exports.cancelBookingService = cancelBookingService;
// New function to get ticket type by name
const getTicketTypeByName = async (name) => {
    const result = await db_1.default
        .select()
        .from(schema_1.ticketTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.name, name)) // Assuming name is the field for ticket type
        .limit(1)
        .execute();
    if (!result.length) {
        throw new Error("Ticket type not found");
    }
    return result[0]; // Return the first matching ticket type
};
exports.getTicketTypeByName = getTicketTypeByName;
