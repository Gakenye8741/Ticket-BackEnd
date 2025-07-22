"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketsByNationalId = exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getTicketbyIdDetails = exports.getTicketById = exports.getAllSupTickets = void 0;
const ticket_service_1 = require("./ticket.service");
// ✅ Get all support tickets
const getAllSupTickets = async (req, res) => {
    try {
        const tickets = await (0, ticket_service_1.getAllSupportTicketService)();
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
};
exports.getAllSupTickets = getAllSupTickets;
// ✅ Get a ticket by ID
const getTicketById = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "Invalid ticket ID" });
            return;
        }
        const ticket = await (0, ticket_service_1.getTicketByIdService)(ticketId);
        if (!ticket) {
            res.status(404).json({ error: "Ticket not found" });
            return;
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch ticket" });
    }
};
exports.getTicketById = getTicketById;
// ✅ Get ticket with user details
const getTicketbyIdDetails = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "Invalid ticket ID" });
            return;
        }
        const ticket = await (0, ticket_service_1.getTicketWithAllIdServices)(ticketId);
        if (!ticket) {
            res.status(404).json({ error: "Ticket not found" });
            return;
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch ticket details" });
    }
};
exports.getTicketbyIdDetails = getTicketbyIdDetails;
// ✅ Create a new ticket
const createTicket = async (req, res) => {
    try {
        const message = await (0, ticket_service_1.createSupportTicketService)(req.body);
        res.status(201).json({ message });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create ticket" });
    }
};
exports.createTicket = createTicket;
// ✅ Update a ticket
const updateTicket = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "Invalid ticket ID" });
            return;
        }
        const message = await (0, ticket_service_1.updateSupportTicketService)(ticketId, req.body);
        res.json({ message });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update ticket" });
    }
};
exports.updateTicket = updateTicket;
// ✅ Delete a ticket
const deleteTicket = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "Invalid ticket ID" });
            return;
        }
        const message = await (0, ticket_service_1.deleteSupportTicketService)(ticketId);
        res.json({ message });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete ticket" });
    }
};
exports.deleteTicket = deleteTicket;
// ✅ Get all tickets by user's national ID
const getTicketsByNationalId = async (req, res) => {
    try {
        const nationalId = parseInt(req.params.nationalId);
        if (isNaN(nationalId)) {
            res.status(400).json({ error: "Invalid national ID" });
            return;
        }
        const tickets = await (0, ticket_service_1.getSupportTicketsByNationalIdService)(nationalId);
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch tickets by national ID" });
    }
};
exports.getTicketsByNationalId = getTicketsByNationalId;
