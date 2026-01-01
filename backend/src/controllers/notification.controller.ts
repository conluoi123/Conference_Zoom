import { Request, Response } from "express";
import { getNotifications, markNotificationAsRead } from "../services/notification.services";

// notification.controller.ts
const getAllNotifications = async (req: Request, res: Response) => {
  const { email } = req.query; // Đổi từ req.body sang req.query
  const notifications = await getNotifications(email as string);
  return res.status(200).json({ notifications });
};

const markAsRead = async (req: Request, res: Response) => {
  const { notificationId } = req.body;
  
  if (!notificationId) {
    return res.status(400).json({ error: "Notification ID is required" });
  }
  
  try {
    await markNotificationAsRead(notificationId);
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to mark notification as read" });
  }
};


export { getAllNotifications, markAsRead };
