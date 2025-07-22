import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import {
  createUserServices,
  getUserByEmailService,
  getUserByIdService,
  updateUserPasswordService,
  // verifyUserEmailService,
} from "./auth.service";

import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordUpdateSchema,
} from "../validators/user.validator";

import { sendEmails } from "../middleware/googleMailer";

// REGISTER USER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }

    const user = result.data;
    const existingUser = await getUserByEmailService(user.email);

    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);
    user.password = hashedPassword;

    const newUser = await createUserServices(user);

    const fullName = `${user.firstName} ${user.lastName}`;
    const emailNotification = await sendEmails(
      user.email,
      fullName,
      "Account Created Successfully 🌟",
      "Welcome to our event and tickets Management System!",
      user.lastName
    );

    res.status(201).json({
      message: "User created successfully ✅",
      user: newUser,
      emailNotification,
    });
  } catch (error: any) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
};

// LOGIN USER
export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }

    const { email, password } = result.data;
    const user = await getUserByEmailService(email);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password);
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

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(payload, secret);

    res.status(200).json({
      token,
      ...payload,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to login user" });
  }
};

// PASSWORD RESET REQUEST
export const passwordReset = async (req: Request, res: Response) => {
  try {
    const result = passwordResetRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }

    const { email } = result.data;
    const user = await getUserByEmailService(email);

    // Always respond the same for security reasons
    if (!user) {
      res.status(200).json({ message: "If an account exists, a reset link has been sent." });
      return;
    }

    const resetToken = jwt.sign(
      { nationalId: user.nationalId, purpose: "password_reset" },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const results = await sendEmails(
      email,
      `${user.firstName} ${user.lastName}`,
      "Password Reset",
      `Click here to reset your password: <a href="${resetLink}">Reset Password</a>`,
      user.lastName
    );

    if (!results) {
      res.status(500).json({ error: "Failed to send reset email" });
      return;
    }

    res.status(200).json({
      message: "Password reset email sent",
      resetToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to reset password" });
  }
};

// UPDATE PASSWORD
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const result = passwordUpdateSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ error: result.error.issues });
      return;
    }

    const { newPassword } = result.data;

    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);

    if (payload.purpose !== "password_reset") {
      res.status(400).json({ error: "Invalid token purpose" });
      return;
    }

    const user = await getUserByIdService(payload.nationalId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    await updateUserPasswordService(user.email, hashed);

    await sendEmails(
      user.email,
      `${user.firstName} ${user.lastName}`,
      "Password Reset Success",
      "Your password has been updated successfully.",
      user.lastName
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.status(500).json({ error: error.message || "Password update failed" });
  }
};

// EMAIL VERIFICATION
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);

    if (payload.purpose !== "email_verification") {
      res.status(400).json({ error: "Invalid token purpose" });
      return;
    }

    const user = await getUserByIdService(payload.nationalId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // await verifyUserEmailService(user.nationalId);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Verification link expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    res.status(500).json({ error: error.message || "Failed to verify email" });
  }
};
