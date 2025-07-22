"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketRouter = void 0;
const express_1 = require("express");
const ticketType_controller_1 = require("./ticketType.controller"); // Import the controller methods for ticket types
const bearAuth_1 = require("../../middleware/bearAuth"); // You can use any authentication middleware here
exports.ticketRouter = (0, express_1.Router)();
// 📥 Get all Ticket Types
exports.ticketRouter.get("/ticket-types", ticketType_controller_1.getAllTicketTypes);
// 📥 Get Ticket Type by ID
exports.ticketRouter.get("/ticket-types/:id", ticketType_controller_1.getTicketTypeById);
// 📥 Get Ticket Types by Event ID
exports.ticketRouter.get("/ticket-types/event/:eventId", ticketType_controller_1.getTicketTypesByEventId);
// ➕ Create Ticket Type (admin only)
exports.ticketRouter.post("/ticket-types", bearAuth_1.adminAuth, ticketType_controller_1.createTicketType);
// 🔄 Update Ticket Type (admin only)
exports.ticketRouter.put("/ticket-types/:id", bearAuth_1.adminAuth, ticketType_controller_1.updateTicketType);
// 🗑️ Delete Ticket Type (admin only)
exports.ticketRouter.delete("/ticket-types/:id", bearAuth_1.adminAuth, ticketType_controller_1.deleteTicketType);
