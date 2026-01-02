import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";

const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let id = "";
  if (req.body && req.body.userId) {
    const { userId } = req.body;
    id = userId;
  } else if (req.query && req.query.userId) {
    const { userId } = req.query;
    id = userId.toString();
  } else if (req.params && req.params.id) {
    // Support /:id route params
    id = req.params.id;
  }
  console.log(id);
  const user = await User.findOne({ _id: id });
  if (!id || !user) {
    res.status(404).json("Tài khoản không tồn tại!");
  }
  res.locals.userInfo = user;
  next();
};

export { userMiddleware };
