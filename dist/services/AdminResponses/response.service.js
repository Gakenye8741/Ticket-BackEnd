"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseService = void 0;
const db_1 = __importDefault(require("../../drizzle/db")); // adjust to your setup
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class ResponseService {
    // ✅ Create a response
    static async createResponse(data) {
        try {
            const response = await db_1.default.insert(schema_1.responses).values(data).returning();
            return response[0];
        }
        catch (error) {
            console.error("Error creating response:", error);
            throw new Error("Failed to create response.");
        }
    }
    // ✅ Update a response
    static async updateResponse(responseId, updatedFields) {
        try {
            const updated = await db_1.default
                .update(schema_1.responses)
                .set(updatedFields)
                .where((0, drizzle_orm_1.eq)(schema_1.responses.responseId, responseId))
                .returning();
            return updated[0];
        }
        catch (error) {
            console.error("Error updating response:", error);
            throw new Error("Failed to update response.");
        }
    }
    // ✅ Delete a response
    static async deleteResponse(responseId) {
        try {
            const deleted = await db_1.default
                .delete(schema_1.responses)
                .where((0, drizzle_orm_1.eq)(schema_1.responses.responseId, responseId))
                .returning();
            return deleted[0];
        }
        catch (error) {
            console.error("Error deleting response:", error);
            throw new Error("Failed to delete response.");
        }
    }
    // ✅ Get all responses for a specific ticket
    static async getResponsesForTicket(ticketId) {
        try {
            return await db_1.default
                .select()
                .from(schema_1.responses)
                .where((0, drizzle_orm_1.eq)(schema_1.responses.ticketId, ticketId))
                .orderBy(schema_1.responses.createdAt);
        }
        catch (error) {
            console.error("Error fetching responses:", error);
            throw new Error("Failed to fetch responses.");
        }
    }
}
exports.ResponseService = ResponseService;
