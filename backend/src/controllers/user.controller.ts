import User from "../models/user.model";
import { Request, Response } from "express";
import { RequestWithUser } from "./signIn.controller";

const getUser = async (req: RequestWithUser, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
       return res.status(404).json("Tài khoản không tồn tại!");
    }
    const data = {
      userId: user._id,
      email: user.email,
      displayName: user.displayName,
    };
    console.log(data);
    return res.status(200).json({data})
    
  } catch (error) {
    console.error("Error when get user")
  }
}

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

export { getUserInfo, updateUserInfo, getUser };
