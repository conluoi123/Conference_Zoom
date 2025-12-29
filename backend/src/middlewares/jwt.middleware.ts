import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "../controllers/signIn.controller";
import jwt from "jsonwebtoken";
import { ENV } from "../configs/env";

function authenticateAccessToken(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization_code = req.headers["authorization"];
    if (!authorization_code) {
      return res.status(401).json({ message: "ACCESS TOKEN NOT FOUND" });
    }
    const token = authorization_code.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "ACCESS TOKEN NOT FOUND" });
    }
    const decoded = jwt.verify(token, ENV.JWT_SECRET); // Payload
    if (!decoded) {
      return res.status(401).json({ message: "ACCESS TOKEN IS EXPIRED" });
    }
    req.user = decoded;
  } catch (error) {
    console.log("ACCESS TOKEN IS EXPIRED OR WRONG", error);
    return res
      .status(401)
      .json({ message: "ACCESS TOKEN IS EXPIRED OR WRONG" });
  }
}

export { authenticateAccessToken };
