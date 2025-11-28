import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";

const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  const user = await User.findOne({ _id: userId });
  if (!userId || !user) {
    res.status(404).json("Tài khoản không tồn tại!");
  }
  res.locals.userInfo = user;
  next();
};

export { userMiddleware };
