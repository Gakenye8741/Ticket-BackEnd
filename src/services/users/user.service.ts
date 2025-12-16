import { eq, desc, ilike } from "drizzle-orm";
import db from "../../drizzle/db";
import {
  users,
  bookings,
  events,
  venues,
  payments,
  supportTickets,
  TInsertUser,
  TSelectUser,
} from "../../drizzle/schema";

import bcrypt from "bcrypt"

// Utility: Exclude password from returned user objects
function excludePassword<T extends { password?: string }>(user: T): Omit<T, "password"> {
  const { password, ...rest } = user;
  return rest;
}

// ✅ Get all users (ordered by nationalId) without password
export const getAllUsersService = async (): Promise<Omit<TSelectUser, "password">[]> => {
  const usersList = await db.query.users.findMany({
    orderBy: [desc(users.nationalId)],
  });
  return usersList.map(excludePassword);
};

// ✅ Get user by last name (case-insensitive, partial match) without password
export const getUserByLastNameService = async (
  lastName: string
): Promise<Omit<TSelectUser, "password">[]> => {
  const results = await db.query.users.findMany({
    where: ilike(users.lastName, `%${lastName}%`),
  });
  return results.map(excludePassword);
};

// ✅ Get user by nationalId without password
export const getUserByNationalIdService = async (
  nationalId: number
): Promise<Omit<TSelectUser, "password"> | undefined> => {
  const user = await db.query.users.findFirst({
    where: eq(users.nationalId, nationalId),
  });
  return user ? excludePassword(user) : undefined;
};

// ✅ Get full user profile with all related data using nationalId (excluding password)
export const getUserWithDetailsService = async (
  nationalId: number
) => {
  const userDetails = await db.query.users.findFirst({
    where: eq(users.nationalId, nationalId),
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

  if (!userDetails) return undefined;

  const { password, ...safeDetails } = userDetails;
  return safeDetails;
};

// ✅ Search users with details using last name (excluding password)
export const searchUsersWithDetailsService = async (
  query: string
) => {
  const matchedUsers = await db.query.users.findMany({
    where: ilike(users.lastName, `%${query}%`),
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
    orderBy: [desc(users.nationalId)],
  });

  return matchedUsers.map(({ password, ...rest }) => rest);
};

// ✅ Create a new user
export const createUserService = async (                              
  user: TInsertUser
): Promise<string> => {
  await db.insert(users).values(user).returning();
  return "User created successfully ✅";                                                  
};

export const updateUserService = async (
  nationalId: number,
  user: Partial<TInsertUser>
): Promise<string> => {
  const dataToUpdate: Partial<TInsertUser> = { ...user };

  // ✅ HASH PASSWORD IF PRESENT
  if (user.password) {
    const saltRounds = 10;
    dataToUpdate.password = await bcrypt.hash(user.password, saltRounds);
  }

  await db
    .update(users)
    .set(dataToUpdate)
    .where(eq(users.nationalId, nationalId));

  return "User updated successfully";
};
                                                

// ✅ Delete user by nationalId
export const deleteUserService = async (
  nationalId: number
): Promise<string> => {
  await db.delete(users).where(eq(users.nationalId, nationalId));
  return "User deleted successfully ❌";
};
