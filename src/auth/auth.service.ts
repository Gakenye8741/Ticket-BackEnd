import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import bcrypt from "bcrypt";
import { RegisterInput } from "../validators/user.validator";
import { TSelectUser } from "../drizzle/schema";

export const createUserServices = async (userData: RegisterInput): Promise<TSelectUser> => {
  try {
    const result = await db.insert(users)
      .values({
        nationalId: userData.nationalId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        contactPhone: userData.contactPhone || null,
        address: userData.address || null,
        role: userData.role
      })
      .returning();
    
    return result[0];
  } catch (error) {
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getUserByEmailService = async (email: string): Promise<TSelectUser | undefined> => {
  try {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return result || undefined;
  } catch (error) {
    throw new Error(`Failed to get user by email: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getUserByIdService = async (nationalId: number): Promise<TSelectUser | undefined> => {
  try {
    const result = await db.query.users.findFirst({
      where: eq(users.nationalId, nationalId)
    });
    return result || undefined;
  } catch (error) {
    throw new Error(`Failed to get user by nationalId: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const updateUserPasswordService = async (email: string, newPassword: string): Promise<TSelectUser> => {
  try {
    const result = await db.update(users)
      .set({ 
        password: newPassword,
        updatedAt: new Date() 
      })
      .where(eq(users.email, email))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0];
  } catch (error) {
    throw new Error(`Failed to update password: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const verifyUserCredentials = async (email: string, password: string): Promise<TSelectUser> => {
  try {
    const user = await getUserByEmailService(email);
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }

    return user;
  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const updateUserProfileService = async (
  nationalId: number,
  updateData: {
    firstName?: string;
    lastName?: string;
    contactPhone?: string | null;
    address?: string | null;
  }
): Promise<TSelectUser> => {
  try {
    const result = await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.nationalId, nationalId))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0];
  } catch (error) {
    throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : String(error)}`);
  }
};
