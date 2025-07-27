import db from "../drizzle/db";

import { eq } from "drizzle-orm";
import { TSelectUser, users } from "../drizzle/schema";

export const registerUserService = async(user: TSelectUser): Promise<TSelectUser> => {
    const [newUser] = await db.insert(users).values(user).returning();

    if (!newUser) {
        throw new Error("Failed to create user");
    }

    return newUser;
}


export const getUserByEmailService = async(email: string): Promise<TSelectUser | undefined> => {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });
    
    return user;
}

export const updateUserPasswordService = async (email: string, newPassword: string): Promise<string> => {
    const result = await db.update(users)
        .set({ password: newPassword })
        .where(eq(users.email, email))
        .returning();

    if (result.length === 0) {
        throw new Error("User not found or password update failed");
    }
    
    return "Password updated successfully";
}

export const updateVerificationStatusService = async (email: string, status: boolean, otp:null ): Promise<string> => {
    const result = await db.update(users)
        .set({ emailVerified: status, confirmationCode: otp })
        .where(eq(users.email, email))
        .returning();

    if (result.length === 0) {
        throw new Error("User not found or verification status update failed");
    }
    
    return "Verification status updated successfully";
}

export const getUserById = async(id: number):Promise<TSelectUser | undefined> => {
    const user = await db.query.users.findFirst({
        where: eq(users.nationalId, id)
    });

    return user;
}