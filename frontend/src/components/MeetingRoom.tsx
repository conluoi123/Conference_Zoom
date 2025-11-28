// MeetingRoom.tsx 
import React, { useState, useEffect, useRef } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { BiLogoZoom } from "react-icons/bi";
import {
  X,
  Circle,
  PhoneOff,
  MessageSquare,
  Share2,
  Camera,
  Mic,
  Settings,
  Plus,
  Users,
  MicOff,
  VideoOff
} from "lucide-react";

export interface Participant {
  id: number;
  name: string;
  initials: string;
  color?: string;
}

interface MeetingRoomProps {
  roomId: string;
  onLeaveMeeting: () => void;
  token: string;
  containerWidth: string;
  containerHeight: string;
}

// Component hiển thị từng participant
const ParticipantTile = React.memo(function ParticipantTile({ participantId }: { participantId: string }) {
  const { webcamStream, webcamOn, micStream, micOn, isLocal, displayName } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Render video stream khi có webcam
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
  }, [webcamStream]);

  useEffect(() => {
    // Chỉ phát âm thanh khi có micStream và mic đang bật
    if (audioRef.current && micStream && micOn) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      audioRef.current.srcObject = mediaStream;

      // Bắt buộc phải có catch lỗi vì trình duyệt chặn auto-play
      audioRef.current.play().catch((err) => {
        console.error("Audio play error", err);
      });
    }
  }, [micStream]);

  // Lấy chữ cái đầu từ tên
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ background: webcamOn ? '#000' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      {/* 4. Thẻ Audio ẩn */}
      {/* muted={isLocal} là QUAN TRỌNG NHẤT: Để bạn không nghe thấy tiếng vọng của chính mình */}
      <audio ref={audioRef} autoPlay playsInline muted={isLocal} controls={false} />
      {webcamOn && webcamStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full flex bg-purple-600 items-center justify-center text-white text-4xl shadow-2xl font-semibold">
            {getInitials(displayName)}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-black/70 py-3 px-3 rounded-lg flex items-center gap-2">
        {!micOn && <MicOff className="w-3 h-3 text-red-500" />}
        {!webcamOn && <VideoOff className="w-3 h-3 text-red-500" />}
        <Circle className="w-3 h-3 text-white" />
        <span className="text-white text-sm">{displayName || "Guest"} {isLocal && "(Bạn)"}</span>
      </div>
    </div>
  );
})

// Component điều khiển cuộc họp
function MeetingControls({ onLeaveMeeting }: { onLeaveMeeting: () => void }) {
  const { leave, toggleMic, toggleWebcam, localMicOn, localWebcamOn } = useMeeting();

  const handleLeave = () => {
    leave();
    onLeaveMeeting();
  };

  return (
    <div className="bg-gray-800 px-6 py-4 rounded-2xl">
      <div className="mx-auto flex items-center justify-center gap-4">
        <button
          onClick={() => toggleMic()}
          className={`flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors ${!localMicOn ? 'bg-red-600' : ''}`}
        >
          {localMicOn ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
          <span className="text-white text-xs">{localMicOn ? 'Tắt tiếng' : 'Bật tiếng'}</span>
        </button>

        <button
          onClick={() => toggleWebcam()}
          className={`flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors ${!localWebcamOn ? 'bg-red-600' : ''}`}
        >
          {localWebcamOn ? (
            <Camera className="w-6 h-6 text-white" />
          ) : (
            <VideoOff className="w-6 h-6 text-white" />
          )}
          <span className="text-white text-xs">{localWebcamOn ? 'Tắt video' : 'Bật video'}</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
          <Share2 className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Chia sẻ</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
          <MessageSquare className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Trò chuyện</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
          <Users className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Người tham gia</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
          <Settings className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Cài đặt</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
          <Plus className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Thêm</span>
        </button>

        <button
          onClick={handleLeave}
          className="flex flex-col items-center gap-1 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <PhoneOff className="w-6 h-6 text-white" />
          <span className="text-white text-xs">Kết thúc</span>
        </button>
      </div>
    </div>
  );
}

// Component chính hiển thị phòng họp - SỬ DỤNG VideoSDK hooks
function MeetingRoomContent({ roomId, onLeaveMeeting }: { roomId: string; onLeaveMeeting: () => void }) {
  const [joined, setJoined] = useState<"JOINING" | "JOINED" | null>(null);

  // Sử dụng useMeeting hook để lấy các function và state từ VideoSDK
  const { join, leave, participants } = useMeeting({
    onMeetingJoined: () => {
      console.log("✅ Đã tham gia cuộc họp thành công");
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      console.log("👋 Đã rời cuộc họp");
      onLeaveMeeting();
    },
  });

  // Tự động join meeting khi component mount
  useEffect(() => {
    if (join && joined === null) {
      console.log("🔄 Đang tham gia cuộc họp...");
      setJoined("JOINING");
      join();
    }
  }, []);


  useEffect(() => {
    return () => {
      if (leave) {
        leave();
      }
    };
  }, []);

  // Lấy danh sách participant IDs
  const participantIds = [...participants.keys()];

  return (
    <div className="bg-gray-900 flex flex-col min-h-screen" style={{ width: "100vw", height: "100vh" }}>
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="bg-blue-600 p-2 rounded-2lg">
          <BiLogoZoom className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white text-2xl font-semibold">ZUS Workplace</h2>
          <p className="text-gray-400 text-sm">Room ID: {roomId}</p>
        </div>
        <button
          onClick={onLeaveMeeting}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* Nội dung chính */}
      {joined === "JOINED" ? (
        <>
          {/* Grid hiển thị participants */}
          <div className="flex-1 p-6 grid grid-cols-2 gap-4">
            {participantIds.map((participantId) => (

              <ParticipantTile key={participantId} participantId={participantId} />
            ))}
          </div>

          {/* Thanh điều khiển */}
          <MeetingControls onLeaveMeeting={onLeaveMeeting} />
        </>
      ) : joined === "JOINING" ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white text-xl">Đang tham gia cuộc họp...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white text-xl">Đang khởi tạo...</p>
        </div>
      )}
    </div>
  );
}

// Component wrapper - kiểm tra props trước khi render
export default function MeetingRoom({
  roomId,
  token,
  onLeaveMeeting,
  containerWidth = "100vw",
  containerHeight = "100vh"
}: MeetingRoomProps) {
  // Kiểm tra có đủ thông tin không
  if (!roomId || !token) {
    return (
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Đang tải thông tin cuộc họp.....</div>
      </div>
    );
  }
  // Render component chính nếu có đủ thông tin
  // MeetingRoomContent sẽ được wrap bởi MeetingProvider ở AppMeeting.tsx
  return <MeetingRoomContent roomId={roomId} onLeaveMeeting={onLeaveMeeting} />;
}
