import { Request, Response } from "express";
import {
  createUserService,
  deleteUserService,
  getAllUsersService,
  getUserByLastNameService,
  getUserByNationalIdService,
  getUserWithDetailsService,
  updateUserService,
  searchUsersWithDetailsService,
} from "./user.service";

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await getAllUsersService();
    if (!allUsers || allUsers.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }
    res.status(200).json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
};

// Get user by nationalId
export const getUserByNationalId = async (req: Request, res: Response) => {
  const nationalId = parseInt(req.params.nationalId);
  if (isNaN(nationalId)) {
    res.status(400).json({ error: "Invalid national ID" });
    return;
  }
  try {
    const user = await getUserByNationalIdService(nationalId);
    if (!user) {
      res.status(404).json({ message: "User not found" }); 
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
};

// Get user by last name (partial match, case-insensitive)
export const getUserByLastName = async (req: Request, res: Response) => {
  const lastName = req.query.lastName as string;

  if (!lastName) {
    res.status(400).json({ error: "Missing lastName query parameter" });
    return;
  }

  try {
    const users = await getUserByLastNameService(lastName);
    if (!users || users.length === 0) {
      res.status(404).json({ message: "No users found with that last name" });
      return;
    }

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error searching users" });
  }
};

// Get full user profile with all related data using nationalId
export const getUserDetails = async (req: Request, res: Response) => {
  const nationalId = parseInt(req.params.nationalId);
  if (isNaN(nationalId)) {
    res.status(400).json({ error: "Invalid national ID" });
     return;
  }

  try {
    const userDetails = await getUserWithDetailsService(nationalId);
    if (!userDetails) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(userDetails);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user details" });
  }
};

// 🔍 Search all users with details using last name
export const searchUsersWithDetails = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
     res.status(400).json({ error: "Missing search query parameter" });
     return;
  }

  try {
    const users = await searchUsersWithDetailsService(query);
    if (!users || users.length === 0) {
      res.status(404).json({ message: "No matching users found" });
      return;
    }
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to search users" });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, nationalId } = req.body;
  if (!firstName || !lastName || !email || !password || !nationalId) {
    res.status(400).json({ error: "All fields are required" });  
    return;
  }

  try {
    const result = await createUserService({ firstName, lastName, email, password, nationalId });
    res.status(201).json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
};

/// Update user by nationalId (partial update allowed)
export const updateUser = async (req: Request, res: Response) => {
  console.log(req.body);
  const nationalId = parseInt(req.params.nationalId);
  if (isNaN(nationalId)) {
    return res.status(400).json({ error: "Invalid national ID" });
  }

  // Extract possible fields from the request body
  const { firstName, lastName, email, password, profileImageUrl, role } = req.body;

  // Build the update object dynamically
  const updates: any = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.password = password;
  if (profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update" });
  }
  console.log(profileImageUrl);
  try {
    const result = await updateUserService(nationalId, updates);
    return res.status(200).json({ message: result, updatedFields: updates });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update user" });
  }
};

// Update user by nationalId
export const updateAdminUser = async (req: Request, res: Response) => {
  const nationalId = parseInt(req.params.nationalId);
  if (isNaN(nationalId)) {
    res.status(400).json({ error: "Invalid national ID" });
    return;
  }

  const { firstName, lastName, email, password ,role} = req.body;
  if (!firstName || !lastName || !email || !password || !role) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const result = await updateUserService(nationalId, { firstName, lastName, email, password ,role});
    res.status(200).json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update user" });
  }
};

// Delete user by nationalId
export const deleteUser = async (req: Request, res: Response) => {
  const nationalId = parseInt(req.params.nationalId);
  if (isNaN(nationalId)) {
    res.status(400).json({ error: "Invalid national ID" });
    return;
  }

  try {
    const result = await deleteUserService(nationalId);
    res.status(200).json({ message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete user" });
  }
};
