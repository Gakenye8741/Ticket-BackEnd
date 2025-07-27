import { Request, Response, RequestHandler } from "express";
import {
  getUserByEmailService,
  getUserById,
  registerUserService,
  updateUserPasswordService,
  updateVerificationStatusService,
} from "./auth.service";
import {
  registerUserValidator,
  userLogInValidator,
} from "../validators/user.validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendNotificationEmail } from "../../src/middleware/googleMailer";

// Generate 6-digit code
const generateConfirmationCode = () => Math.floor(100000 + Math.random() * 900000);

// Register
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const parseResult = registerUserValidator.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const user = parseResult.data;
    const existingUser = await getUserByEmailService(user.email);
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    const newUserPayload = {
      ...user,
      password: hashedPassword,
      confirmationCode: generateConfirmationCode().toString(),
      nationalId: Math.floor(100000000 + Math.random() * 900000000),
      emailVerified: false,
      profileImageUrl: null,
      contactPhone: user.contactPhone || null,
      address: user.address || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUser = await registerUserService(newUserPayload);

    const subject = "Account Created Successfully";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #093FB4;">Welcome, ${user.firstName} ${user.lastName}!</h2>
        <p>Thank you for registering with our <strong>Medical Appointment & Patient Management System</strong>.</p>
        <p>Your verification code is:</p>
        <div style="background-color: #eef3fc; padding: 10px; border-radius: 6px; text-align: center; font-size: 20px; font-weight: bold; color: #093FB4;">
        ${newUserPayload.confirmationCode}
        </div>
        <p>Please enter this code to verify your email and activate your account.</p>
        <p style="color: #777;">If you did not create this account, please ignore this email.</p>
        <p style="margin-top: 30px;">Thank you,<br><strong>The Medical Services Team</strong></p>
      </div>
    `;

    const emailSent = await sendNotificationEmail(user.email, subject, user.firstName, html);

    if (!emailSent) {
      res.status(500).json({ error: "User created but failed to send notification email" });
      return;
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
};

// Login
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const parseResult = userLogInValidator.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid input", details: parseResult.error });
      return;
    }

    const user = parseResult.data;
    const userExists = await getUserByEmailService(user.email);
    if (!userExists) {
      res.status(404).json({ error: "User does not exist" });
      return;
    }

    if (!userExists.emailVerified) {
      res.status(403).json({ error: "Please verify your email." });
      return;
    }

    const isMatch = bcrypt.compareSync(user.password, userExists.password!);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const payload = {
      nationalId: userExists.nationalId,
      userEmail: userExists.email,
      role: userExists.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!);

    res.status(200).json({
      token,
      nationalId: userExists.nationalId,
      email: userExists.email,
      role: userExists.role,
      message: "Login successful 😎",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to login user" });
  }
};

// Forgot Password
export const passwordReset: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await getUserByEmailService(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const resetToken = jwt.sign(
      { nationalId: user.nationalId },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.FRONTEND_URL}reset-password/${resetToken}`;
    const html = `Click the link to reset your password: <a href="${resetLink}">Reset Password</a>`;

    const results = await sendNotificationEmail(email, "Password Reset", user.firstName, html);
    if (!results) {
      res.status(500).json({ error: "Failed to send reset email" });
      return;
    }

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to reset password" });
  }
};

// Update Password
export const updatePassword: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: "Token and password are required" });
      return;
    }

    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await getUserById(payload.nationalId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    await updateUserPasswordService(user.email!, hashedPassword);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Invalid or expired token" });
  }
};

// Email Verification
export const emailVerfication: RequestHandler = async (req, res) => {
  try {
    const { email, confirmationCode } = req.body;

    const user = await getUserByEmailService(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.confirmationCode !== confirmationCode) {
      res.status(400).json({ error: "Invalid Confirmation code" });
      return;
    }

    const updatedUser = await updateVerificationStatusService(
      user.email!,
      true,
      null
    );

    if (!updatedUser) {
      res.status(500).json({ error: "Failed to update verification status" });
      return;
    }

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Email verification failed" });
  }
};
