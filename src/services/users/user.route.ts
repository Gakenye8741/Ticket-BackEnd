import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  getUserByLastName,
  getUserDetails,
  getUserByNationalId,
  searchUsersWithDetails,
  updateAdminUser,
} from "./user.controller";

import { adminAuth, anyAuthenticatedUser } from "../../middleware/bearAuth";

export const userRouter = Router();

// 📋 Get all users (basic profiles)
userRouter.get("/users",  getUsers);

// 🔍🧑 Search users by last name (basic profile match)
userRouter.get("/users-search", getUserByLastName);

// 🔍🧾 Search users by last name with full profile/details
userRouter.get("/details/users-search",  searchUsersWithDetails);

// 🧑‍💼 Get user by national ID
userRouter.get("/users/:nationalId", getUserByNationalId);

// 🧾 Get full user details (bookings, payments, support)
userRouter.get("/users/:nationalId/details",  getUserDetails);

// ➕ Create a new user
userRouter.post("/users",createUser);

// ♻️ Update an existing user by national ID
userRouter.put("/users/:nationalId", updateUser);


// ♻️ Update an existing user by national ID
userRouter.put("/admin/users/:nationalId", updateAdminUser);


// ❌ Delete a user by national ID
userRouter.delete("/users/:nationalId", deleteUser);
