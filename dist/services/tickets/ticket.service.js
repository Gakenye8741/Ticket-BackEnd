"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportTicketsByNationalIdService = exports.deleteSupportTicketService = exports.updateSupportTicketService = exports.createSupportTicketService = exports.getTicketWithAllIdServices = exports.getTicketByIdService = exports.getAllSupportTicketService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
// ✅ Get all tickets
const getAllSupportTicketService = async () => {
    return db_1.default.query.supportTickets.findMany({
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.supportTickets.ticketId)],
    });
};
exports.getAllSupportTicketService = getAllSupportTicketService;
// ✅ Get Ticket By ID
const getTicketByIdService = async (ticketId) => {
    return db_1.default.query.supportTickets.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.supportTickets.ticketId, ticketId),
    });
};
exports.getTicketByIdService = getTicketByIdService;
// ✅ Get specific ticket with full user details
const getTicketWithAllIdServices = async (ticketId) => {
    return db_1.default.query.supportTickets.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.supportTickets.ticketId, ticketId),
        with: {
            user: true,
        },
    });
};
exports.getTicketWithAllIdServices = getTicketWithAllIdServices;
// ✅ Create a support ticket
const createSupportTicketService = async (ticket) => {
    await db_1.default.insert(schema_1.supportTickets).values(ticket);
    return "Support ticket created successfully ✅";
};
exports.createSupportTicketService = createSupportTicketService;
// ✅ Update a support ticket
const updateSupportTicketService = async (ticketId, ticket) => {
    await db_1.default
        .update(schema_1.supportTickets)
        .set(ticket)
        .where((0, drizzle_orm_1.eq)(schema_1.supportTickets.ticketId, ticketId));
    return "Support ticket updated successfully ✅";
};
exports.updateSupportTicketService = updateSupportTicketService;
// ✅ Delete a support ticket
const deleteSupportTicketService = async (ticketId) => {
    await db_1.default.delete(schema_1.supportTickets).where((0, drizzle_orm_1.eq)(schema_1.supportTickets.ticketId, ticketId));
    return "Support ticket deleted successfully ❌";
};
exports.deleteSupportTicketService = deleteSupportTicketService;
// ✅ Get all tickets by user's national ID
const getSupportTicketsByNationalIdService = async (nationalId) => {
    return db_1.default.query.supportTickets.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.supportTickets.nationalId, nationalId),
        with: {
            user: true,
        },
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.supportTickets.ticketId)],
    });
};
exports.getSupportTicketsByNationalIdService = getSupportTicketsByNationalIdService;
