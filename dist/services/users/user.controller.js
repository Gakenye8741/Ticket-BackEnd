"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateAdminUser = exports.updateUser = exports.createUser = exports.searchUsersWithDetails = exports.getUserDetails = exports.getUserByLastName = exports.getUserByNationalId = exports.getUsers = void 0;
const user_service_1 = require("./user.service");
// Get all users
const getUsers = async (req, res) => {
    try {
        const allUsers = await (0, user_service_1.getAllUsersService)();
        if (!allUsers || allUsers.length === 0) {
            res.status(404).json({ message: "No users found" });
            return;
        }
        res.status(200).json(allUsers);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
};
exports.getUsers = getUsers;
// Get user by nationalId
const getUserByNationalId = async (req, res) => {
    const nationalId = parseInt(req.params.nationalId);
    if (isNaN(nationalId)) {
        res.status(400).json({ error: "Invalid national ID" });
        return;
    }
    try {
        const user = await (0, user_service_1.getUserByNationalIdService)(nationalId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch user" });
    }
};
exports.getUserByNationalId = getUserByNationalId;
// Get user by last name (partial match, case-insensitive)
const getUserByLastName = async (req, res) => {
    const lastName = req.query.lastName;
    if (!lastName) {
        res.status(400).json({ error: "Missing lastName query parameter" });
        return;
    }
    try {
        const users = await (0, user_service_1.getUserByLastNameService)(lastName);
        if (!users || users.length === 0) {
            res.status(404).json({ message: "No users found with that last name" });
            return;
        }
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Error searching users" });
    }
};
exports.getUserByLastName = getUserByLastName;
// Get full user profile with all related data using nationalId
const getUserDetails = async (req, res) => {
    const nationalId = parseInt(req.params.nationalId);
    if (isNaN(nationalId)) {
        res.status(400).json({ error: "Invalid national ID" });
        return;
    }
    try {
        const userDetails = await (0, user_service_1.getUserWithDetailsService)(nationalId);
        if (!userDetails) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(userDetails);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch user details" });
    }
};
exports.getUserDetails = getUserDetails;
// 🔍 Search all users with details using last name
const searchUsersWithDetails = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ error: "Missing search query parameter" });
        return;
    }
    try {
        const users = await (0, user_service_1.searchUsersWithDetailsService)(query);
        if (!users || users.length === 0) {
            res.status(404).json({ message: "No matching users found" });
            return;
        }
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to search users" });
    }
};
exports.searchUsersWithDetails = searchUsersWithDetails;
// Create new user
const createUser = async (req, res) => {
    const { firstName, lastName, email, password, nationalId } = req.body;
    if (!firstName || !lastName || !email || !password || !nationalId) {
        res.status(400).json({ error: "All fields are required" });
        return;
    }
    try {
        const result = await (0, user_service_1.createUserService)({ firstName, lastName, email, password, nationalId });
        res.status(201).json({ message: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to create user" });
    }
};
exports.createUser = createUser;
// Update user by nationalId
const updateUser = async (req, res) => {
    const nationalId = parseInt(req.params.nationalId);
    if (isNaN(nationalId)) {
        res.status(400).json({ error: "Invalid national ID" });
        return;
    }
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({ error: "All fields are required" });
        return;
    }
    try {
        const result = await (0, user_service_1.updateUserService)(nationalId, { firstName, lastName, email, password });
        res.status(200).json({ message: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to update user" });
    }
};
exports.updateUser = updateUser;
// Update user by nationalId
const updateAdminUser = async (req, res) => {
    const nationalId = parseInt(req.params.nationalId);
    if (isNaN(nationalId)) {
        res.status(400).json({ error: "Invalid national ID" });
        return;
    }
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
        res.status(400).json({ error: "All fields are required" });
        return;
    }
    try {
        const result = await (0, user_service_1.updateUserService)(nationalId, { firstName, lastName, email, password, role });
        res.status(200).json({ message: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to update user" });
    }
};
exports.updateAdminUser = updateAdminUser;
// Delete user by nationalId
const deleteUser = async (req, res) => {
    const nationalId = parseInt(req.params.nationalId);
    if (isNaN(nationalId)) {
        res.status(400).json({ error: "Invalid national ID" });
        return;
    }
    try {
        const result = await (0, user_service_1.deleteUserService)(nationalId);
        res.status(200).json({ message: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
