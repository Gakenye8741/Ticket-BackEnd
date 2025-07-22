// import { Router } from "express";
// import { getAllSupTickets, getTicketById, getTicketbyIdDetails } from "./ticket.controller";


// export const TicketsRoute = Router();

// // My Ticket Routes

// // Get All Tickets
// TicketsRoute.get('/tickets', getAllSupTickets);

// // Get Ticket By Id
// TicketsRoute.get('/tickets/:id', getTicketById);

// // Get Ticket All Details for A ticket
// TicketsRoute.get('/tickets/:id/details',getTicketbyIdDetails)
import { Router } from "express";
import {
  createTicket,
  deleteTicket,
  getAllSupTickets,
  getTicketById,
  getTicketbyIdDetails,
  updateTicket,
  getTicketsByNationalId, // 🆕 Import the new controller
} from "./ticket.controller";

export const TicketsRoute = Router();

// 🎫 Ticket Routes

// ✅ Get all support tickets
TicketsRoute.get("/tickets", getAllSupTickets);

// 🆔 Get support ticket by ID
TicketsRoute.get("/tickets/:id", getTicketById);

// 🔍 Get full ticket details (with user info, etc.)
TicketsRoute.get("/tickets/:id/details", getTicketbyIdDetails);

// 👤 Get tickets by user's national ID
TicketsRoute.get("/tickets/user/:nationalId", getTicketsByNationalId); // 🆕 New route

// ✍️ Create a new support ticket
TicketsRoute.post("/tickets", createTicket);

// 🔄 Update a support ticket
TicketsRoute.put("/tickets/:id", updateTicket);

// ❌ Delete a support ticket
TicketsRoute.delete("/tickets/:id", deleteTicket);
