"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicketType = exports.updateTicketType = exports.createTicketType = exports.getTicketTypesByEventId = exports.getTicketTypeById = exports.getAllTicketTypes = void 0;
const TicketType_service_1 = require("./TicketType.service");
// 📥 Get all ticket types
const getAllTicketTypes = async (req, res) => {
    try {
        const ticketTypes = await (0, TicketType_service_1.getAllTicketTypesService)();
        if (!ticketTypes.length) {
            res.status(404).json({ message: "No ticket types found" });
            return;
        }
        res.status(200).json(ticketTypes);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch ticket types" });
    }
};
exports.getAllTicketTypes = getAllTicketTypes;
// 📥 Get ticket type by ID
const getTicketTypeById = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ticket type ID" });
        return;
    }
    try {
        const ticket = await (0, TicketType_service_1.getTicketTypeByIdService)(id);
        if (!ticket) {
            res.status(404).json({ message: "Ticket type not found" });
            return;
        }
        res.status(200).json(ticket);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch ticket type" });
    }
};
exports.getTicketTypeById = getTicketTypeById;
// 📥 Get ticket types by event ID
const getTicketTypesByEventId = async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
        res.status(400).json({ error: "Invalid event ID" });
        return;
    }
    try {
        const tickets = await (0, TicketType_service_1.getTicketTypesByEventIdService)(eventId);
        if (!tickets.length) {
            res.status(404).json({ message: "No ticket types found for this event" });
            return;
        }
        res.status(200).json(tickets);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch ticket types" });
    }
};
exports.getTicketTypesByEventId = getTicketTypesByEventId;
// ➕ Create a new ticket type
const createTicketType = async (req, res) => {
    const { eventId, name, price, quantity } = req.body;
    if (!eventId || !name || !price || !quantity) {
        res.status(400).json({ error: "All fields are required" });
        return;
    }
    try {
        const result = await (0, TicketType_service_1.createTicketTypeService)({ eventId, name, price, quantity });
        res.status(201).json({ message: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to create ticket type" });
    }
};
exports.createTicketType = createTicketType;
// 🔄 Update ticket type
const updateTicketType = async (req, res) => {
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
        const result = await (0, TicketType_service_1.updateTicketTypeService)(id, { eventId, name, price, quantity });
        res.status(200).json({ message: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to update ticket type" });
    }
};
exports.updateTicketType = updateTicketType;
// 🗑️ Delete ticket type
const deleteTicketType = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ticket type ID" });
        return;
    }
    try {
        const result = await (0, TicketType_service_1.deleteTicketTypeService)(id);
        res.status(200).json({ message: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to delete ticket type" });
    }
};
exports.deleteTicketType = deleteTicketType;
