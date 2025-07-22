"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyAuthenticatedUser = exports.userAuth = exports.adminAuth = exports.authMiddleware = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Token verification helper
const verifyToken = async (token, secret) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
// Auth middleware factory with correct return type
const authMiddleware = (requiredRole) => {
    return async (req, res, next) => {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ error: "Authorization header is missing" });
            return;
        }
        const decodedToken = await (0, exports.verifyToken)(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            res.status(401).json({ error: "Invalid or expired token" });
            return;
        }
        const userType = decodedToken.role;
        if (requiredRole === "any" || userType === requiredRole) {
            req.user = decodedToken;
            next();
        }
        else {
            res.status(403).json({
                error: "Forbidden: You do not have permission to access this resource",
            });
        }
    };
};
exports.authMiddleware = authMiddleware;
// Role-based middleware exports
exports.adminAuth = (0, exports.authMiddleware)("admin");
exports.userAuth = (0, exports.authMiddleware)("user");
exports.anyAuthenticatedUser = (0, exports.authMiddleware)("any");
