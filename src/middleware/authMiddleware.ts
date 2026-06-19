import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthRole = "patient" | "doctor" | "admin" | "receptionist" | "nurse";

export interface AuthRequest extends Request {
  user?: { id: string; _id: string; role: AuthRole };
}

const getJwtSecretOrThrow = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return secret;
};

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, getJwtSecretOrThrow()) as {
      id: string;
      role: AuthRole;
    };
    req.user = { id: decoded.id, _id: decoded.id, role: decoded.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const checkAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
};

export const requireRole =
  (roles: AuthRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Requires role: ${roles.join(", ")}` });
    }
    return next();
  };

export const checkDoctor = requireRole(["doctor"]);
export const checkPatient = requireRole(["patient"]);

