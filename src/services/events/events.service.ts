import { eq, inArray, desc, ilike } from "drizzle-orm";
import db from "../../drizzle/db";
import {
  events,
  bookings,
  users,
  TInsertEvent,
  TSelectEvent,
  TSelectBooking,
} from "../../drizzle/schema";

// 🔍 Get all events
export const getAllEventsService = async (): Promise<TSelectEvent[]> => {
  return await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
    with: {
      venue: true,
    },
  });
};

// 🔍 Get event by ID
export const getEventByIdService = async (
  eventId: number
): Promise<TSelectEvent | undefined> => {
  return await db.query.events.findFirst({
    where: eq(events.eventId, eventId),
    with: {
      venue: true,
    },
  });
};

// 🔍 Get events by title (case-insensitive, partial match)
export const getEventsByTitleService = async (
  title: string
): Promise<TSelectEvent[]> => {
  return await db.query.events.findMany({
    where: ilike(events.title, `%${title}%`),
    with: {
      venue: true,
    },
  });
};

// 🔍 Get events by category (case-insensitive, partial match)
export const getEventsByCategoryService = async (
  category: string
): Promise<TSelectEvent[]> => {
  return await db.query.events.findMany({
    where: ilike(events.category, `%${category}%`),
    with: {
      venue: true,
    },
  });
};

// 🔍 Get event with venue (alias of getEventByIdService)
export const getEventWithVenueService = async (
  eventId: number
): Promise<TSelectEvent | undefined> => {
  return await db.query.events.findFirst({
    where: eq(events.eventId, eventId),
    with: {
      venue: true,
    },
  });
};

// 🔍 Get events by user's nationalId (based on bookings)
export const getEventsByUserIdService = async (
  nationalId: number
): Promise<TSelectEvent[]> => {
  // Fetch bookings related to the user
  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.nationalId, nationalId),
    orderBy: [desc(bookings.createdAt)], // Or order by event date, etc.
  });

  // Extract event IDs from the bookings and filter out null values
  const eventIds = userBookings.map((booking) => booking.eventId).filter((eventId) => eventId !== null);

  // Ensure that eventIds is not empty before proceeding
  if (eventIds.length === 0) {
    return [];
  }

  // Fetch the events using the extracted event IDs
  const eventsList = await db.query.events.findMany({
    where: inArray(events.eventId, eventIds), // Use inArray to match multiple event IDs
    orderBy: [desc(events.createdAt)], // Or order by event date, etc.
    with: {
      venue: true,
    },
  });

  return eventsList;
};

// ➕ Create a new event
export const createEventService = async (
  event: TInsertEvent
): Promise<string> => {
  await db.insert(events).values(event).returning();
  return "Event created successfully ✅";
};

// 🔄 Update event
export const updateEventService = async (
  eventId: number,
  event: Partial<TInsertEvent>
): Promise<string> => {
  await db.update(events).set(event).where(eq(events.eventId, eventId));
  return "Event updated successfully 🔄";
};

// 🗑️ Delete event
export const deleteEventService = async (
  eventId: number
): Promise<string> => {
  await db.delete(events).where(eq(events.eventId, eventId));
  return "Event deleted successfully ❌";
};
