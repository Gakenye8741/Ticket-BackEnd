"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicketTypeService = exports.updateTicketTypeService = exports.createTicketTypeService = exports.getTicketTypesByEventIdService = exports.getTicketTypeByIdService = exports.getAllTicketTypesService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
// ✅ Get all ticket types
const getAllTicketTypesService = async () => {
    return db_1.default.query.ticketTypes.findMany({
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.ticketTypes.ticketTypeId)],
    });
};
exports.getAllTicketTypesService = getAllTicketTypesService;
// ✅ Get ticket type by ID
const getTicketTypeByIdService = async (ticketTypeId) => {
    return db_1.default.query.ticketTypes.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, ticketTypeId),
    });
};
exports.getTicketTypeByIdService = getTicketTypeByIdService;
// ✅ Get ticket types by event ID
const getTicketTypesByEventIdService = async (eventId) => {
    return db_1.default.query.ticketTypes.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.ticketTypes.eventId, eventId),
    });
};
exports.getTicketTypesByEventIdService = getTicketTypesByEventIdService;
// ✅ Create a ticket type
const createTicketTypeService = async (ticket) => {
    await db_1.default.insert(schema_1.ticketTypes).values(ticket);
    return "Ticket type created successfully ✅";
};
exports.createTicketTypeService = createTicketTypeService;
// ✅ Update a ticket type
const updateTicketTypeService = async (ticketTypeId, ticket) => {
    await db_1.default
        .update(schema_1.ticketTypes)
        .set(ticket)
        .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, ticketTypeId));
    return "Ticket type updated successfully ✅";
};
exports.updateTicketTypeService = updateTicketTypeService;
// ✅ Delete a ticket type
const deleteTicketTypeService = async (ticketTypeId) => {
    await db_1.default
        .delete(schema_1.ticketTypes)
        .where((0, drizzle_orm_1.eq)(schema_1.ticketTypes.ticketTypeId, ticketTypeId));
    return "Ticket type deleted successfully ❌";
};
exports.deleteTicketTypeService = deleteTicketTypeService;
