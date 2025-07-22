"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.updatePassword = exports.passwordReset = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_service_1 = require("./auth.service");
const user_validator_1 = require("../validators/user.validator");
const googleMailer_1 = require("../middleware/googleMailer");
// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const result = user_validator_1.registerSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.issues });
            return;
        }
        const user = result.data;
        const existingUser = await (0, auth_service_1.getUserByEmailService)(user.email);
        if (existingUser) {
            res.status(400).json({ error: "User with this email already exists" });
            return;
        }
        const salt = bcrypt_1.default.genSaltSync(10);
        const hashedPassword = bcrypt_1.default.hashSync(user.password, salt);
        user.password = hashedPassword;
        const newUser = await (0, auth_service_1.createUserServices)(user);
        const fullName = `${user.firstName} ${user.lastName}`;
        const emailNotification = await (0, googleMailer_1.sendEmails)(user.email, fullName, "Account Created Successfully 🌟", "Welcome to our event and tickets Management System!", user.lastName);
        res.status(201).json({
            message: "User created successfully ✅",
            user: newUser,
            emailNotification,
        });
    }
    catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ error: error.message || "Failed to register user" });
    }
};
exports.registerUser = registerUser;
// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const result = user_validator_1.loginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.issues });
            return;
        }
        const { email, password } = result.data;
        const user = await (0, auth_service_1.getUserByEmailService)(email);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isMatch = bcrypt_1.default.compareSync(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid password" });
            return;
        }
        const payload = {
            nationalId: user.nationalId,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            contactPhone: user.contactPhone,
            address: user.address,
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
        };
        const secret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign(payload, secret);
        res.status(200).json({
            token,
            ...payload,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to login user" });
    }
};
exports.loginUser = loginUser;
// PASSWORD RESET REQUEST
const passwordReset = async (req, res) => {
    try {
        const result = user_validator_1.passwordResetRequestSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.issues });
            return;
        }
        const { email } = result.data;
        const user = await (0, auth_service_1.getUserByEmailService)(email);
        // Always respond the same for security reasons
        if (!user) {
            res.status(200).json({ message: "If an account exists, a reset link has been sent." });
            return;
        }
        const resetToken = jsonwebtoken_1.default.sign({ nationalId: user.nationalId, purpose: "password_reset" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const results = await (0, googleMailer_1.sendEmails)(email, `${user.firstName} ${user.lastName}`, "Password Reset", `Click here to reset your password: <a href="${resetLink}">Reset Password</a>`, user.lastName);
        if (!results) {
            res.status(500).json({ error: "Failed to send reset email" });
            return;
        }
        res.status(200).json({
            message: "Password reset email sent",
            resetToken,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to reset password" });
    }
};
exports.passwordReset = passwordReset;
// UPDATE PASSWORD
const updatePassword = async (req, res) => {
    try {
        const { token } = req.params;
        const result = user_validator_1.passwordUpdateSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.issues });
            return;
        }
        const { newPassword } = result.data;
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (payload.purpose !== "password_reset") {
            res.status(400).json({ error: "Invalid token purpose" });
            return;
        }
        const user = await (0, auth_service_1.getUserByIdService)(payload.nationalId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const hashed = bcrypt_1.default.hashSync(newPassword, 10);
        await (0, auth_service_1.updateUserPasswordService)(user.email, hashed);
        await (0, googleMailer_1.sendEmails)(user.email, `${user.firstName} ${user.lastName}`, "Password Reset Success", "Your password has been updated successfully.", user.lastName);
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        res.status(500).json({ error: error.message || "Password update failed" });
    }
};
exports.updatePassword = updatePassword;
// EMAIL VERIFICATION
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (payload.purpose !== "email_verification") {
            res.status(400).json({ error: "Invalid token purpose" });
            return;
        }
        const user = await (0, auth_service_1.getUserByIdService)(payload.nationalId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // await verifyUserEmailService(user.nationalId);
        res.status(200).json({ message: "Email verified successfully" });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "Verification link expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        res.status(500).json({ error: error.message || "Failed to verify email" });
    }
};
exports.verifyEmail = verifyEmail;
