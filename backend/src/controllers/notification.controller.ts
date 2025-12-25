import { Request, Response } from "express";
import { getNotifications } from "../services/notification.services";

const getAllNotifications = async (req: Request, res: Response) => {
  const { email } = req.body;
  const notifications = await getNotifications(email);
  return res.status(200).json({ notifications });
};
export { getAllNotifications };
