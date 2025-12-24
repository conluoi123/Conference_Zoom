// src/components/ChatPanel.tsx
import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { socket } from "../../../services/socket"; // Import singleton socket
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
interface Message {
  id: string; // Bắt buộc phải có ID duy nhất để làm key
  participantId: string;
  participantName: string;
  content: string;
  createdAt: Date;
  isLocal?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  participantName: string;
  participantId: string;
}

export default function ChatPanel({
  isOpen,
  onClose,
  roomId,
  participantName,
  participantId,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- 1. useEffect quản lý kết nối và sự kiện Socket ---
  useEffect(() => {
    const formatMessage = (data: any): Message => {
      const isMine = data.participantId === participantId;
      return {
        id: crypto.randomUUID(),
        participantName: data.participantName || "Người lạ",
        participantId: data.participantId,
        content: data.content,
        createdAt: data.timestamp ? new Date(data.timestamp) : new Date(),
        isLocal: isMine,
      };
    };

    // A. Xử lý tin nhắn Realtime (1 tin)
    const onMessageReceived = (data: any) => {
      const newMessage = formatMessage(data);
      setMessages((prev) => [...prev, newMessage]);
    };

    const onChatHistoryReceived = (datas: any[]) => {
      if (!Array.isArray(datas)) return;

      // Map toàn bộ mảng dữ liệu sang format chuẩn
      const formattedMessages = datas.map(formatMessage);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNewMessages = formattedMessages.filter(
          (m) => !existingIds.has(m.id)
        );
        return [...prev, ...uniqueNewMessages];
      });
    };

    // C. Logic kết nối
    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("meeting:join", { roomId, participantName });
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit("meeting:join", { roomId, participantName });
    }

    // ĐĂNG KÝ SỰ KIỆN
    socket.on("connect", onConnect);
    socket.on("meeting:chat", onMessageReceived);
    socket.on("meeting:chat-history", onChatHistoryReceived); // Lắng nghe lịch sử

    // CLEANUP
    return () => {
      socket.off("connect", onConnect);
      socket.off("meeting:chat", onMessageReceived);
      socket.off("meeting:chat-history", onChatHistoryReceived);
    };
  }, [roomId, participantId, participantName]);

  // --- 2. Auto scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // --- 3. Focus input ---
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const messagePayload = {
      roomId,
      content: inputMessage.trim(),
      participantName: participantName,
      participantId: participantId,
      timestamp: new Date().toISOString(), // Gửi kèm thời gian chuẩn ISO
    };

    socket.emit("meeting:chat", messagePayload);
    setInputMessage("");
  };

  // Hàm xử lý tên viết tắt an toàn
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "??";
    return parts
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // if (!isOpen) return null;
  const { user } = useAuth();
  return (
    <>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="h-full w-96 bg-gray-800 shadow-2xl flex flex-col border-l border-gray-700"
      >
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-700 shadow-sm">
          <h3 className="text-white text-lg font-semibold">Thảo luận</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-70">
              <div className="bg-gray-700 p-4 rounded-full mb-3">
                <Send className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
              <p className="text-xs mt-1">Hãy gửi lời chào đến mọi người!</p>
            </div>
          ) : (
            messages.map((message) => (
              // Wrapper căn chỉnh: justify-end (phải) cho mình, justify-start (trái) cho người khác
              <div
                key={message.id} // SỬA: Dùng ID làm key thay vì timeString
                className={`flex w-full ${
                  message.isLocal ? "justify-end" : "justify-start"
                }`}
              >
                {/* Khối nội dung tin nhắn */}
                <div
                  className={`flex max-w-[80%] gap-3 ${
                    message.isLocal ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm ${
                      message.isLocal
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gradient-to-br from-purple-500 to-purple-600"
                    }`}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      getInitials(message.participantName)
                    )}
                  </div>

                  {/* Message Content & Info */}
                  <div
                    className={`flex flex-col ${
                      message.isLocal ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Tên + Giờ */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium ${
                          message.isLocal ? "text-blue-400" : "text-gray-300"
                        }`}
                      >
                        {message.isLocal ? "Bạn" : message.participantName}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>

                    {/* Bong bóng chat */}
                    <div
                      className={`px-4 py-2 rounded-2xl break-words text-sm shadow-sm ${
                        message.isLocal
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-gray-700 text-gray-100 rounded-tl-sm"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="bg-gray-900 px-4 py-4 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-800 text-white pl-4 pr-10 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="absolute right-2 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-transparent disabled:text-gray-600 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
}
