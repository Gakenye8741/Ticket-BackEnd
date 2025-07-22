"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfileService = exports.verifyUserCredentials = exports.updateUserPasswordService = exports.getUserByIdService = exports.getUserByEmailService = exports.createUserServices = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../drizzle/db"));
const schema_1 = require("../drizzle/schema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUserServices = async (userData) => {
    try {
        const result = await db_1.default.insert(schema_1.users)
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
    }
    catch (error) {
        throw new Error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.createUserServices = createUserServices;
const getUserByEmailService = async (email) => {
    try {
        const result = await db_1.default.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email)
        });
        return result || undefined;
    }
    catch (error) {
        throw new Error(`Failed to get user by email: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.getUserByEmailService = getUserByEmailService;
const getUserByIdService = async (nationalId) => {
    try {
        const result = await db_1.default.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.nationalId, nationalId)
        });
        return result || undefined;
    }
    catch (error) {
        throw new Error(`Failed to get user by nationalId: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.getUserByIdService = getUserByIdService;
const updateUserPasswordService = async (email, newPassword) => {
    try {
        const result = await db_1.default.update(schema_1.users)
            .set({
            password: newPassword,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .returning();
        if (!result[0]) {
            throw new Error("User not found");
        }
        return result[0];
    }
    catch (error) {
        throw new Error(`Failed to update password: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.updateUserPasswordService = updateUserPasswordService;
const verifyUserCredentials = async (email, password) => {
    try {
        const user = await (0, exports.getUserByEmailService)(email);
        if (!user) {
            throw new Error("User not found");
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid password");
        }
        return user;
    }
    catch (error) {
        throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.verifyUserCredentials = verifyUserCredentials;
const updateUserProfileService = async (nationalId, updateData) => {
    try {
        const result = await db_1.default.update(schema_1.users)
            .set({
            ...updateData,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.nationalId, nationalId))
            .returning();
        if (!result[0]) {
            throw new Error("User not found");
        }
        return result[0];
    }
    catch (error) {
        throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.updateUserProfileService = updateUserProfileService;
