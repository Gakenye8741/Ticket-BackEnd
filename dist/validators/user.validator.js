"use strict";
// // auth.validator.ts
// import { z } from "zod";
// import { roleEnum } from "../drizzle/schema";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordUpdateSchema = exports.passwordResetRequestSchema = exports.loginSchema = exports.registerSchema = void 0;
// // Exact schema-matching validations
// export const registerSchema = z.object({
//   firstName: z.string()
//     .min(1, "First name is required")
//     .max(100, "First name cannot exceed 100 characters"),
//   lastName: z.string()
//     .min(1, "Last name is required")
//     .max(100, "Last name cannot exceed 100 characters"),
//   email: z.string()
//     .email("Invalid email format")
//     .max(255, "Email cannot exceed 255 characters"),
//   password: z.string()
//     .min(1, "Password is required")
//     .max(255, "Password cannot exceed 255 characters"),
//   contactPhone: z.string()
//     .max(20, "Contact phone cannot exceed 20 characters")
//     .optional(),
//   address: z.string()
//     .max(255, "Address cannot exceed 255 characters")
//     .optional(),
//   role: z.enum(roleEnum.enumValues).default('user')
// }).strict();
// export const loginSchema = z.object({
//   email: z.string()
//     .email("Invalid email format")
//     .max(255, "Email cannot exceed 255 characters"),
//   password: z.string()
//     .min(1, "Password is required")
//     .max(255, "Password cannot exceed 255 characters")
// }).strict();
// export const passwordResetRequestSchema = z.object({
//   email: z.string()
//     .email("Invalid email format")
//     .max(255, "Email cannot exceed 255 characters")
// }).strict();
// export const passwordUpdateSchema = z.object({
//   token: z.string().min(1, "Token is required"),
//   newPassword: z.string()
//     .min(1, "Password is required")
//     .max(255, "Password cannot exceed 255 characters"),
//   confirmPassword: z.string()
//     .min(1, "Please confirm your password")
// }).strict()
// .refine(data => data.newPassword === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"]
// });
// // Type exports matching your schema
// export type RegisterInput = z.infer<typeof registerSchema>;
// export type LoginInput = z.infer<typeof loginSchema>;
// export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
// export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
// auth.validator.ts
const zod_1 = require("zod");
const schema_1 = require("../drizzle/schema");
// Exact schema-matching validations
exports.registerSchema = zod_1.z.object({
    nationalId: zod_1.z.number({
        required_error: "National ID is required",
        invalid_type_error: "National ID must be a number",
    }).refine((val) => val.toString().length >= 7 && val.toString().length <= 10, {
        message: "National ID must be between 7 and 10 digits",
    }),
    firstName: zod_1.z.string()
        .min(1, "First name is required")
        .max(100, "First name cannot exceed 100 characters"),
    lastName: zod_1.z.string()
        .min(1, "Last name is required")
        .max(100, "Last name cannot exceed 100 characters"),
    email: zod_1.z.string()
        .email("Invalid email format")
        .max(255, "Email cannot exceed 255 characters"),
    password: zod_1.z.string()
        .min(1, "Password is required")
        .max(255, "Password cannot exceed 255 characters"),
    contactPhone: zod_1.z.string()
        .max(20, "Contact phone cannot exceed 20 characters")
        .optional(),
    address: zod_1.z.string()
        .max(255, "Address cannot exceed 255 characters")
        .optional(),
    role: zod_1.z.enum(schema_1.roleEnum.enumValues).default("user")
}).strict();
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email("Invalid email format")
        .max(255, "Email cannot exceed 255 characters"),
    password: zod_1.z.string()
        .min(1, "Password is required")
        .max(255, "Password cannot exceed 255 characters")
}).strict();
exports.passwordResetRequestSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email("Invalid email format")
        .max(255, "Email cannot exceed 255 characters")
}).strict();
exports.passwordUpdateSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
    newPassword: zod_1.z.string()
        .min(1, "Password is required")
        .max(255, "Password cannot exceed 255 characters"),
    confirmPassword: zod_1.z.string()
        .min(1, "Please confirm your password")
}).strict().refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
