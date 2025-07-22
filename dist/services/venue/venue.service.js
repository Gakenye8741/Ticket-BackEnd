"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVenueByIdServices = exports.updateVenueServices = exports.CreateVenueServices = exports.getAllDetailsForVenue = exports.searchVenuesByName = exports.getVenueByIdServices = exports.getAllVenueServices = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
// Get All Venues
const getAllVenueServices = async () => {
    return await db_1.default.query.venues.findMany();
};
exports.getAllVenueServices = getAllVenueServices;
// Get Venue by Id
const getVenueByIdServices = async (venueName) => {
    return await db_1.default.query.venues.findFirst({
        where: (0, drizzle_orm_1.ilike)(schema_1.venues.name, venueName)
    });
};
exports.getVenueByIdServices = getVenueByIdServices;
// search venue by name
const searchVenuesByName = async (searchTerm) => {
    return await db_1.default.query.venues.findMany({
        where: (0, drizzle_orm_1.ilike)(schema_1.venues.name, `%${searchTerm}%`),
    });
};
exports.searchVenuesByName = searchVenuesByName;
// get all details related to a Venue
const getAllDetailsForVenue = async (venueName) => {
    return await db_1.default.query.venues.findFirst({
        where: (0, drizzle_orm_1.ilike)(schema_1.venues.name, `%${venueName}%`),
        with: {
            events: true
        }
    });
};
exports.getAllDetailsForVenue = getAllDetailsForVenue;
// create A new Venue
const CreateVenueServices = async (venue) => {
    await db_1.default.insert(schema_1.venues).values(venue).returning();
    return "Venue Created Successfully ✅";
};
exports.CreateVenueServices = CreateVenueServices;
// updating An Existing Venue
const updateVenueServices = async (venueid, venue) => {
    await db_1.default.update(schema_1.venues).set(venue).where((0, drizzle_orm_1.eq)(schema_1.venues.venueId, venueid));
    return "Venue Updated succesfully 🔄";
};
exports.updateVenueServices = updateVenueServices;
// deleting Venue by Id
const deleteVenueByIdServices = async (venueId) => {
    await db_1.default.delete(schema_1.venues).where((0, drizzle_orm_1.eq)(schema_1.venues.venueId, venueId));
    return "User Deleted SuccessFully ❌";
};
exports.deleteVenueByIdServices = deleteVenueByIdServices;
