import { Router } from "express";
import {
  getAllMediaController,
  getMediaByEventIdController,
  getMediaByTypeController,
  createMediaController,
  updateMediaController,
  deleteMediaController,
} from "./media.controller"; // adjust path if needed

const router = Router();

// GET all media
router.get("/media", getAllMediaController);

// GET media by event ID
router.get("/media/event/:eventId", getMediaByEventIdController);

// GET media by type (image or video)
router.get("/media/type/:type", getMediaByTypeController);

// POST new media
router.post("/media/", createMediaController);

// PUT update media by ID
router.put("/media/:mediaId", updateMediaController);

// DELETE media by ID
router.delete("/:mediaId", deleteMediaController);

export default router;
