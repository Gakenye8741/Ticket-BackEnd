"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaController = exports.updateMediaController = exports.createMediaController = exports.getMediaByTypeController = exports.getMediaByEventIdController = exports.getAllMediaController = void 0;
const media_service_1 = require("./media.service");
// 📥 Get all media
const getAllMediaController = async (req, res) => {
    try {
        const allMedia = await (0, media_service_1.getAllMediaService)();
        res.status(200).json(allMedia);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch media", error: error.message });
    }
};
exports.getAllMediaController = getAllMediaController;
// 📥 Get media by event ID
const getMediaByEventIdController = async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
        res.status(400).json({ message: "Invalid event ID" });
        return;
    }
    try {
        const media = await (0, media_service_1.getMediaByEventIdService)(eventId);
        res.status(200).json(media);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch media by event", error: error.message });
    }
};
exports.getMediaByEventIdController = getMediaByEventIdController;
// 📥 Get media by type
const getMediaByTypeController = async (req, res) => {
    const type = req.params.type;
    if (!["image", "video"].includes(type)) {
        res.status(400).json({ message: "Type must be 'image' or 'video'" });
        return;
    }
    try {
        const results = await (0, media_service_1.searchMediaByTypeService)(type);
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch media by type", error: error.message });
    }
};
exports.getMediaByTypeController = getMediaByTypeController;
// ➕ Create new media
const createMediaController = async (req, res) => {
    const { eventId, type, url } = req.body;
    if (!eventId || !type || !url) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }
    try {
        await (0, media_service_1.createMediaService)({ eventId, type, url });
        res.status(201).json({ message: "Media created successfully ✅" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create media", error: error.message });
    }
};
exports.createMediaController = createMediaController;
// 🔄 Update media
const updateMediaController = async (req, res) => {
    const mediaId = parseInt(req.params.mediaId);
    if (isNaN(mediaId)) {
        res.status(400).json({ message: "Invalid media ID" });
        return;
    }
    try {
        await (0, media_service_1.updateMediaService)(mediaId, req.body);
        res.status(200).json({ message: "Media updated successfully 🔄" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update media", error: error.message });
    }
};
exports.updateMediaController = updateMediaController;
// 🗑️ Delete media
const deleteMediaController = async (req, res) => {
    const mediaId = parseInt(req.params.mediaId);
    if (isNaN(mediaId)) {
        res.status(400).json({ message: "Invalid media ID" });
        return;
    }
    try {
        await (0, media_service_1.deleteMediaService)(mediaId);
        res.status(200).json({ message: "Media deleted successfully ❌" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete media", error: error.message });
    }
};
exports.deleteMediaController = deleteMediaController;
