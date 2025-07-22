"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
exports.userRouter = (0, express_1.Router)();
// 📋 Get all users (basic profiles)
exports.userRouter.get("/users", user_controller_1.getUsers);
// 🔍🧑 Search users by last name (basic profile match)
exports.userRouter.get("/users-search", user_controller_1.getUserByLastName);
// 🔍🧾 Search users by last name with full profile/details
exports.userRouter.get("/details/users-search", user_controller_1.searchUsersWithDetails);
// 🧑‍💼 Get user by national ID
exports.userRouter.get("/users/:nationalId", user_controller_1.getUserByNationalId);
// 🧾 Get full user details (bookings, payments, support)
exports.userRouter.get("/users/:nationalId/details", user_controller_1.getUserDetails);
// ➕ Create a new user
exports.userRouter.post("/users", user_controller_1.createUser);
// ♻️ Update an existing user by national ID
exports.userRouter.put("/users/:nationalId", user_controller_1.updateUser);
// ♻️ Update an existing user by national ID
exports.userRouter.put("/admin/users/:nationalId", user_controller_1.updateAdminUser);
// ❌ Delete a user by national ID
exports.userRouter.delete("/users/:nationalId", user_controller_1.deleteUser);
