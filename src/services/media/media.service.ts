import { eq, desc, ilike } from "drizzle-orm";
import db from "../../drizzle/db";
import {
  media,
  events,
  TSelectMedia,
  TInsertMedia,
} from "../../drizzle/schema";

// ✅ Get all media (ordered by newest first)
export const getAllMediaService = async (): Promise<TSelectMedia[]> => {
  return await db.query.media.findMany({
    orderBy: [desc(media.createdAt)],
  });
};

// ✅ Get media by eventId
export const getMediaByEventIdService = async (
  eventId: number
): Promise<TSelectMedia[]> => {
  return await db.query.media.findMany({
    where: eq(media.eventId, eventId),
    orderBy: [desc(media.createdAt)],
  });
};

// ✅ Search media by type (image or video)
export const searchMediaByTypeService = async (
  type: "image" | "video"
): Promise<TSelectMedia[]> => {
  return await db.query.media.findMany({
    where: eq(media.type, type),
    orderBy: [desc(media.createdAt)],
  });
};

// ✅ Create new media entry
export const createMediaService = async (
  newMedia: TInsertMedia
): Promise<string> => {
  await db.insert(media).values(newMedia).returning();
  return "Media uploaded successfully ✅";
};

// ✅ Update media by mediaId
export const updateMediaService = async (
  mediaId: number,
  updatedFields: Partial<TInsertMedia>
): Promise<string> => {
  await db.update(media).set(updatedFields).where(eq(media.mediaId, mediaId));
  return "Media updated successfully 🔄";
};

// ✅ Delete media by mediaId
export const deleteMediaService = async (
  mediaId: number
): Promise<string> => {
  await db.delete(media).where(eq(media.mediaId, mediaId));
  return "Media deleted successfully ❌";
};
