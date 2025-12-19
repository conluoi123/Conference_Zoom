import { useRef, useEffect } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { ParticipantTile } from "./common/meetings/ParticipantTile";
import { MeetingControls } from "./common/meetings/MeetingControls";
import { MeetingHeader } from "./common/meetings/MeetingHeader";
import {useMeetingPagination}  from "../../hooks/useMeetingPagination";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./common/ChatPanel";
// Import Shadcn Pagination nếu bạn đã cài
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { useAuth } from "@/context/AuthContext";
interface MeetingRoomProps {
  roomId: string;
  onLeaveMeeting: () => void;
  onToggleChat: () => void;
  onChatOpen: boolean;
}

export function MeetingRoom({ roomId, onLeaveMeeting, onChatOpen, onToggleChat }: MeetingRoomProps) {
  
  // 1. Lấy dữ liệu thô từ VideoSDK
  const { participants, join, leave } = useMeeting({
    onMeetingJoined: () => console.log("Joined"),
    onMeetingLeft: () => onLeaveMeeting(),
    onError: (data) => {
    // Nếu hiện lỗi "Token expired" hoặc "Participant limit reached" thì là đây!
    console.error("LỖI SDK THỰC TẾ:", data.message, data.code);
  },
  });
  console.log("Có cái dái", participants)
  const joinedCall = useRef(false);
  
  // chạy một lần khi trang load
  useEffect(()=> {
    if(joinedCall.current === false){
      join();
      joinedCall.current = true
      console.log("Join phòng thành công \n");
    }
    

  }, [join]); 
  const {user} = useAuth();
  const participantIds = Array.from(participants.keys());

  const { visible, currentPage, setCurrentPage, totalPages } = 
    useMeetingPagination(participantIds, 4);

  const hiddenCount = participantIds.length - visible.length;

  const getGridClass = (count: number) => {
  if (count === 0) return "";
  
  // 1 người: Toàn màn hình
  if (count === 1) return "grid-cols-1 grid-rows-1";
  
  // 2 người: Chia đôi dọc hoặc ngang (tùy màn hình, thường là 2 cột trên PC)
  if (count === 2) return "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1";
  
  // 3-4 người: Chia 2x2
  if (count <= 4) return "grid-cols-2 grid-rows-2";
  
  // 5-6 người: Chia 3 cột x 2 hàng
  if (count <= 6) return "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";
  
  // 7-9 người: Chia 3x3
  return "grid-cols-3 grid-rows-3";
  };
  console.log("List: ", participantIds);
  console.log("Visible: ", visible);
  console.log("Số lượng người thực tế trong kho SDK:", participants.size);
  const { meetingId } = useMeeting();
  console.log("ID phòng thực tế SDK đang dùng:", meetingId);
  
  return (
    <div className="bg-gray-950 h-screen w-screen flex flex-col overflow-hidden text-white">
      <MeetingHeader roomId={roomId} onLeave={onLeaveMeeting} />
      <main className="flex-1 p-4 relative overflow-hidden flex items-center justify-center">
        {/* Bọc thêm AnimatePresence với mode="wait" để tạo hiệu ứng chuyển trang mượt mà */}
        <div className="w-full h-full p-2 overflow-hidden">
          <AnimatePresence mode="wait">
          <motion.div
            key={currentPage} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`grid gap-4 w-full h-full ${getGridClass(visible.length)}`}
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto">
          <MeetingControls 
            onLeaveMeeting={onLeaveMeeting}
            onToggleChat={onToggleChat}
            isChatOpen={onChatOpen}
          />
        </div>
        {totalPages > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 scale-90">
            <Pagination>
            <PaginationContent className="bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2">
              <PaginationItem>
                <PaginationPrevious 
                href="#"
                onClick={(e)=>{
                  e.preventDefault();
                  if(currentPage > 1) setCurrentPage(currentPage-1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                > 
                </PaginationPrevious>
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    className={page === currentPage ? "bg-blue-600 text-white" : "hover:bg-gray-700"}
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
                    if(currentPage < totalPages) setCurrentPage(currentPage+1);
                  }}
                  className = {currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        
          </div>
        )}     
      </main>
      <ChatPanel
        isOpen={onChatOpen}
        onClose={onToggleChat}
        roomId={roomId}
        userName={user?.displayName || "Guest"}
        userId={user?.id || ""}
        />
      {/* Shadcn Sheet/Dialog cho Chat sẽ được đặt ở đây */}
    </div>
  );
}

export default MeetingRoom;