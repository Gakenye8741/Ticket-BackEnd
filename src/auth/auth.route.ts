import { Router } from "express";
import { emailVerfication, loginUser, passwordReset, registerUser, updatePassword } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/auth/register", registerUser );
authRouter.post("/auth/login", loginUser);
authRouter.post("/auth/password-reset", passwordReset);
authRouter.put("/auth/reset/:token", updatePassword);
authRouter.put("/auth/verify-email", emailVerfication);