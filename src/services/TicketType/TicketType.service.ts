
import { eq, ilike, desc } from "drizzle-orm";
import db from "../../drizzle/db";
import {
  ticketTypes,
  events,
  TInsertTicketType,
  TSelectTicketType,
} from "../../drizzle/schema";

// ✅ Get all ticket types
export const getAllTicketTypesService = async (): Promise<TSelectTicketType[]> => {
  return db.query.ticketTypes.findMany({
    orderBy: [desc(ticketTypes.ticketTypeId)],
  });
};

// ✅ Get ticket type by ID
export const getTicketTypeByIdService = async (
  ticketTypeId: number
): Promise<TSelectTicketType | undefined> => {
  return db.query.ticketTypes.findFirst({
    where: eq(ticketTypes.ticketTypeId, ticketTypeId),
  });
};

// ✅ Get ticket types by event ID
export const getTicketTypesByEventIdService = async (
  eventId: number
): Promise<TSelectTicketType[]> => {
  return db.query.ticketTypes.findMany({
    where: eq(ticketTypes.eventId, eventId),
  });
};



// ✅ Create a ticket type
export const createTicketTypeService = async (
  ticket: TInsertTicketType
): Promise<string> => {
  await db.insert(ticketTypes).values(ticket);
  return "Ticket type created successfully ✅";
};

// ✅ Update a ticket type
export const updateTicketTypeService = async (
  ticketTypeId: number,
  ticket: Partial<TInsertTicketType>
): Promise<string> => {
  await db
    .update(ticketTypes)
    .set(ticket)
    .where(eq(ticketTypes.ticketTypeId, ticketTypeId));
  return "Ticket type updated successfully ✅";
};

// ✅ Delete a ticket type
export const deleteTicketTypeService = async (
  ticketTypeId: number
): Promise<string> => {
  await db
    .delete(ticketTypes)
    .where(eq(ticketTypes.ticketTypeId, ticketTypeId));
  return "Ticket type deleted successfully ❌";
};
