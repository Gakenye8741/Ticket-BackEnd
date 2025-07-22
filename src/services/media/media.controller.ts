import { RequestHandler } from "express";
import {
  getAllMediaService,
  getMediaByEventIdService,
  searchMediaByTypeService,
  createMediaService,
  updateMediaService,
  deleteMediaService,
} from "./media.service";

// 📥 Get all media
export const getAllMediaController: RequestHandler = async (req, res): Promise<void> => {
  try {
    const allMedia = await getAllMediaService();
    res.status(200).json(allMedia);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch media", error: error.message });
  }
};

// 📥 Get media by event ID
export const getMediaByEventIdController: RequestHandler = async (req, res): Promise<void> => {
  const eventId = parseInt(req.params.eventId);
  if (isNaN(eventId)) {
    res.status(400).json({ message: "Invalid event ID" });
    return;
  }

  try {
    const media = await getMediaByEventIdService(eventId);
    res.status(200).json(media);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch media by event", error: error.message });
  }
};

// 📥 Get media by type
export const getMediaByTypeController: RequestHandler = async (req, res): Promise<void> => {
  const type = req.params.type;
  if (!["image", "video"].includes(type)) {
    res.status(400).json({ message: "Type must be 'image' or 'video'" });
    return;
  }

  try {
    const results = await searchMediaByTypeService(type as "image" | "video");
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch media by type", error: error.message });
  }
};

// ➕ Create new media
export const createMediaController: RequestHandler = async (req, res): Promise<void> => {
  const { eventId, type, url } = req.body;

  if (!eventId || !type || !url) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    await createMediaService({ eventId, type, url });
    res.status(201).json({ message: "Media created successfully ✅" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create media", error: error.message });
  }
};

// 🔄 Update media
export const updateMediaController: RequestHandler = async (req, res): Promise<void> => {
  const mediaId = parseInt(req.params.mediaId);
  if (isNaN(mediaId)) {
    res.status(400).json({ message: "Invalid media ID" });
    return;
  }

  try {
    await updateMediaService(mediaId, req.body);
    res.status(200).json({ message: "Media updated successfully 🔄" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update media", error: error.message });
  }
};

// 🗑️ Delete media
export const deleteMediaController: RequestHandler = async (req, res): Promise<void> => {
  const mediaId = parseInt(req.params.mediaId);
  if (isNaN(mediaId)) {
    res.status(400).json({ message: "Invalid media ID" });
    return;
  }

  try {
    await deleteMediaService(mediaId);
    res.status(200).json({ message: "Media deleted successfully ❌" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete media", error: error.message });
  }
};
