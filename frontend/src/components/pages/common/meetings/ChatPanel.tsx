import React, { useState, useEffect, useRef, memo } from "react";
import { X, Send } from "lucide-react";
import { socketService } from "@/services/socket";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  avatar: string;
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
  avatar: string;
}


const ChatPanel = memo(function ChatPanel({
  isOpen,
  onClose,
  roomId,
  participantName,
  participantId,
  avatar,
}: ChatPanelProps) {
  console.log("🔄 ChatPanel RENDER"); // Debug log

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const hasJoinedRef = useRef(false);

  // ============ SETUP LISTENERS ============
  useEffect(() => {
    console.log("🎬 ChatPanel useEffect - Setup listeners");

    const formatMessage = (data: any): Message => ({
      id: data.id || crypto.randomUUID(),
      avatar: data.avatar,
      participantName: data.participantName || "Người lạ",
      participantId: data.participantId,
      content: data.content,
      createdAt: data.timestamp ? new Date(data.timestamp) : new Date(),
      isLocal: data.participantId === participantId,
    });

    const handleNewMessage = (data: any) => {
      console.log("📩 Nhận tin nhắn mới:", data);
      const newMessage = formatMessage(data);
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleChatHistory = (datas: any[]) => {
      console.log("📜 Nhận lịch sử chat:", datas?.length || 0, "tin");
      if (!Array.isArray(datas)) return;

      const formattedMessages = datas.map(formatMessage);
      setMessages(formattedMessages);
    };

    socketService.onChatMessage(handleNewMessage);
    socketService.onChatHistory(handleChatHistory);

    // Join room CHỈ MỘT LẦN
    if (!hasJoinedRef.current && socketService.isConnected()) {
      console.log(`🚪 Tham gia phòng chat: ${roomId}`);
      socketService.joinMeetingRoom(roomId, participantName);
      hasJoinedRef.current = true;
    }

    return () => {
      console.log("🧹 ChatPanel cleanup");
      socketService.offMeetingEvents();

      if (hasJoinedRef.current) {
        socketService.leaveMeetingRoom(roomId, participantName);
        hasJoinedRef.current = false;
      }
    };
  }, [roomId, participantId, participantName]);

  // ============ AUTO SCROLL ============
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ============ FOCUS INPUT ============
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ============ SEND MESSAGE ============
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    socketService.sendChatMessage({
      roomId,
      avatar,
      content: inputMessage.trim(),
      participantName,
      participantId,
    });

    setInputMessage("");
  };

  // ============ HELPER FUNCTIONS ============
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============ RENDER ============
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-96 bg-[#202124] border-l border-gray-700 flex flex-col h-full shadow-2xl z-40"
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
            <div
              key={message.id}
              className={`flex w-full ${message.isLocal ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`flex max-w-[80%] gap-3 ${message.isLocal ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm ${message.isLocal
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-purple-500 to-purple-600"
                    }`}
                >
                  <img
                    src={message.isLocal ? user?.avatar : message.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Message Content */}
                <div
                  className={`flex flex-col ${message.isLocal ? "items-end" : "items-start"
                    }`}
                >
                  {/* Name + Time */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium ${message.isLocal ? "text-blue-400" : "text-gray-300"
                        }`}
                    >
                      {message.isLocal ? "Bạn" : message.participantName}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2 rounded-2xl break-words text-sm shadow-sm ${message.isLocal
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
  );
});

export default ChatPanel;