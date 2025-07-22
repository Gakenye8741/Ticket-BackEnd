import { Request, Response, RequestHandler } from "express";
import {
  createTicketTypeService,
  deleteTicketTypeService,
  getAllTicketTypesService,
  getTicketTypeByIdService,
  getTicketTypesByEventIdService,
  updateTicketTypeService,
} from "./TicketType.service";

// 📥 Get all ticket types
export const getAllTicketTypes: RequestHandler = async (req, res): Promise<void> => {
  try {
    const ticketTypes = await getAllTicketTypesService();
    if (!ticketTypes.length) {
      res.status(404).json({ message: "No ticket types found" });
      return;
    }
    res.status(200).json(ticketTypes);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch ticket types" });
  }
};

// 📥 Get ticket type by ID
export const getTicketTypeById: RequestHandler = async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket type ID" });
    return;
  }

  try {
    const ticket = await getTicketTypeByIdService(id);
    if (!ticket) {
      res.status(404).json({ message: "Ticket type not found" });
      return;
    }
    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch ticket type" });
  }
};

// 📥 Get ticket types by event ID
export const getTicketTypesByEventId: RequestHandler = async (req, res): Promise<void> => {
  const eventId = parseInt(req.params.eventId);
  if (isNaN(eventId)) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }

  try {
    const tickets = await getTicketTypesByEventIdService(eventId);
    if (!tickets.length) {
      res.status(404).json({ message: "No ticket types found for this event" });
      return;
    }
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch ticket types" });
  }
};

// ➕ Create a new ticket type
export const createTicketType: RequestHandler = async (req, res): Promise<void> => {
  const { eventId, name, price, quantity } = req.body;

  if (!eventId || !name || !price || !quantity) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const result = await createTicketTypeService({ eventId, name, price, quantity });
    res.status(201).json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create ticket type" });
  }
};

// 🔄 Update ticket type
export const updateTicketType: RequestHandler = async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket type ID" });
    return;
  }

  const { eventId, name, price, quantity } = req.body;
  if (!eventId && !name && !price && !quantity) {
    res.status(400).json({ error: "At least one field must be provided for update" });
    return;
  }

  try {
    const result = await updateTicketTypeService(id, { eventId, name, price, quantity });
    res.status(200).json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update ticket type" });
  }
};

// 🗑️ Delete ticket type
export const deleteTicketType: RequestHandler = async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket type ID" });
    return;
  }

  try {
    const result = await deleteTicketTypeService(id);
    res.status(200).json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete ticket type" });
  }
};
