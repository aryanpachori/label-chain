"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddlewareWorkers = exports.authMiddleware = void 0;
require('dotenv').config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_SECRET_WORKER = process.env.JWT_SECRET_WORKER || "";
const authMiddleware = (req, res, next) => {
    var _a;
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    try {
        const decoded = jsonwebtoken_1.default.verify(authHeader, JWT_SECRET);
        //@ts-ignore
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        }
        else {
            return res.status(403).json({ message: "you are not logged in" });
        }
    }
    catch (e) {
        return res.status(403).json({ message: "you are not logged in" });
    }
};
exports.authMiddleware = authMiddleware;
const authMiddlewareWorkers = (req, res, next) => {
    var _a;
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    try {
        const decoded = jsonwebtoken_1.default.verify(authHeader, JWT_SECRET_WORKER);
        //@ts-ignore
        if (decoded.workerId) {
            //@ts-ignore
            req.workerId = decoded.workerId;
            return next();
        }
        else {
            return res.status(403).json({ message: "you are not logged in" });
        }
    }
    catch (e) {
        return res.status(403).json({ message: "you are not logged in" });
    }
};
exports.authMiddlewareWorkers = authMiddlewareWorkers;
