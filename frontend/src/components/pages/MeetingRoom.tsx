import { useEffect, useRef, useState } from "react";
import { createCameraVideoTrack, useMeeting } from "@videosdk.live/react-sdk";
import { ParticipantTile } from "./common/meetings/ParticipantTitle";
import { MeetingControls } from "./common/meetings/MeetingControls";
import { MeetingHeader } from "./common/meetings/MeetingHeader";
import { useMeetingPagination } from "../../hooks/useMeetingPagination";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./common/meetings/ChatPanel";
import { ParticipantPanel } from "./common/meetings/ParticipantPanel";
import { BackgroundPanel } from "./common/meetings/BackgroundPanel";
import { VirtualBackgroundProcessor } from "@videosdk.live/videosdk-media-processor-web";
// Import Shadcn Pagination nếu bạn đã cài
import { Copy, X, MonitorPlay, UserPlus, Settings } from "lucide-react";
import { toast } from "sonner";
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
import InviteModal from "./common/meetings/InviteModal";
import { updateMeetingSettings } from "@/services/socket";
import { SettingsPanel } from "./common/meetings/SettingPanel";
interface MeetingRoomProps {
  roomId: string;
  isHost: boolean;
  onLeaveMeeting: () => void;
  onToggleChat: () => void;
  onChatOpen: boolean;
  hostId: string;
}
export function MeetingRoom({
  roomId,
  isHost,
  onLeaveMeeting,
  onChatOpen,
  onToggleChat,
  hostId,
}: MeetingRoomProps) {
  console.log("Host id là: ", hostId);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isParticipantOpen, setIsParticipantOpen] = useState(false);
  const [joined, setJoined] = useState<"JOINING" | "JOINED">("JOINING");
  const [joinedRequest, setJoinRequests] = useState<any[]>([]);
  // triển khai thêm state để bật chế độ hình trong hình
  const [isPipActive, setIsPipActive] = useState(false);
  const pipWinDowRef = useRef<HTMLVideoElement | null>(null);

  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);

  const [bgConfig, setBgConfig] = useState<{
    type: "none" | "blur" | "image";
    url?: string;
  }>({ type: "none" });
  const processorRef = useRef<VirtualBackgroundProcessor | null>(null);
  // thêm 2 method để nhận biết có người vào, người ra
  // ===================================== CÁC SỰ KIỆN TRONG PHÒNG ==========================================\\
  const {
    participants,
    join,
    localParticipant,
    meetingId,
    presenterId,
    muteMic,
    disableWebcam,
    changeWebcam
  } = useMeeting({
    // ======================================== ĐĂNG KÝ CÁC EVENT LISTENER =============================== \\
    // duyệt người vào phòng - chức năng của host
    onEntryRequested: (data) => {
      // =================================== HOST DUYỆT/TỪ CHỐI GUEST ================================\\
      const { participantId, name, allow, deny } = data;
      // hiển thị thông báo duyệt

      setJoinRequests((prev) => [...prev, data]);
      toast.custom(
        (t) => (
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 text-white min-w-[300px]">
            <div className="flex-1">
              <p className="font-bold">{name}</p>
              <p className="text-xs text-gray-400">Muốn tham gia cuộc họp</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  allow(); // Duyệt qua SDK
                  console.log("Chấp nhận vào rrooom");
                  setJoinRequests((prev) =>
                    prev.filter((req) => req.participantId !== participantId)
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
                  console.log("Đang gửi lệnh từ chối cho:", participantId);
                  setJoinRequests((prev) =>
                    prev.filter((req) => req.participantId !== participantId)
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
        { duration: 3000, position: "top-center" }
      );
    },
    // bắt gói trả về
    onEntryResponded: (...args: any[]) => {
      const decision = args[1];
      console.log("Phản hồi nhận được là: ", decision);
      if (decision === "denied") {
        toast.error("Yêu cầu tham gia cuộc họp bị từ chối");
        onLeaveMeeting();
      }
    },
    // ============================= JOINED THÀNH CÔNG =============================\\
    onMeetingJoined: () => {
      setJoined("JOINED");
      setTimeout(() => setShowWelcome(true), 100);
    },

    onError: (error) => {
      console.error("❌ Lỗi SDK:", error);
      toast.error(`Mã lỗi: ${error.code} | Nội dung: ${error.message}`);
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
    // ============================= RỜI ĐI =============================\\
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
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết cuộc họp");
  };

  useEffect(() => {
    setJoined("JOINING");
    const timer = setTimeout(() => {
      join();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const { user } = useAuth();
  const participantIds = Array.from(participants.keys());
  const { visible, currentPage, setCurrentPage, totalPages } =
    useMeetingPagination(participantIds, 4);
  // ==================================== XỬ LÍ CHO PARTICIPANT VÀ CHAT ============================\\
  const toggleParticipantPanel = () => {
    setIsParticipantOpen(!isParticipantOpen);
    if (onChatOpen) onToggleChat(); // đóng nếu chat mở
  };
  const toggleChatPanel = () => {
    onToggleChat();
    if (isParticipantOpen) setIsParticipantOpen(!isParticipantOpen);
  };
  const toggleBackgroundPanel = () => {
    setIsBackgroundOpen(!isBackgroundOpen);
    if (onChatOpen) onToggleChat();
    if (isParticipantOpen) setIsParticipantOpen(false);
  };

  useEffect(() => {
    const initProcessor = async () => {
      if (joined === "JOINED" && !processorRef.current) {
        const processor = new VirtualBackgroundProcessor();
        await processor.init();
        processorRef.current = processor;
        console.log("✅ Processor Ready");
      }
    };

    initProcessor();

    return () => {
      if (processorRef.current) {
        processorRef.current.stop();
        processorRef.current = null;
      }
    };
  }, [joined]);

  // 2. Logic điều khiển Background
  useEffect(() => {
    const updateBackground = async () => {
      if (!localParticipant || !processorRef.current || joined !== "JOINED")
        return;

      try {
        if (bgConfig.type === "none") {
          // TẮT: Dừng processor và trả về track gốc
          processorRef.current.stop();
          const stream = await createCameraVideoTrack({
            optimizationMode: "motion",
            encoderConfig: "h1080p_w1920p",
          });
          changeWebcam(stream);
        } else {
          // BẬT hoặc CẬP NHẬT
          const config = {
            type: bgConfig.type,
            imageUrl: bgConfig.url,
          };

          // Quan trọng: Nếu processor đang chạy, chỉ cần updateConfig để mượt hơn
          // Nếu chưa chạy (vừa bật từ none), thì mới gọi start()
          processorRef.current.stop();
          const stream = await createCameraVideoTrack({
            optimizationMode: "motion",
            encoderConfig: "h1080p_w1920p",
          });
          const processedStream = await processorRef.current.start(
            stream,
            config
          );
          changeWebcam(processedStream);
          // await processorRef.current.updateProcessorConfig(config);
        }
      } catch (error) {
        console.error("❌ BG Error:", error);
      }
    };

    updateBackground();
  }, [bgConfig, localParticipant, joined]);
  const handleSelectBackground = (
    type: "none" | "blur" | "image",
    imageUrl?: string
  ) => {
    console.log("Selected background:", type, imageUrl);
    setBgConfig({ type, url: imageUrl });
    setIsBackgroundOpen(false);
  };
  // ====================================== HÌNH TRONG HÌNH ===============================\\
  const togglePipMode = async () => {
    console.log("Toggle PiP");

    // Nếu đang PiP thì thoát
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return;
    }

    // Kiểm tra hỗ trợ
    if (!("pictureInPictureEnabled" in document)) {
      toast.error("Trình duyệt của bạn không hỗ trợ PiP");
      return;
    }

    try {
      // ===== 1. Tạo canvas =====
      const source = document.createElement("canvas");
      source.width = 568;
      source.height = 320;
      const ctx = source.getContext("2d");
      if (!ctx) return;

      // ===== 2. Tạo video cầu nối PiP =====
      const pipVideo = document.createElement("video");
      pipVideo.autoplay = true;
      pipVideo.muted = true;
      pipVideo.playsInline = true;
      pipVideo.srcObject = source.captureStream(30);

      pipWinDowRef.current = pipVideo;

      // ===== 3. Vẽ frame đầu tiên (QUAN TRỌNG) =====
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, source.width, source.height);

      // ===== 4. Hàm vẽ canvas liên tục =====
      const drawCanvas = () => {
        if (!ctx) return;

        // Lấy video KHÔNG bao gồm pipVideo
        const videos = Array.from(document.querySelectorAll("video")).filter(
          (v) => v !== pipVideo && v.readyState >= 2
        );

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, source.width, source.height);

        const count = Math.min(videos.length, 4);
        const rows = count > 2 ? 2 : 1;
        const cols = count > 1 ? 2 : 1;

        videos.slice(0, 4).forEach((v, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;

          ctx.drawImage(
            v,
            c * (source.width / cols),
            r * (source.height / rows),
            source.width / cols,
            source.height / rows
          );
        });

        if (document.pictureInPictureElement) {
          requestAnimationFrame(drawCanvas);
        }
      };

      // ===== 5. Event PiP =====
      pipVideo.addEventListener("enterpictureinpicture", () => {
        console.log("Entered PiP");
        setIsPipActive(true);
        requestAnimationFrame(drawCanvas);
      });

      pipVideo.addEventListener("leavepictureinpicture", () => {
        console.log("Left PiP");
        setIsPipActive(false);
        pipWinDowRef.current = null;
      });

      // ===== 6. Play + request PiP (SAU KHI CÓ FRAME) =====
      await pipVideo.play();

      // delay 1 tick để browser render frame canvas
      setTimeout(async () => {
        try {
          await pipVideo.requestPictureInPicture();
        } catch (e) {
          console.error("requestPictureInPicture failed", e);
        }
      }, 100);
    } catch (err) {
      console.error("PiP Error:", err);
    }
  };
  // ======================================= BỐ CỤC KHI CÓ NG SHARE ===========================\\
  const isSomeOneShare = presenterId !== null;
  const sideBarParticipants = participantIds.filter((id) => id !== presenterId);
  // ======================================= BỐ CỤC TRONG PHÒNG HỌP =========================\\
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
  // ====================================== MỜI NGƯỜI KHÁC VÀO PHÒNG QUA EMAIL =========================//
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInViteModalOpen, setIsInviteModalOpen] = useState(false);
  // ======================================= XỬ LÍ SETTINGS ========================================\\
  const [roomSettings, setRoomSettings] = useState({
    allowMic: true,
    allowWebcam: true,
    allowChat: true,
  });
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const handleToggleSettings = () => {
    setIsSettingOpen(!isSettingOpen);
    if (onChatOpen) onToggleChat();
    if (isParticipantOpen) setIsParticipantOpen(false);
  };
  console.log("ID người tgia là", user?.id);
  // cặp {key,value} để khỏi viết cho ba nút -> gộp lại thành một nút
  const onUpdateSettings = (key: string, value: boolean) => {
    if (!isHost) return;
    const newSettings = { ...roomSettings, [key]: value };
    updateMeetingSettings(roomId, user?.id!, newSettings);
    setRoomSettings(newSettings);
  };
  /* Sự kiện lắng nghe Socket khi BE hoàn thành */
  // useEffect(() => {
  //   if (!socket) return;

  //   // Lắng nghe sự kiện cài đặt từ BE
  //   socket.on("meeting:settings_updated", (newSettings: any) => {
  //     setRoomSettings(newSettings);

  //     // THỰC THI QUA VIDEOSDK:
  //     // Nếu Host tắt quyền Mic, tự động tắt Mic của chính mình
  //     if (newSettings.allowMic === false) {
  //       muteMic();
  //       toast.warning("Host đã tắt Micro của toàn phòng");
  //     }

  //     // Nếu Host tắt quyền Camera, tự động tắt Camera của chính mình
  //     if (newSettings.allowWebcam === false) {
  //       disableWebcam();
  //       toast.warning("Host đã tắt Camera của toàn phòng");
  //     }
  //   });

  //   return () => {
  //     socket.off("meeting:settings_updated");
  //   };
  // }, [muteMic, disableWebcam]);
  //=========================================== RETURN =========================================
  return (
    <div className="bg-gray-950 h-screen w-screen flex flex-col overflow-hidden text-white">
      {/* Header */}
      <MeetingHeader roomId={roomId} onLeave={onLeaveMeeting} />
      {/* Màn hình khi JOINED thành công */}
      {joined === "JOINED" && (
        <>
          <main className="flex-1 flex flex-row overflow-hidden relative">
            {/* Bọc thêm AnimatePresence với mode="wait" để tạo hiệu ứng chuyển trang mượt mà */}
            <div className="flex-1 flex relative flex-col justify-center items-center p-4 overflow-hidden transition-all duration-100">
              <AnimatePresence mode="wait">
                {/* HÌNH TRONG HÌNH */}
                {isPipActive ? (
                  <motion.div
                    key="pip-placeholder"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center text-center space-y-6"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                      <div className="relative p-10 bg-gray-900 rounded-full border border-gray-800">
                        <MonitorPlay size={64} className="text-blue-500" />
                      </div>
                    </div>

                    <div className="max-w-md space-y-2">
                      <h2 className="text-2xl font-bold">
                        Cuộc gọi hiện đang ở một cửa sổ khác
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Bạn có thể tiếp tục họp trong khi làm việc khác. Màn
                        hình này sẽ tự động quay lại khi bạn đóng cửa sổ nhỏ.
                      </p>
                    </div>

                    <button
                      onClick={() => document.exitPictureInPicture()}
                      className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                      Đưa cuộc gọi về lại đây
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={isSomeOneShare ? "presenting" : "grid"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full p-2 overflow-hidden flex flex-col"
                  >
                    {isSomeOneShare ? (
                      // Bố cục khi có người share màn hình
                      <div className="flex flex-1 flex-row w-full h-full gap-4 overflow-hidden">
                        {/* Vùng hiển thị screen */}
                        <div className="flex-[3] lg:flex-[4] relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5">
                          {presenterId && (
                            <ParticipantTile participantId={presenterId} />
                          )}
                        </div>
                        {/* Vùng hiển thị những người khác */}
                        <div className="flex-1 overflow-y-auto pr-1 min-w-[200px] max-w-[320px] scrollbar-hide grid grid-cols-1 conten-start">
                          {participantIds.map((id) => (
                            <div
                              key={id}
                              className="aspect-video w-full shrink-0"
                            >
                              <ParticipantTile participantId={id} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Bố cục khi ko có share
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
                              {/* SCREEN SHARE */}
                              <ParticipantTile participantId={id} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {/* SHOW PHẦN CHỜ (THÊM PHẦN MỜI NGƯỜI KHÁC NỮA) */}
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
                    <InviteModal
                      open={isInViteModalOpen}
                      onOpenChange={setIsInviteModalOpen}
                      roomId={meetingId}
                      currentUserId={user?.id}
                    />
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-all mb-4"
                    >
                      <UserPlus size={20} />
                      <span>Thêm người khác</span>
                    </button>
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
              {/* THANH MEETING CONTROL (NÊN THÊM HIỆU ỨNG RÊ CHUỘT VÀO THÌ HIỆN) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto">
                <MeetingControls
                  onLeaveMeeting={onLeaveMeeting}
                  onToggleChat={toggleChatPanel}
                  isChatOpen={onChatOpen}
                  isOpen={isParticipantOpen}
                  onOpenParticipant={toggleParticipantPanel}
                  onTogglePip={togglePipMode}
                  isPipActive={isPipActive}
                  isHost={isHost}
                  isBackgroundOpen={isBackgroundOpen}
                  onToggleBackground={toggleBackgroundPanel}
                  isSettingOpen={isSettingOpen}
                  onOpenSettings={handleToggleSettings}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
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
                        )
                      )}

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
                  avatar={user?.avatar || ""}
                />
              )}
              {isParticipantOpen && (
                <ParticipantPanel
                  joinedRequest={joinedRequest}
                  setJoinRequests={setJoinRequests}
                  onClose={() => setIsParticipantOpen(false)}
                  hostId={hostId}
                />
              )}

              {isSettingOpen && isHost && (
                <SettingsPanel
                  isOpen={isSettingOpen}
                  onClose={() => setIsSettingOpen(false)}
                  roomSettings={roomSettings}
                  onUpdateSettings={onUpdateSettings}
                />
              )}
              {isBackgroundOpen && (
                  <BackgroundPanel
                    isOpen={isBackgroundOpen}
                    onClose={() => setIsBackgroundOpen(false)}
                    onSelectBackground={handleSelectBackground}
                  />
                )}
            </AnimatePresence>
          </main>
        </>
      )}
      {/* TRONG QUÁ TÌNH JOIN VÀO PHÒNG */}
      {joined === "JOINING" && <LoadMeeting />}
    </div>
  );
}

export default MeetingRoom;
