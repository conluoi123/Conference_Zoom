import User from "../models/user.model";
import { Request, Response } from "express";

const getUserInfo = (req: Request, res: Response) => {
  const userInfo = res.locals.userInfo;
  res.status(200).json(userInfo);
};

const updateUserInfo = async (req: Request, res: Response) => {
  const { userId, displayName, avatar } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: { displayName, avatar }, // Mongoose tự động bỏ qua nếu giá trị là undefined
    },
    { new: true } // Option này để trả về dữ liệu MỚI sau khi update
  );
  res.status(200).json(updatedUser);
};

export { getUserInfo, updateUserInfo };
