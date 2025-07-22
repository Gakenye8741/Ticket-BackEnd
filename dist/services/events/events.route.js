"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRouter = void 0;
const express_1 = require("express");
const events_controller_1 = require("./events.controller");
const bearAuth_1 = require("../../middleware/bearAuth");
exports.eventRouter = (0, express_1.Router)();
// 🔍 Search Events
exports.eventRouter.get("/events-search-title", events_controller_1.getEventsByTitle);
exports.eventRouter.get("/events-search-category", events_controller_1.getEventsByCategory);
// 📥 Get Events
exports.eventRouter.get("/events", events_controller_1.getAllEvents);
exports.eventRouter.get("/events/:id", events_controller_1.getEventById);
// ➕ Create Event (admin only)
exports.eventRouter.post("/events", bearAuth_1.adminAuth, events_controller_1.createEvent);
// 🔄 Update Event (admin only)
exports.eventRouter.put("/events/:id", bearAuth_1.adminAuth, events_controller_1.updateEvent);
// 🗑️ Delete Event (admin only)
exports.eventRouter.delete("/events/:id", bearAuth_1.adminAuth, events_controller_1.deleteEvent);
// 📥 Get Events by User National ID
exports.eventRouter.get("/events/user/:nationalId", events_controller_1.getEventsByUserId); // New route for fetching events by national ID
