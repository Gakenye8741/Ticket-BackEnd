"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserService = exports.updateUserService = exports.createUserService = exports.searchUsersWithDetailsService = exports.getUserWithDetailsService = exports.getUserByNationalIdService = exports.getUserByLastNameService = exports.getAllUsersService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
// Utility: Exclude password from returned user objects
function excludePassword(user) {
    const { password, ...rest } = user;
    return rest;
}
// ✅ Get all users (ordered by nationalId) without password
const getAllUsersService = async () => {
    const usersList = await db_1.default.query.users.findMany({
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.users.nationalId)],
    });
    return usersList.map(excludePassword);
};
exports.getAllUsersService = getAllUsersService;
// ✅ Get user by last name (case-insensitive, partial match) without password
const getUserByLastNameService = async (lastName) => {
    const results = await db_1.default.query.users.findMany({
        where: (0, drizzle_orm_1.ilike)(schema_1.users.lastName, `%${lastName}%`),
    });
    return results.map(excludePassword);
};
exports.getUserByLastNameService = getUserByLastNameService;
// ✅ Get user by nationalId without password
const getUserByNationalIdService = async (nationalId) => {
    const user = await db_1.default.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.nationalId, nationalId),
    });
    return user ? excludePassword(user) : undefined;
};
exports.getUserByNationalIdService = getUserByNationalIdService;
// ✅ Get full user profile with all related data using nationalId (excluding password)
const getUserWithDetailsService = async (nationalId) => {
    const userDetails = await db_1.default.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.nationalId, nationalId),
        with: {
            bookings: {
                with: {
                    event: {
                        with: {
                            venue: true,
                        },
                    },
                    payments: true,
                },
            },
            supportTickets: true,
        },
    });
    if (!userDetails)
        return undefined;
    const { password, ...safeDetails } = userDetails;
    return safeDetails;
};
exports.getUserWithDetailsService = getUserWithDetailsService;
// ✅ Search users with details using last name (excluding password)
const searchUsersWithDetailsService = async (query) => {
    const matchedUsers = await db_1.default.query.users.findMany({
        where: (0, drizzle_orm_1.ilike)(schema_1.users.lastName, `%${query}%`),
        with: {
            bookings: {
                with: {
                    event: {
                        with: {
                            venue: true,
                        },
                    },
                    payments: true,
                },
            },
            supportTickets: true,
        },
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.users.nationalId)],
    });
    return matchedUsers.map(({ password, ...rest }) => rest);
};
exports.searchUsersWithDetailsService = searchUsersWithDetailsService;
// ✅ Create a new user
const createUserService = async (user) => {
    await db_1.default.insert(schema_1.users).values(user).returning();
    return "User created successfully ✅";
};
exports.createUserService = createUserService;
// ✅ Update an existing user by nationalId
const updateUserService = async (nationalId, user) => {
    await db_1.default.update(schema_1.users).set(user).where((0, drizzle_orm_1.eq)(schema_1.users.nationalId, nationalId));
    return "User updated successfully 🔄";
};
exports.updateUserService = updateUserService;
// ✅ Delete user by nationalId
const deleteUserService = async (nationalId) => {
    await db_1.default.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.nationalId, nationalId));
    return "User deleted successfully ❌";
};
exports.deleteUserService = deleteUserService;
