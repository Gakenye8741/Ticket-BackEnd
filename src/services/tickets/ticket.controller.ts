import { RequestHandler } from "express";
import {
  createSupportTicketService,
  deleteSupportTicketService,
  getAllSupportTicketService,
  getTicketByIdService,
  getTicketWithAllIdServices,
  updateSupportTicketService,
  getSupportTicketsByNationalIdService,
} from "./ticket.service";

// ✅ Get all support tickets
export const getAllSupTickets: RequestHandler = async (req, res) => {
  try {
    const tickets = await getAllSupportTicketService();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// ✅ Get a ticket by ID
export const getTicketById: RequestHandler = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const ticket = await getTicketByIdService(ticketId);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};

// ✅ Get ticket with user details
export const getTicketbyIdDetails: RequestHandler = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const ticket = await getTicketWithAllIdServices(ticketId);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ticket details" });
  }
};

// ✅ Create a new ticket
export const createTicket: RequestHandler = async (req, res) => {
  try {
    const message = await createSupportTicketService(req.body);
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// ✅ Update a ticket
export const updateTicket: RequestHandler = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const message = await updateSupportTicketService(ticketId, req.body);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: "Failed to update ticket" });
  }
};

// ✅ Delete a ticket
export const deleteTicket: RequestHandler = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const message = await deleteSupportTicketService(ticketId);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};

// ✅ Get all tickets by user's national ID
export const getTicketsByNationalId: RequestHandler = async (req, res) => {
  try {
    const nationalId = parseInt(req.params.nationalId);
    if (isNaN(nationalId)) {
      res.status(400).json({ error: "Invalid national ID" });
      return;
    }

    const tickets = await getSupportTicketsByNationalIdService(nationalId);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets by national ID" });
  }
};
