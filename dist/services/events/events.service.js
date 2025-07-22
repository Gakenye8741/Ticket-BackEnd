"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventService = exports.updateEventService = exports.createEventService = exports.getEventsByUserIdService = exports.getEventWithVenueService = exports.getEventsByCategoryService = exports.getEventsByTitleService = exports.getEventByIdService = exports.getAllEventsService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
// 🔍 Get all events
const getAllEventsService = async () => {
    return await db_1.default.query.events.findMany({
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.events.createdAt)],
        with: {
            venue: true,
        },
    });
};
exports.getAllEventsService = getAllEventsService;
// 🔍 Get event by ID
const getEventByIdService = async (eventId) => {
    return await db_1.default.query.events.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.events.eventId, eventId),
        with: {
            venue: true,
        },
    });
};
exports.getEventByIdService = getEventByIdService;
// 🔍 Get events by title (case-insensitive, partial match)
const getEventsByTitleService = async (title) => {
    return await db_1.default.query.events.findMany({
        where: (0, drizzle_orm_1.ilike)(schema_1.events.title, `%${title}%`),
        with: {
            venue: true,
        },
    });
};
exports.getEventsByTitleService = getEventsByTitleService;
// 🔍 Get events by category (case-insensitive, partial match)
const getEventsByCategoryService = async (category) => {
    return await db_1.default.query.events.findMany({
        where: (0, drizzle_orm_1.ilike)(schema_1.events.category, `%${category}%`),
        with: {
            venue: true,
        },
    });
};
exports.getEventsByCategoryService = getEventsByCategoryService;
// 🔍 Get event with venue (alias of getEventByIdService)
const getEventWithVenueService = async (eventId) => {
    return await db_1.default.query.events.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.events.eventId, eventId),
        with: {
            venue: true,
        },
    });
};
exports.getEventWithVenueService = getEventWithVenueService;
// 🔍 Get events by user's nationalId (based on bookings)
const getEventsByUserIdService = async (nationalId) => {
    // Fetch bookings related to the user
    const userBookings = await db_1.default.query.bookings.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.bookings.nationalId, nationalId),
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.bookings.createdAt)], // Or order by event date, etc.
    });
    // Extract event IDs from the bookings and filter out null values
    const eventIds = userBookings.map((booking) => booking.eventId).filter((eventId) => eventId !== null);
    // Ensure that eventIds is not empty before proceeding
    if (eventIds.length === 0) {
        return [];
    }
    // Fetch the events using the extracted event IDs
    const eventsList = await db_1.default.query.events.findMany({
        where: (0, drizzle_orm_1.inArray)(schema_1.events.eventId, eventIds), // Use inArray to match multiple event IDs
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.events.createdAt)], // Or order by event date, etc.
        with: {
            venue: true,
        },
    });
    return eventsList;
};
exports.getEventsByUserIdService = getEventsByUserIdService;
// ➕ Create a new event
const createEventService = async (event) => {
    await db_1.default.insert(schema_1.events).values(event).returning();
    return "Event created successfully ✅";
};
exports.createEventService = createEventService;
// 🔄 Update event
const updateEventService = async (eventId, event) => {
    await db_1.default.update(schema_1.events).set(event).where((0, drizzle_orm_1.eq)(schema_1.events.eventId, eventId));
    return "Event updated successfully 🔄";
};
exports.updateEventService = updateEventService;
// 🗑️ Delete event
const deleteEventService = async (eventId) => {
    await db_1.default.delete(schema_1.events).where((0, drizzle_orm_1.eq)(schema_1.events.eventId, eventId));
    return "Event deleted successfully ❌";
};
exports.deleteEventService = deleteEventService;
