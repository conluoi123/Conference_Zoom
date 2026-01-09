import { useEffect, useRef, useState, useCallback } from "react";
import {
  createCameraVideoTrack,
  Constants,
  useTranscription,
  useMeeting,
} from "@videosdk.live/react-sdk";
import { ParticipantTile } from "./common/meetings/ParticipantTitle";
import { MeetingControls } from "./common/meetings/MeetingControls";
import { MeetingHeader } from "./common/meetings/MeetingHeader";
import { useMeetingPagination } from "../../hooks/useMeetingPagination";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./common/meetings/ChatPanel";
import { ParticipantPanel } from "./common/meetings/ParticipantPanel";
import { BackgroundPanel } from "./common/meetings/BackgroundPanel";
import { SubtitleBar } from "./common/meetings/SubtitleBar";
import { VirtualBackgroundProcessor } from "@videosdk.live/videosdk-media-processor-web";
// Import Shadcn Pagination nếu bạn đã cài
import { Copy, X, MonitorPlay, UserPlus } from "lucide-react";
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
import { SettingsPanel } from "./common/meetings/SettingPanel";
import { socketService } from "@/services/socket";
import api from "@/services/service";
interface MeetingRoomProps {
  roomId: string;
  isHost: boolean;
  onLeaveMeeting: () => void;
  hostId: string;
}
export function MeetingRoom({
  roomId,
  isHost,
  onLeaveMeeting,
  hostId,
}: MeetingRoomProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantOpen, setIsParticipantOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const [joined, setJoined] = useState<"JOINING" | "JOINED">("JOINING");
  const [joinedRequest, setJoinRequests] = useState<any[]>([]);
  // triển khai thêm state để bật chế độ hình trong hình
  const [isPipActive, setIsPipActive] = useState(false);
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
    activeSpeakerId,
    muteMic,
    disableWebcam,
    changeWebcam,
    startRecording,
    stopRecording,
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
    // JOINED THÀNH CÔNG THÊM MỘT effect để báo lên server

    // ============================= RỜI ĐI =============================\\
    onParticipantLeft: (participant) => {
      toast.error(`${participant.displayName} đã rời đi`, {
        duration: 3000,
      });
    },
    onRecordingStarted: async () => {
      console.log("🔴 Ghi hình đã bắt đầu");
      setIsRecording(true);

      try {
        console.log("📊 Meeting info:", { meetingId, roomId });

        // Sử dụng roomId làm sessionId (chúng giống nhau)
        const sessionId = meetingId || roomId;

        if (!sessionId) {
          console.error("❌ sessionId is undefined!");
          toast.error("Lỗi: Không có sessionId");
          return;
        }

        // Gọi API để lưu recording vào database
        await api.post("/rooms/recordings/start", {
          sessionId: sessionId,
          roomId: roomId,
        });

        console.log("✅ Recording saved to database");
        toast.success("Đã bắt đầu ghi hình");
      } catch (error: any) {
        console.error("Failed to save recording:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error status:", error.response?.status);
        toast.error(`Lỗi: ${error.response?.data?.error || error.message}`);
      }
    },
    onRecordingStopped: () => {
      console.log("⏹️ Ghi hình đã dừng");
      setIsRecording(false);
    },
  });
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết cuộc họp");
  };

  //Tham gia phòng
  const handleJoin = () => {
    const timer = setTimeout(() => {
      join();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  };

  useEffect(() => {
    if (meetingId === undefined) handleJoin();
  }, [meetingId]);

  const { user } = useAuth();

  // Join socket room when meeting is joined
  useEffect(() => {
    if (joined === "JOINED" && user?.displayName && socketService.isConnected()) {
      console.log(`🚪 Joining socket room: ${roomId}`);
      socketService.joinMeetingRoom(roomId, user.displayName);

      return () => {
        console.log(`🚪 Leaving socket room: ${roomId}`);
        socketService.leaveMeetingRoom(roomId, user.displayName);
      };
    }
  }, [joined, roomId, user?.displayName]);

  const participantIds = Array.from(participants.keys());
  const { visible, currentPage, setCurrentPage, totalPages } =
    useMeetingPagination(participantIds, 4);
  // ==================================== XỬ LÍ CHO PARTICIPANT VÀ CHAT ============================\\
  const onToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleParticipantPanel = () => {
    const nextState = !isParticipantOpen;
    setIsParticipantOpen(nextState);
    if (nextState) {
      if (isChatOpen) setIsChatOpen(false);
      if (isSettingOpen) setIsSettingOpen(false);
      if (isBackgroundOpen) setIsBackgroundOpen(false);
    }
  };
  // const toggleChatPanel = () => {
  //   onToggleChat();
  //   if (isParticipantOpen) setIsParticipantOpen(!isParticipantOpen);
  // };
  // 1. Memoize hàm toggle chat
  const toggleChatPanel = useCallback(() => {
    const nextState = !isChatOpen;
    setIsChatOpen(nextState);
    if (nextState) {
      if (isParticipantOpen) setIsParticipantOpen(false);
      if (isSettingOpen) setIsSettingOpen(false);
      if (isBackgroundOpen) setIsBackgroundOpen(false);
    }
  }, [isChatOpen, isParticipantOpen, isSettingOpen, isBackgroundOpen]);

  // 2. Tương tự cho hàm đóng chat (nếu cần truyền riêng)
  //======================================Virtual background========================================
  const toggleBackgroundPanel = () => {
    const nextState = !isBackgroundOpen;
    setIsBackgroundOpen(nextState);
    if (nextState) {
      if (isChatOpen) setIsChatOpen(false);
      if (isParticipantOpen) setIsParticipantOpen(false);
      if (isSettingOpen) setIsSettingOpen(false);
    }
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

  //==================================Recording=======================================
  const [isRecording, setIsRecording] = useState(false);
  const handleRecording = () => {
    console.log("Recording click");
    if (isRecording) {
      stopRecording();
      return;
    }
    try {
      const config = {
        // Layout Configuration
        layout: {
          type: "GRID", // "SPOTLIGHT" | "SIDEBAR",  Default : "GRID"
          priority: "SPEAKER", // "PIN", Default : "SPEAKER"
          gridSize: 4, // MAX : 4
        },

        // Theme of recording
        theme: "DARK", //  "LIGHT" | "DEFAULT"

        // `mode` is used to either record video & audio both or only audio.
        mode: "video-and-audio", // "audio", Default : "video-and-audio"

        // Quality of recording and is only applicable to `video-and-audio` type mode.
        quality: "high" /* Default : "med"
      "low" (SD Recording) | "med" (HD Recording) | "high" (FHD Recording) */,

        // This mode refers to orientation of recording.
        // landscape : Record the meeting in horizontally
        // portrait : Record the meeting in vertically (Best for mobile view)
        orientation: "landscape", // "portrait",  Default : "landscape"
      } as const;

      // Post Transcription Configuration
      const transcription = {
        enabled: true, // Enables post transcription
        language: "vi-VN",
      };

      // Webhook Configuration (Auto-sent to this URL when recording stops)
      // NOTE: Replace with your actual ngrok URL
      const webhookUrl = import.meta.env.VITE_API_URL;
      // const webhookUrl = "https://eudaemonistically-metallographical-kasha.ngrok-free.dev";

      startRecording(webhookUrl, undefined, config, transcription);
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Có lỗi khi ghi hình");
    }
  };

  //==================================Transcript=======================================
  const [isTranscripting, setIsTranscripting] = useState(false);
  // Configuration for realtime transcription
  const config = {
    summary: {
      enabled: false,
    },
  };

  // Callback function for transcription state change event
  function onTranscriptionStateChanged(data: any) {
    const { status, id } = data;

    if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTING) {
      console.log("Realtime Transcription is starting", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTED) {
      console.log("Realtime Transcription is started", id);
    } else if (
      status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPING
    ) {
      console.log("Realtime Transcription is stopping", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPED) {
      console.log("Realtime Transcription is stopped", id);
    }
  }

  // Callback function for transcription text event
  function onTranscriptionText(data: any) {
    let { participantId, participantName, text, timestamp, isFinal } = data;
    console.log(`${participantName}: ${text}`);

    const subtitleId = `${participantId}-${Date.now()}`;

    setSubtitles((prev) => {
      // Tìm subtitle của người này
      const filtered = prev.filter((s) => s.participantId !== participantId);

      // Thêm subtitle mới
      return [
        ...filtered,
        {
          id: subtitleId,
          participantId,
          participantName,
          text,
        },
      ];
    });

    // Tự động xóa subtitle của người này khi nói xong
    setTimeout(() => {
      setSubtitles((prev) =>
        prev.filter((s) => s.participantId !== participantId)
      );
    }, 3000);
  }

  // Passing callback functions to useTranscription hook
  const { startTranscription, stopTranscription } = useTranscription({
    onTranscriptionStateChanged,
    onTranscriptionText,
  });
  // Init streawm transcript
  startTranscription(config);

  const handleTranscript = () => {
    if (!isTranscripting) {
      // startTranscription(config);
      setIsTranscripting(true);
    } else {
      // stopTranscription(config);
      setIsTranscripting(false);
    }
  };

  //======================================= Subtitle ======================================
  const [subtitles, setSubtitles] = useState<
    {
      id: string;
      participantId: string;
      participantName: string;
      text: string;
    }[]
  >([]);

  // ====================================== HÌNH TRONG HÌNH ===============================\\
  const togglePipMode = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return;
    }

    if (!("pictureInPictureEnabled" in document)) {
      toast.error("Trình duyệt của bạn không hỗ trợ PiP");
      return;
    }

    try {
      const source = document.createElement("canvas");
      source.width = 640;
      source.height = 360;
      const ctx = source.getContext("2d");
      if (!ctx) return;

      const pipVideo = document.createElement("video");
      pipVideo.autoplay = true;
      pipVideo.muted = true;
      pipVideo.playsInline = true;
      pipVideo.srcObject = source.captureStream(30);

      const drawCanvas = () => {
        if (!ctx) return;
        if (!document.pictureInPictureElement && !pipVideo.paused) {
          // Nếu chưa vào PiP mà video đang play thì vẫn cho vẽ 1 lần để có frame mồi
        } else if (!document.pictureInPictureElement) {
          return;
        }

        // Clear background
        ctx.fillStyle = "#111827"; // bg-gray-900
        ctx.fillRect(0, 0, source.width, source.height);

        // Get participants to show (same as current grid)
        const participantsToShow = visible.length > 0 ? visible : [localParticipant?.id].filter(Boolean);
        const count = participantsToShow.length;

        const rows = count > 2 ? 2 : 1;
        const cols = count > 1 ? 2 : 1;
        const cellW = source.width / cols;
        const cellH = source.height / rows;

        participantsToShow.forEach((pId, i) => {
          const participant = participants.get(pId as string) || (pId === localParticipant?.id ? localParticipant : null);
          if (!participant) return;

          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = c * cellW;
          const y = r * cellH;

          // Draw Border for active speaker
          if (pId === activeSpeakerId) {
            ctx.strokeStyle = "#22c55e"; // green-500
            ctx.lineWidth = 4;
            ctx.strokeRect(x + 5, y + 5, cellW - 10, cellH - 10);
          }

          // Try to find video element (prioritize screenshare)
          let videoElement = document.querySelector(`video[data-participant-id="${pId}"][data-type="screenshare"]`) as HTMLVideoElement;
          let isScreenShare = !!videoElement;

          if (!videoElement) {
            videoElement = document.querySelector(`video[data-participant-id="${pId}"][data-type="webcam"]`) as HTMLVideoElement;
          }

          if (videoElement && (participant.webcamOn || isScreenShare) && videoElement.readyState >= 2) {
            // Draw Video
            ctx.save();
            // Mirror local participant ONLY for webcam
            if (pId === localParticipant?.id && !isScreenShare) {
              ctx.translate(x + cellW, y);
              ctx.scale(-1, 1);
              ctx.drawImage(videoElement, 0, 0, cellW, cellH);
            } else {
              // Fit keeping aspect ratio for screen share
              if (isScreenShare) {
                const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
                const cellAspect = cellW / cellH;
                let drawW = cellW;
                let drawH = cellH;
                let drawX = x;
                let drawY = y;

                if (videoAspect > cellAspect) {
                  drawH = cellW / videoAspect;
                  drawY = y + (cellH - drawH) / 2;
                } else {
                  drawW = cellH * videoAspect;
                  drawX = x + (cellW - drawW) / 2;
                }
                ctx.drawImage(videoElement, drawX, drawY, drawW, drawH);
              } else {
                ctx.drawImage(videoElement, x, y, cellW, cellH);
              }
            }
            ctx.restore();
          } else {
            // Draw Avatar Fallback
            const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            const colorIdx = Math.abs(pId.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) % colors.length;

            ctx.fillStyle = colors[colorIdx];
            ctx.beginPath();
            const centerX = x + cellW / 2;
            const centerY = y + cellH / 2;
            const radius = Math.min(cellW, cellH) / 4;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Initials
            ctx.fillStyle = "white";
            ctx.font = `bold ${radius}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(participant.displayName.charAt(0).toUpperCase(), centerX, centerY);
          }

          // Draw Name Label
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(x + 10, y + cellH - 30, ctx.measureText(participant.displayName).width + 20, 20);
          ctx.fillStyle = "white";
          ctx.font = "12px Sans-Serif";
          ctx.textAlign = "left";
          ctx.fillText(participant.displayName, x + 20, y + cellH - 15);
        });

        requestAnimationFrame(drawCanvas);
      };

      pipVideo.addEventListener("enterpictureinpicture", () => {
        setIsPipActive(true);
        requestAnimationFrame(drawCanvas);
      });

      pipVideo.addEventListener("leavepictureinpicture", () => {
        setIsPipActive(false);
      });

      await pipVideo.play();
      await pipVideo.requestPictureInPicture();
    } catch (err) {
      console.error("PiP Error:", err);
      toast.error("Không thể mở Hình trong hình");
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
  const handleToggleSettings = () => {
    const nextState = !isSettingOpen;
    setIsSettingOpen(nextState);
    if (nextState) {
      if (isChatOpen) setIsChatOpen(false);
      if (isParticipantOpen) setIsParticipantOpen(false);
      if (isBackgroundOpen) setIsBackgroundOpen(false);
    }
  };
  // cặp {key,value} để khỏi viết cho ba nút -> gộp lại thành một nút
  const onUpdateSettings = (key: string, value: boolean) => {
    if (!isHost) return;
    const newSettings = { ...roomSettings, [key]: value };
    socketService.updateMeetingSettings(roomId, user?.id!, newSettings);
    setRoomSettings(newSettings);
  };

  // Listen for settings updates from host
  useEffect(() => {
    const handleSettingsUpdate = (newSettings: any) => {
      console.log("📢 Received settings update:", newSettings);
      setRoomSettings(newSettings);

      // Only enforce for non-host participants
      if (isHost) return;

      // Auto-disable mic if host turned it off
      if (newSettings.allowMic === false && localParticipant?.micOn) {
        muteMic();
        toast.warning("Host đã tắt Micro của toàn phòng");
      }

      // Auto-disable camera if host turned it off
      if (newSettings.allowWebcam === false && localParticipant?.webcamOn) {
        disableWebcam();
        toast.warning("Host đã tắt Camera của toàn phòng");
      }

      // Notify about chat restriction
      if (newSettings.allowChat === false) {
        toast.warning("Host đã tắt Chat của toàn phòng");
      }
    };

    socketService.onMeetingSettingsUpdated(handleSettingsUpdate);

    return () => {
      socketService.offMeetingEvents();
    };
  }, [muteMic, disableWebcam, localParticipant, isHost]);
  //=========================================== RETURN =========================================
  return (
    <div className="bg-gray-900 h-screen w-screen flex flex-col overflow-hidden text-white">
      {/* Header */}
      <MeetingHeader roomId={roomId} onLeave={onLeaveMeeting} isRecording={isRecording} />
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
              {/* Thanh subtitle */}
              {subtitles.length > 0 && isTranscripting && (
                <SubtitleBar subtitles={subtitles} />
              )}
              {/* THANH MEETING CONTROL - Mac Dock Effect */}
              <div className="fixed bottom-0 left-0 right-0 h-24 flex justify-center items-end pb-6 z-50 group transition-all duration-300">
                {/* Hover trigger area with subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent group-hover:from-black/40 transition-all duration-300 pointer-events-none" />

                {/* Control Bar Container */}
                <div className="transform translate-y-10 opacity-0 scale-95 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out cubic-bezier(0.4, 0, 0.2, 1)">
                  <MeetingControls
                    onLeaveMeeting={onLeaveMeeting}
                    onToggleChat={toggleChatPanel}
                    isChatOpen={isChatOpen}
                    isOpen={isParticipantOpen}
                    onOpenParticipant={toggleParticipantPanel}
                    onTogglePip={togglePipMode}
                    isPipActive={isPipActive}
                    isHost={isHost}
                    isBackgroundOpen={isBackgroundOpen}
                    onToggleBackground={toggleBackgroundPanel}
                    isSettingOpen={isSettingOpen}
                    onOpenSettings={handleToggleSettings}
                    isRecording={isRecording}
                    onToggleRecording={handleRecording}
                    isTranscripting={isTranscripting}
                    onToggleTranscript={handleTranscript}
                    onShareClick={() => setIsInviteModalOpen(true)}
                  />
                </div>
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
              {isChatOpen && (
                <ChatPanel
                  isOpen={isChatOpen}
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

              {/* Invite Modal */}
              <InviteModal
                open={isInViteModalOpen}
                onOpenChange={setIsInviteModalOpen}
                roomId={meetingId}
                currentUserId={user?.id}
              />
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
