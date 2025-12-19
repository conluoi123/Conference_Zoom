import { ppid } from "process";
import Chat from "../models/chat.model";
import { findProgressingSession } from "./session.services";

interface newMessage {
  participantId: string;
  participantName: string;
  content: string;
  timestamp: Date;
}

const createChat = async (sessionId) => {
  const chat = await Chat.create({
    sessionId: sessionId,
    chat: [],
  });
  if (!chat) {
    throw new Error("Lỗi database: Không thể tạo đoạn chat");
  }
  return chat;
};

const insertNewMessage = async (roomId: string, newMessage: newMessage) => {
  const session = await findProgressingSession(roomId);
  let chatObj = await Chat.findOne({ sessionId: session.sessionId });
  if (!chatObj) {
    chatObj = await createChat(session.sessionId);
  }
  chatObj.chat.push(newMessage);
  await chatObj.save();
};

const getChat = async (roomId: string) => {
  const session = await findProgressingSession(roomId);
  const chat = await Chat.findOne({ sessionId: session.sessionId });
  if (!chat) {
    return [];
  }
  return chat.chat;
};
export { insertNewMessage, getChat };
