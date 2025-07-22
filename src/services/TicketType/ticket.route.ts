import { Router } from "express";
import {
  getAllTicketTypes,
  getTicketTypeById,
  getTicketTypesByEventId,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "./ticketType.controller"; // Import the controller methods for ticket types

import { adminAuth, anyAuthenticatedUser } from "../../middleware/bearAuth"; // You can use any authentication middleware here

export const ticketRouter = Router();

// 📥 Get all Ticket Types
ticketRouter.get("/ticket-types", getAllTicketTypes);

// 📥 Get Ticket Type by ID
ticketRouter.get("/ticket-types/:id", getTicketTypeById);

// 📥 Get Ticket Types by Event ID
ticketRouter.get("/ticket-types/event/:eventId", getTicketTypesByEventId);

// ➕ Create Ticket Type (admin only)
ticketRouter.post("/ticket-types", adminAuth, createTicketType);

// 🔄 Update Ticket Type (admin only)
ticketRouter.put("/ticket-types/:id", adminAuth, updateTicketType);

// 🗑️ Delete Ticket Type (admin only)
ticketRouter.delete("/ticket-types/:id", adminAuth, deleteTicketType);
