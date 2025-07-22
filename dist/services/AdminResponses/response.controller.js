"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponsesByTicket = exports.deleteResponse = exports.updateResponse = exports.createResponse = void 0;
const response_service_1 = require("../AdminResponses/response.service");
// ✅ Create a new response
const createResponse = async (req, res) => {
    try {
        const { ticketId, nationalId, message } = req.body;
        if (!ticketId || !nationalId || !message) {
            res.status(400).json({ error: "All fields are required." });
            return;
        }
        const newResponse = await response_service_1.ResponseService.createResponse({ ticketId, nationalId, message });
        res.status(201).json(newResponse);
    }
    catch (error) {
        console.error("Create response failed:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
exports.createResponse = createResponse;
// ✅ Update a response
const updateResponse = async (req, res) => {
    try {
        const responseId = Number(req.params.id);
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: "Message is required." });
            return;
        }
        const updated = await response_service_1.ResponseService.updateResponse(responseId, { message });
        if (!updated) {
            res.status(404).json({ error: "Response not found." });
            return;
        }
        res.status(200).json(updated);
    }
    catch (error) {
        console.error("Update response failed:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
exports.updateResponse = updateResponse;
// ✅ Delete a response
const deleteResponse = async (req, res) => {
    try {
        const responseId = Number(req.params.id);
        const deleted = await response_service_1.ResponseService.deleteResponse(responseId);
        if (!deleted) {
            res.status(404).json({ error: "Response not found." });
            return;
        }
        res.status(200).json({ message: "Response deleted successfully." });
    }
    catch (error) {
        console.error("Delete response failed:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
exports.deleteResponse = deleteResponse;
// ✅ Get all responses for a ticket
const getResponsesByTicket = async (req, res) => {
    try {
        const ticketId = Number(req.params.ticketId);
        const allResponses = await response_service_1.ResponseService.getResponsesForTicket(ticketId);
        res.status(200).json(allResponses);
    }
    catch (error) {
        console.error("Get responses failed:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
exports.getResponsesByTicket = getResponsesByTicket;
