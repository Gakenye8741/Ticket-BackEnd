import { Router } from "express";
import {  registerUser, loginUser, passwordReset,updatePassword } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/auth/register", registerUser);
authRouter.post("/auth/login", loginUser);
authRouter.post("/password-reset", passwordReset);
authRouter.put("/reset/:token", updatePassword);
