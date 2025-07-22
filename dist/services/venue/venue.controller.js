"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVenue = exports.DeleteVenue = exports.CreateVenue = exports.venueDetails = exports.searchVenue = exports.getVenueByName = exports.GetAllVenues = void 0;
const venue_service_1 = require("./venue.service");
// Get all Venues
const GetAllVenues = async (req, res) => {
    try {
        const AllVenues = await (0, venue_service_1.getAllVenueServices)();
        if (!AllVenues || AllVenues.length === 0) {
            res.status(404).json({ message: "No Venues Found😔" });
        }
        else {
            res.status(200).json(AllVenues);
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Error Occured! Failed To Fetch Venue 😥" });
    }
};
exports.GetAllVenues = GetAllVenues;
// Get Venue By Name
const getVenueByName = async (req, res) => {
    const VenueName = req.params.name;
    try {
        const venueBYName = await (0, venue_service_1.getVenueByIdServices)(VenueName);
        if (!venueBYName) {
            res.status(404).json({ message: "No venue Found 😔" });
        }
        else {
            res.status(200).json(venueBYName);
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message || "error Occured! Failed To Fetch Venue😥" });
    }
};
exports.getVenueByName = getVenueByName;
// Search venue by Name
const searchVenue = async (req, res) => {
    const searchName = req.query.name;
    if (!searchName) {
        res.status(400).json({ error: "Missing Name query parameter" });
        return;
    }
    try {
        const searchVenueDetails = await (0, venue_service_1.searchVenuesByName)(searchName);
        if (!searchVenueDetails || searchVenueDetails.length === 0) {
            res.status(404).json({ message: "No Venue Found With That Name😔" });
        }
        else {
            res.status(200).json(searchVenueDetails);
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Errror Occured Failed to fearch Venue😥" });
    }
};
exports.searchVenue = searchVenue;
// Get full Venue Details 
const venueDetails = async (req, res) => {
    const venueName = req.query.name;
    if (!venueName) {
        res.status(400).json({ error: "Missing Name query parameter🥲" });
        return;
    }
    try {
        const venue_Details = await (0, venue_service_1.getAllDetailsForVenue)(venueName);
        if (!venue_Details) {
            res.status(404).json("No Venue Name Like That...Try Again🥲");
        }
        else {
            res.status(200).json(venue_Details);
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Error Occured...Failed To Fetch Venue Details🥲" });
    }
};
exports.venueDetails = venueDetails;
// Create a Venue
const CreateVenue = async (req, res) => {
    const { name, address, capacity, status } = req.body;
    if (!name || !address || !capacity || !status) {
        res.status(400).json({ error: "⚠️ All Fields Are Required" });
    }
    try {
        const results = await (0, venue_service_1.CreateVenueServices)({ name, address, capacity, status });
        res.status(200).json({ message: results });
    }
    catch (error) {
        res.status(500).json({ error: "⚠️ " + (error.message || "Error Occured while creating Venue") });
    }
};
exports.CreateVenue = CreateVenue;
// Deleting A venue
const DeleteVenue = async (req, res) => {
    const venueId = parseInt(req.params.id);
    if (isNaN(venueId)) {
        res.status(400).json({ error: "🚫 Invalid Venue ID" });
        return;
    }
    try {
        const result = await (0, venue_service_1.deleteVenueByIdServices)(venueId);
        res.status(200).json({ message: "✅ Venue Deleted Suuceesfully" });
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || "Failed to delete Venue") });
    }
};
exports.DeleteVenue = DeleteVenue;
// Updating Venue
const updateVenue = async (req, res) => {
    const venueId = parseInt(req.params.id);
    if (isNaN(venueId)) {
        res.status(400).json({ error: "🚫 Invalid venue ID" });
        return;
    }
    const { name, address, capacity } = req.body;
    if (!name || !address || !capacity) {
        res.status(400).json({ error: "⚠️ All fields are required" });
        return;
    }
    try {
        const result = await (0, venue_service_1.updateVenueServices)(venueId, { name, address, capacity });
        res.status(200).json({ message: "✅ " + result });
    }
    catch (error) {
        res.status(500).json({ error: "🚫 " + (error.message || "Failed to update venue") });
    }
};
exports.updateVenue = updateVenue;
