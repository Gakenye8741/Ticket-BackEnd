import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  decimal,
  date,
  time,
  pgEnum,
  boolean
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =======================
// ENUMS
// =======================

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const bookingStatusEnum = pgEnum("bookingStatus", ["Pending", "Confirmed", "Cancelled"]);
export const paymentStatusEnum = pgEnum("paymentStatus", ["Pending", "Completed", "Failed"]);
export const ticketStatusEnum = pgEnum("status", ["Open", "In Progress", "Resolved", "Closed"]);
export const venueStatusEnum = pgEnum("venueStatus", ["available", "booked"]);
export const eventStatusEnum = pgEnum("eventStatus", ["in_progress", "ended", "cancelled", "upcoming"]);
export const mediaTypeEnum = pgEnum("mediaType", ["image", "video"]);
export const priorityEnum = pgEnum("priority", ["Low", "Medium", "High"]);

// =======================
// USERS
// =======================

export const users = pgTable("users", {
    nationalId: integer("nationalId").primaryKey(),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    confirmationCode: varchar("confirmationCode", { length: 255 }).default(""),
    password: varchar("password", { length: 255 }).notNull(),
    contactPhone: varchar("contactPhone", { length: 20 }),
    address: text("address"),
    profileImageUrl: text("profileImageUrl"),
    role: roleEnum("role").notNull().default("user"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
});

// =======================
// VENUES
// =======================

export const venues = pgTable("venues", {
  venueId: serial("venueId").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  capacity: integer("capacity").notNull(),
  status: venueStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// =======================
// EVENTS
// =======================

export const events = pgTable("events", {
  eventId: serial("eventId").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  venueId: integer("venueId").references(() => venues.venueId, { onDelete: "cascade" }),
  category: varchar("category", { length: 100 }),
  date: date("date").notNull(),
  time: time("time").notNull(),
  ticketPrice: decimal("ticketPrice", { precision: 10, scale: 2 }).notNull(),
  ticketsTotal: integer("ticketsTotal").notNull(),
  ticketsSold: integer("ticketsSold").default(0),
  status: eventStatusEnum("eventStatus").default("in_progress").notNull(),
  cancellationPolicy: text("cancellationPolicy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// =======================
// TICKET TYPES
// =======================

export const ticketTypes = pgTable("ticketTypes", {
  ticketTypeId: serial("ticketTypeId").primaryKey(),
  eventId: integer("eventId").references(() => events.eventId, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  sold: integer('sold'),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// =======================
// BOOKINGS
// =======================

export const bookings = pgTable("bookings", {
  bookingId: serial("bookingId").primaryKey(),
  nationalId: integer("nationalId").references(() => users.nationalId, { onDelete: "cascade" }),
  eventId: integer("eventId").references(() => events.eventId, { onDelete: "cascade" }),
  ticketTypeId: integer("ticketTypeId").references(() => ticketTypes.ticketTypeId),
  ticketTypeName: varchar("ticketTypeName", { length: 100 }),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  bookingStatus: bookingStatusEnum("bookingStatus").default("Pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// =======================
// PAYMENTS
// =======================

export const payments = pgTable("payments", {
  paymentId: serial("paymentId").primaryKey(),
  bookingId: integer("bookingId").references(() => bookings.bookingId, { onDelete: "cascade" }),
  nationalId: integer("nationalId")
    .notNull()
    .references(() => users.nationalId, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus").default("Pending").notNull(),
  paymentDate: timestamp("paymentDate").defaultNow().notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// =======================
// SUPPORT TICKETS
// =======================

export const supportTickets = pgTable("supportTickets", {
  ticketId: serial("ticketId").primaryKey(),
  nationalId: integer("nationalId").references(() => users.nationalId, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").default("Open").notNull(),
  priority: priorityEnum("priority").default("Medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// =======================
// MEDIA
// =======================

export const media = pgTable("media", {
  mediaId: serial("mediaId").primaryKey(),
  eventId: integer("eventId").references(() => events.eventId, { onDelete: "cascade" }),
  venueId: integer("venueId").references(() => venues.venueId, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  type: mediaTypeEnum("type").notNull(),
  altText: varchar("altText", { length: 255 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// =======================
// RESPONSES
// =======================

export const responses = pgTable("responses", {
  responseId: serial("responseId").primaryKey(),
  ticketId: integer("ticketId")
    .references(() => supportTickets.ticketId, { onDelete: "cascade" })
    .notNull(),
  nationalId: integer("nationalId")
    .references(() => users.nationalId, { onDelete: "cascade" })
    .notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// =======================
// RELATIONS
// =======================

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  supportTickets: many(supportTickets),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  events: many(events),
  media: many(media),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.venueId],
  }),
  bookings: many(bookings),
  ticketTypes: many(ticketTypes),
  media: many(media),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.eventId],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.nationalId],
    references: [users.nationalId],
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.eventId],
  }),
  ticketType: one(ticketTypes, {
    fields: [bookings.ticketTypeId],
    references: [ticketTypes.ticketTypeId],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.bookingId],
  }),
  user: one(users, {
    fields: [payments.nationalId],
    references: [users.nationalId],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.nationalId],
    references: [users.nationalId],
  }),
  responses: many(responses),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  event: one(events, {
    fields: [media.eventId],
    references: [events.eventId],
  }),
  venue: one(venues, {
    fields: [media.venueId],
    references: [venues.venueId],
  }),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [responses.ticketId],
    references: [supportTickets.ticketId],
  }),
  user: one(users, {
    fields: [responses.nationalId],
    references: [users.nationalId],
  }),
}));

// =======================
// TYPES
// =======================

export type TSelectUser = typeof users.$inferSelect;
export type TInsertUser = typeof users.$inferInsert;

export type TSelectVenue = typeof venues.$inferSelect;
export type TInsertVenue = typeof venues.$inferInsert;

export type TSelectEvent = typeof events.$inferSelect;
export type TInsertEvent = typeof events.$inferInsert;

export type TSelectTicketType = typeof ticketTypes.$inferSelect;
export type TInsertTicketType = typeof ticketTypes.$inferInsert;

export type TSelectBooking = typeof bookings.$inferSelect;
export type TInsertBooking = typeof bookings.$inferInsert;

export type TSelectPayment = typeof payments.$inferSelect;
export type TInsertPayment = typeof payments.$inferInsert;

export type TSelectSupportTicket = typeof supportTickets.$inferSelect;
export type TInsertSupportTicket = typeof supportTickets.$inferInsert;

export type TSelectMedia = typeof media.$inferSelect;
export type TInsertMedia = typeof media.$inferInsert;

export type TSelectResponse = typeof responses.$inferSelect;
export type TInsertResponse = typeof responses.$inferInsert;
