import { Router } from "express";
import {
  getAllEvents,
  getEventById,
  getEventsByTitle,
  getEventsByCategory,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByUserId,  // Import the new controller method
} from "./events.controller";

import { adminAuth, anyAuthenticatedUser } from "../../middleware/bearAuth";

export const eventRouter = Router();

// 🔍 Search Events
eventRouter.get("/events-search-title", getEventsByTitle);
eventRouter.get("/events-search-category", getEventsByCategory);

// 📥 Get Events
eventRouter.get("/events", getAllEvents);
eventRouter.get("/events/:id", getEventById);

// ➕ Create Event (admin only)
eventRouter.post("/events", adminAuth, createEvent);

// 🔄 Update Event (admin only)
eventRouter.put("/events/:id", adminAuth, updateEvent);

// 🗑️ Delete Event (admin only)
eventRouter.delete("/events/:id", adminAuth, deleteEvent);

// 📥 Get Events by User National ID
eventRouter.get("/events/user/:nationalId", getEventsByUserId);  // New route for fetching events by national ID
