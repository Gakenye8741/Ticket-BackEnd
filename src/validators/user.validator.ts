import { z } from "zod";

export const registerUserValidator = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    contactPhone: z.string().min(10, "Contact phone must be at least 10 characters long"),
    address: z.string().optional(),
    role: z.enum(["user", "admin"]).default("user"),
    confirmationCode: z.string().optional(),
    
});

export const userLogInValidator = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(2, "Password must be at least 6 characters long")
});