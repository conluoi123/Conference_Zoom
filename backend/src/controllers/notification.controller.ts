import { Request, Response } from "express";
import { getNotifications, markNotificationAsRead } from "../services/notification.services";

// notification.controller.ts
const getAllNotifications = async (req: Request, res: Response) => {
  const { email, page, limit } = req.query; // Đổi từ req.body sang req.query
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const results = await getNotifications(email as string, pageNum, limitNum);

  return res.status(200).json(results);
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
