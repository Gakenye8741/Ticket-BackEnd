"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaService = exports.updateMediaService = exports.createMediaService = exports.searchMediaByTypeService = exports.getMediaByEventIdService = exports.getAllMediaService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
// ✅ Get all media (ordered by newest first)
const getAllMediaService = async () => {
    return await db_1.default.query.media.findMany({
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.media.createdAt)],
    });
};
exports.getAllMediaService = getAllMediaService;
// ✅ Get media by eventId
const getMediaByEventIdService = async (eventId) => {
    return await db_1.default.query.media.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.media.eventId, eventId),
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.media.createdAt)],
    });
};
exports.getMediaByEventIdService = getMediaByEventIdService;
// ✅ Search media by type (image or video)
const searchMediaByTypeService = async (type) => {
    return await db_1.default.query.media.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.media.type, type),
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.media.createdAt)],
    });
};
exports.searchMediaByTypeService = searchMediaByTypeService;
// ✅ Create new media entry
const createMediaService = async (newMedia) => {
    await db_1.default.insert(schema_1.media).values(newMedia).returning();
    return "Media uploaded successfully ✅";
};
exports.createMediaService = createMediaService;
// ✅ Update media by mediaId
const updateMediaService = async (mediaId, updatedFields) => {
    await db_1.default.update(schema_1.media).set(updatedFields).where((0, drizzle_orm_1.eq)(schema_1.media.mediaId, mediaId));
    return "Media updated successfully 🔄";
};
exports.updateMediaService = updateMediaService;
// ✅ Delete media by mediaId
const deleteMediaService = async (mediaId) => {
    await db_1.default.delete(schema_1.media).where((0, drizzle_orm_1.eq)(schema_1.media.mediaId, mediaId));
    return "Media deleted successfully ❌";
};
exports.deleteMediaService = deleteMediaService;
