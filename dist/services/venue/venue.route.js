"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.venueRoute = void 0;
const express_1 = require("express");
const venue_controller_1 = require("./venue.controller");
const bearAuth_1 = require("../../middleware/bearAuth");
exports.venueRoute = (0, express_1.Router)();
// Venue Routes
// Search by Name
exports.venueRoute.get("/venues/search", venue_controller_1.searchVenue);
// Get All Venues
exports.venueRoute.get('/venues', venue_controller_1.GetAllVenues);
// Get Venue By Name
exports.venueRoute.get('/venues/:name', bearAuth_1.anyAuthenticatedUser, venue_controller_1.getVenueByName);
//Get All Venue details through searching
exports.venueRoute.get('/details/venues/search', bearAuth_1.adminAuth, venue_controller_1.venueDetails);
// // Create a new venue
exports.venueRoute.post("/venues", bearAuth_1.adminAuth, venue_controller_1.CreateVenue);
// Update an existing venue
exports.venueRoute.put("/venues/:id", bearAuth_1.adminAuth, venue_controller_1.updateVenue);
// Delete an existing venue
exports.venueRoute.delete("/venues/:id", bearAuth_1.adminAuth, venue_controller_1.DeleteVenue);
