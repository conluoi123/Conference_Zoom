import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";

const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let id = "";
  if (req.body) {
    const { userId } = req.body;
    id = userId
  } else {
    const { userId } = req.query;
    id = userId.toString();
  }
  console.log("loi o day")
  console.log(id);
  const user = await User.findOne({ _id: id });
  if (!id || !user) {
    res.status(404).json("Tài khoản không tồn tại!");
  }
  res.locals.userInfo = user;
  next();
};

export { userMiddleware };
