import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_SECRET_WORKER } from "../config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"] ?? "";
  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET);
    //@ts-ignore
    if (decoded.userId) {
      //@ts-ignore
      req.userId = decoded.userId;
      return next();
    } else {
      return res.status(403).json({ message: "you are not logged in" });
    }
  } catch (e) {
    return res.status(403).json({ message: "you are not logged in" });
  }
};


export const authMiddlewareWorkers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"] ?? "";
  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET_WORKER);
    //@ts-ignore
    if (decoded.workerId) {
      //@ts-ignore
      req.workerId = decoded.workerId;
      return next();
    } else {
      return res.status(403).json({ message: "you are not logged in" });
    }
  } catch (e) {
    return res.status(403).json({ message: "you are not logged in" });
  }
};
