import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
  userId?: string
}

interface TokenPayload extends JwtPayload {
    userId?:string
}

export const auth = function (req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Authorization is missing." });
  }
  try {
    const decoded = jwt.verify(token, process.env.secreKey || '') as TokenPayload;
    req.userId = decoded?.userId;
    next();
  } catch (e) {
    console.log(e, "ERRRR**");
    return res.status(401).json({ message: "Invalid token." });
  }
};
