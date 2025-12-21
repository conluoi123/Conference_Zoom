import React, { useEffect, useRef, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { ParticipantTile } from "./common/meetings/ParticipantTile";
import { MeetingControls } from "./common/meetings/MeetingControls";
import { MeetingHeader } from "./common/meetings/MeetingHeader";
import { useMeetingPagination } from "../../hooks/useMeetingPagination";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./common/ChatPanel";
import { Copy, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import { ParticipantPanel } from "./common/meetings/ParticipantPanel";
// Import Shadcn Pagination nếu bạn đã cài
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { useAuth } from "@/context/AuthContext";
import LoadMeeting from "./common/meetings/LoadMeeting";
import { useNavigate } from "react-router-dom";
interface MeetingRoomProps {
  roomId: string;
  isHost: boolean;
  onLeaveMeeting: () => void;
  onToggleChat: () => void;
  onChatOpen: boolean;
}

export const MeetingRoom = React.memo(
  ({
    roomId,
    isHost,
    onLeaveMeeting,
    onChatOpen,
    onToggleChat,
  }: MeetingRoomProps) => {
    const navigate = useNavigate();
    const [showWelcome, setShowWelcome] = useState(false);
    const [isParticipantOpen, setIsParticipantOpen] = useState(false);
    const [joined, setJoined] = useState<"JOINING" | "JOINED">("JOINING");
    const [joinedRequest, setJoinRequests] = useState<any[]>([]);
    // thêm 2 method để nhận biết có người vào, người ra
    const { participants, join, localParticipant, leave } = useMeeting({
      // duyệt người vào phòng - chức năng của host
      onEntryRequested: (data) => {
        const { participantId, name, allow, deny } = data;
        // hiển thị thông báo duyệt
        if (isHost) {
          setJoinRequests((prev) => [...prev, data]);
          toast.custom(
            (t) => (
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 text-white min-w-[300px]">
                <div className="flex-1">
                  <p className="font-bold">{name}</p>
                  <p className="text-xs text-gray-400">
                    Muốn tham gia cuộc họp
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      allow(); // Duyệt qua SDK
                      setJoinRequests((prev) =>
                        prev.filter(
                          (req) => req.participantId !== participantId
                        )
                      );
                      toast.dismiss(t);
                    }}
                    className="bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => {
                      deny(); // Từ chối qua SDK
                      setJoinRequests((prev) =>
                        prev.filter(
                          (req) => req.participantId !== participantId
                        )
                      );
                      toast.dismiss(t);
                    }}
                    className="bg-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-600"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ),
            { duration: Infinity, position: "top-center" }
          );
        }
      },

      onMeetingJoined: () => {
        setJoined("JOINED");
        setTimeout(() => setShowWelcome(true), 100);
      },

      onError: (error) => {
        console.error("❌ Lỗi SDK:", error);
      },

      onMeetingStateChanged: ({ state }) => {
        console.log(state);
      },

      onParticipantJoined: (participant) => {
        if (participant.id === localParticipant?.id) {
          // tránh thông báo khi người vào là chính mình
          return;
        }
        console.log("Có người tham gia mới");
        toast.success(`${participant.displayName} đã tham gia cuộc họp`, {
          description: "Vừa mới vào phòng họp",
          duration: 3000,
        });
      },

      onParticipantLeft: (participant) => {
        toast.error(`${participant.displayName} đã rời đi`, {
          duration: 3000,
        });
      },
      onRecordingStarted: () => {
        console.log("🔴 Ghi hình đã bắt đầu");
      },
      onRecordingStopped: () => {
        console.log("⏹️ Ghi hình đã dừng");
      },
    });

    const handleJoin = () => {
      const timer = setTimeout(() => {
        join();
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết cuộc họp");
    };

    useEffect(() => {
      handleJoin();
    }, []);

    const { user } = useAuth();
    const participantIds = Array.from(participants.keys());

    const { visible, currentPage, setCurrentPage, totalPages } =
      useMeetingPagination(participantIds, 4);

    const toggleParticipantPanel = () => {
      setIsParticipantOpen(!isParticipantOpen);
      if (onChatOpen) onToggleChat(); // đóng nếu chat mở
    };
    const toggleChatPanel = () => {
      onToggleChat();
      if (isParticipantOpen) setIsParticipantOpen(!isParticipantOpen);
    };

    const getGridClass = (count: number) => {
      if (count === 0) return "";

      // 1 người: Toàn màn hình
      if (count === 1) return "grid-cols-1 grid-rows-1";

      // 2 người: Chia đôi dọc hoặc ngang (tùy màn hình, thường là 2 cột trên PC)
      if (count === 2)
        return "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1";

      // 3-4 người: Chia 2x2
      if (count <= 4) return "grid-cols-2 grid-rows-2";

      // 5-6 người: Chia 3 cột x 2 hàng
      if (count <= 6)
        return "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";

      // 7-9 người: Chia 3x3
      return "grid-cols-3 grid-rows-3";
    };

    return (
      <div className="bg-gray-950 h-screen w-screen flex flex-col overflow-hidden text-white">
        <MeetingHeader roomId={roomId} onLeave={onLeaveMeeting} />
        {joined === "JOINED" && (
          <>
            <main className="flex-1 flex flex-row overflow-hidden relative">
              {/* Bọc thêm AnimatePresence với mode="wait" để tạo hiệu ứng chuyển trang mượt mà */}
              <div className="flex-1 flex relative flex-col justify-center items-center p-4 overflow-hidden transition-all duration-100">
                <div className="w-full h-full p-2 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`grid gap-4 w-full h-full ${getGridClass(
                        visible.length
                      )}`}
                    >
                      {visible.map((id: string) => (
                        <motion.div
                          key={id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full"
                        >
                          <ParticipantTile participantId={id} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {showWelcome && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute left-6 bottom-24 z-50 w-80 bg-white rounded-xl p-6 shadow-2xl text-gray-800"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium">
                          Cuộc họp đã sẵn sàng
                        </h3>
                        <button onClick={() => setShowWelcome(false)}>
                          <X size={20} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Chia sẻ đường liên kết này với những người bạn muốn tham
                        gia
                      </p>

                      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border">
                        <span className="text-xs truncate mr-2">
                          {window.location.href}
                        </span>
                        <button onClick={handleCopy} className="text-blue-600">
                          <Copy size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto">
                  <MeetingControls
                    onLeaveMeeting={onLeaveMeeting}
                    onToggleChat={toggleChatPanel}
                    isChatOpen={onChatOpen}
                    isOpen={isParticipantOpen}
                    onOpenParticipant={toggleParticipantPanel}
                  />
                </div>
                {totalPages > 1 && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 scale-90">
                    <Pagination>
                      <PaginationContent className="bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2">
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1)
                                setCurrentPage(currentPage - 1);
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          ></PaginationPrevious>
                        </PaginationItem>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              className={
                                page === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-gray-700"
                              }
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages)
                                setCurrentPage(currentPage + 1);
                            }}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          ></PaginationNext>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
              <AnimatePresence mode="wait">
                {onChatOpen && (
                  <ChatPanel
                    isOpen={onChatOpen}
                    onClose={onToggleChat}
                    roomId={roomId}
                    participantName={user!.displayName}
                    participantId={user!.id}
                  />
                )}
                {isParticipantOpen && (
                  <ParticipantPanel
                    joinedRequest={joinedRequest}
                    setJoinRequests={setJoinRequests}
                    onClose={() => setIsParticipantOpen(false)}
                  />
                )}
              </AnimatePresence>
            </main>
          </>
        )}
        {joined === "JOINING" && <LoadMeeting />}
      </div>
    );
  }
);

export default MeetingRoom;
