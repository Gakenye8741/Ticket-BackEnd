"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsesRelations = exports.mediaRelations = exports.supportTicketsRelations = exports.paymentsRelations = exports.bookingsRelations = exports.ticketTypesRelations = exports.eventsRelations = exports.venuesRelations = exports.usersRelations = exports.responses = exports.media = exports.supportTickets = exports.payments = exports.bookings = exports.ticketTypes = exports.events = exports.venues = exports.users = exports.priorityEnum = exports.mediaTypeEnum = exports.eventStatusEnum = exports.venueStatusEnum = exports.ticketStatusEnum = exports.paymentStatusEnum = exports.bookingStatusEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// =======================
// ENUMS
// =======================
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["user", "admin"]);
exports.bookingStatusEnum = (0, pg_core_1.pgEnum)("bookingStatus", ["Pending", "Confirmed", "Cancelled"]);
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)("paymentStatus", ["Pending", "Completed", "Failed"]);
exports.ticketStatusEnum = (0, pg_core_1.pgEnum)("status", ["Open", "In Progress", "Resolved", "Closed"]);
exports.venueStatusEnum = (0, pg_core_1.pgEnum)("venueStatus", ["available", "booked"]);
exports.eventStatusEnum = (0, pg_core_1.pgEnum)("eventStatus", ["in_progress", "ended", "cancelled", "upcoming"]);
exports.mediaTypeEnum = (0, pg_core_1.pgEnum)("mediaType", ["image", "video"]);
exports.priorityEnum = (0, pg_core_1.pgEnum)("priority", ["Low", "Medium", "High"]);
// =======================
// USERS
// =======================
exports.users = (0, pg_core_1.pgTable)("users", {
    nationalId: (0, pg_core_1.integer)("nationalId").primaryKey(),
    firstName: (0, pg_core_1.varchar)("firstName", { length: 15 }).notNull(),
    lastName: (0, pg_core_1.varchar)("lastName", { length: 15 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    contactPhone: (0, pg_core_1.varchar)("contactPhone", { length: 15 }),
    address: (0, pg_core_1.text)("address"),
    role: (0, exports.roleEnum)("role").default("user").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow().notNull(),
});
// =======================
// VENUES
// =======================
exports.venues = (0, pg_core_1.pgTable)("venues", {
    venueId: (0, pg_core_1.serial)("venueId").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    capacity: (0, pg_core_1.integer)("capacity").notNull(),
    status: (0, exports.venueStatusEnum)("status").default("available").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// =======================
// EVENTS
// =======================
exports.events = (0, pg_core_1.pgTable)("events", {
    eventId: (0, pg_core_1.serial)("eventId").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    venueId: (0, pg_core_1.integer)("venueId").references(() => exports.venues.venueId, { onDelete: "cascade" }),
    category: (0, pg_core_1.varchar)("category", { length: 100 }),
    date: (0, pg_core_1.date)("date").notNull(),
    time: (0, pg_core_1.time)("time").notNull(),
    ticketPrice: (0, pg_core_1.decimal)("ticketPrice", { precision: 10, scale: 2 }).notNull(),
    ticketsTotal: (0, pg_core_1.integer)("ticketsTotal").notNull(),
    ticketsSold: (0, pg_core_1.integer)("ticketsSold").default(0),
    status: (0, exports.eventStatusEnum)("eventStatus").default("in_progress").notNull(),
    cancellationPolicy: (0, pg_core_1.text)("cancellationPolicy"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow().notNull(),
});
// =======================
// TICKET TYPES
// =======================
exports.ticketTypes = (0, pg_core_1.pgTable)("ticketTypes", {
    ticketTypeId: (0, pg_core_1.serial)("ticketTypeId").primaryKey(),
    eventId: (0, pg_core_1.integer)("eventId").references(() => exports.events.eventId, { onDelete: "cascade" }).notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    price: (0, pg_core_1.decimal)("price", { precision: 10, scale: 2 }).notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// =======================
// BOOKINGS
// =======================
exports.bookings = (0, pg_core_1.pgTable)("bookings", {
    bookingId: (0, pg_core_1.serial)("bookingId").primaryKey(),
    nationalId: (0, pg_core_1.integer)("nationalId").references(() => exports.users.nationalId, { onDelete: "cascade" }),
    eventId: (0, pg_core_1.integer)("eventId").references(() => exports.events.eventId, { onDelete: "cascade" }),
    ticketTypeId: (0, pg_core_1.integer)("ticketTypeId").references(() => exports.ticketTypes.ticketTypeId),
    ticketTypeName: (0, pg_core_1.varchar)("ticketTypeName", { length: 100 }),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    totalAmount: (0, pg_core_1.decimal)("totalAmount", { precision: 10, scale: 2 }).notNull(),
    bookingStatus: (0, exports.bookingStatusEnum)("bookingStatus").default("Pending").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow().notNull(),
});
// =======================
// PAYMENTS
// =======================
exports.payments = (0, pg_core_1.pgTable)("payments", {
    paymentId: (0, pg_core_1.serial)("paymentId").primaryKey(),
    bookingId: (0, pg_core_1.integer)("bookingId").references(() => exports.bookings.bookingId, { onDelete: "cascade" }),
    nationalId: (0, pg_core_1.integer)("nationalId")
        .notNull()
        .references(() => exports.users.nationalId, { onDelete: "cascade" }),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: (0, exports.paymentStatusEnum)("paymentStatus").default("Pending").notNull(),
    paymentDate: (0, pg_core_1.timestamp)("paymentDate").defaultNow().notNull(),
    paymentMethod: (0, pg_core_1.varchar)("paymentMethod", { length: 50 }),
    transactionId: (0, pg_core_1.varchar)("transactionId", { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow().notNull(),
});
// =======================
// SUPPORT TICKETS
// =======================
exports.supportTickets = (0, pg_core_1.pgTable)("supportTickets", {
    ticketId: (0, pg_core_1.serial)("ticketId").primaryKey(),
    nationalId: (0, pg_core_1.integer)("nationalId").references(() => exports.users.nationalId, { onDelete: "cascade" }),
    subject: (0, pg_core_1.varchar)("subject", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, exports.ticketStatusEnum)("status").default("Open").notNull(),
    priority: (0, exports.priorityEnum)("priority").default("Medium").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").defaultNow().notNull(),
});
// =======================
// MEDIA
// =======================
exports.media = (0, pg_core_1.pgTable)("media", {
    mediaId: (0, pg_core_1.serial)("mediaId").primaryKey(),
    eventId: (0, pg_core_1.integer)("eventId").references(() => exports.events.eventId, { onDelete: "cascade" }),
    venueId: (0, pg_core_1.integer)("venueId").references(() => exports.venues.venueId, { onDelete: "cascade" }),
    url: (0, pg_core_1.varchar)("url", { length: 500 }).notNull(),
    type: (0, exports.mediaTypeEnum)("type").notNull(),
    altText: (0, pg_core_1.varchar)("altText", { length: 255 }),
    uploadedAt: (0, pg_core_1.timestamp)("uploadedAt").defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// =======================
// RESPONSES
// =======================
exports.responses = (0, pg_core_1.pgTable)("responses", {
    responseId: (0, pg_core_1.serial)("responseId").primaryKey(),
    ticketId: (0, pg_core_1.integer)("ticketId")
        .references(() => exports.supportTickets.ticketId, { onDelete: "cascade" })
        .notNull(),
    nationalId: (0, pg_core_1.integer)("nationalId")
        .references(() => exports.users.nationalId, { onDelete: "cascade" })
        .notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// =======================
// RELATIONS
// =======================
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    bookings: many(exports.bookings),
    supportTickets: many(exports.supportTickets),
}));
exports.venuesRelations = (0, drizzle_orm_1.relations)(exports.venues, ({ many }) => ({
    events: many(exports.events),
    media: many(exports.media),
}));
exports.eventsRelations = (0, drizzle_orm_1.relations)(exports.events, ({ one, many }) => ({
    venue: one(exports.venues, {
        fields: [exports.events.venueId],
        references: [exports.venues.venueId],
    }),
    bookings: many(exports.bookings),
    ticketTypes: many(exports.ticketTypes),
    media: many(exports.media),
}));
exports.ticketTypesRelations = (0, drizzle_orm_1.relations)(exports.ticketTypes, ({ one }) => ({
    event: one(exports.events, {
        fields: [exports.ticketTypes.eventId],
        references: [exports.events.eventId],
    }),
}));
exports.bookingsRelations = (0, drizzle_orm_1.relations)(exports.bookings, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.bookings.nationalId],
        references: [exports.users.nationalId],
    }),
    event: one(exports.events, {
        fields: [exports.bookings.eventId],
        references: [exports.events.eventId],
    }),
    ticketType: one(exports.ticketTypes, {
        fields: [exports.bookings.ticketTypeId],
        references: [exports.ticketTypes.ticketTypeId],
    }),
    payments: many(exports.payments),
}));
exports.paymentsRelations = (0, drizzle_orm_1.relations)(exports.payments, ({ one }) => ({
    booking: one(exports.bookings, {
        fields: [exports.payments.bookingId],
        references: [exports.bookings.bookingId],
    }),
    user: one(exports.users, {
        fields: [exports.payments.nationalId],
        references: [exports.users.nationalId],
    }),
}));
exports.supportTicketsRelations = (0, drizzle_orm_1.relations)(exports.supportTickets, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.supportTickets.nationalId],
        references: [exports.users.nationalId],
    }),
    responses: many(exports.responses),
}));
exports.mediaRelations = (0, drizzle_orm_1.relations)(exports.media, ({ one }) => ({
    event: one(exports.events, {
        fields: [exports.media.eventId],
        references: [exports.events.eventId],
    }),
    venue: one(exports.venues, {
        fields: [exports.media.venueId],
        references: [exports.venues.venueId],
    }),
}));
exports.responsesRelations = (0, drizzle_orm_1.relations)(exports.responses, ({ one }) => ({
    ticket: one(exports.supportTickets, {
        fields: [exports.responses.ticketId],
        references: [exports.supportTickets.ticketId],
    }),
    user: one(exports.users, {
        fields: [exports.responses.nationalId],
        references: [exports.users.nationalId],
    }),
}));
