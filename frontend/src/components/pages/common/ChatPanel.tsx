// ChatPanel.tsx
import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  senderName: string;
  content: string;
  createdAt: Date;
  isLocal?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  userName: string;
  userId: string;
}

export default function ChatPanel({ isOpen, onClose, roomId, userName, userId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Kết nối Socket.IO
  useEffect(() => {
    const socketInstance = io("http://localhost:8080", {
      transports: ["websocket"],
      reconnection: true,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to socket server");
      
      // Join room khi connect
      socketInstance.emit("join-room", {
        roomId,
        peerId: userId,
        name: userName,
      });
    });

    // Nhận tin nhắn từ server
    socketInstance.on("receive-message", (data: any) => {
      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        senderName: data.senderName,
        content: data.content,
        createdAt: new Date(data.createdAt),
        isLocal: data.senderName === userName,
      };
      
      setMessages((prev) => [...prev, newMessage]);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId, userId, userName]);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input khi mở panel
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      roomId,
      content: inputMessage.trim(),
      senderName: userName,
      senderId: userId,
    };

    // Gửi tin nhắn qua socket
    socket.emit("send-message", messageData);

    // Clear input
    setInputMessage("");
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <h3 className="text-white text-lg font-semibold">Trò chuyện trong cuộc họp</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="text-xs mt-2">Hãy gửi tin nhắn đầu tiên!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isLocal ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${
                  message.isLocal ? "bg-blue-600" : "bg-purple-600"
                }`}
              >
                {getInitials(message.senderName)}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.isLocal ? "text-right" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${message.isLocal ? "text-blue-400" : "text-gray-300"}`}>
                    {message.isLocal ? "Bạn" : message.senderName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-2xl max-w-full break-words ${
                    message.isLocal
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-gray-900 px-4 py-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}