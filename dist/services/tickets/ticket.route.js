"use strict";
// import { Router } from "express";
// import { getAllSupTickets, getTicketById, getTicketbyIdDetails } from "./ticket.controller";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsRoute = void 0;
// export const TicketsRoute = Router();
// // My Ticket Routes
// // Get All Tickets
// TicketsRoute.get('/tickets', getAllSupTickets);
// // Get Ticket By Id
// TicketsRoute.get('/tickets/:id', getTicketById);
// // Get Ticket All Details for A ticket
// TicketsRoute.get('/tickets/:id/details',getTicketbyIdDetails)
const express_1 = require("express");
const ticket_controller_1 = require("./ticket.controller");
exports.TicketsRoute = (0, express_1.Router)();
// 🎫 Ticket Routes
// ✅ Get all support tickets
exports.TicketsRoute.get("/tickets", ticket_controller_1.getAllSupTickets);
// 🆔 Get support ticket by ID
exports.TicketsRoute.get("/tickets/:id", ticket_controller_1.getTicketById);
// 🔍 Get full ticket details (with user info, etc.)
exports.TicketsRoute.get("/tickets/:id/details", ticket_controller_1.getTicketbyIdDetails);
// 👤 Get tickets by user's national ID
exports.TicketsRoute.get("/tickets/user/:nationalId", ticket_controller_1.getTicketsByNationalId); // 🆕 New route
// ✍️ Create a new support ticket
exports.TicketsRoute.post("/tickets", ticket_controller_1.createTicket);
// 🔄 Update a support ticket
exports.TicketsRoute.put("/tickets/:id", ticket_controller_1.updateTicket);
// ❌ Delete a support ticket
exports.TicketsRoute.delete("/tickets/:id", ticket_controller_1.deleteTicket);
