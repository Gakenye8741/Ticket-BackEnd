"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const media_controller_1 = require("./media.controller"); // adjust path if needed
const router = (0, express_1.Router)();
// GET all media
router.get("/media", media_controller_1.getAllMediaController);
// GET media by event ID
router.get("/media/event/:eventId", media_controller_1.getMediaByEventIdController);
// GET media by type (image or video)
router.get("/media/type/:type", media_controller_1.getMediaByTypeController);
// POST new media
router.post("/media/", media_controller_1.createMediaController);
// PUT update media by ID
router.put("/media/:mediaId", media_controller_1.updateMediaController);
// DELETE media by ID
router.delete("/:mediaId", media_controller_1.deleteMediaController);
exports.default = router;
