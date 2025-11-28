// MeetingRoom.tsx 
import { useState, useEffect, useRef } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { BiLogoZoom } from "react-icons/bi";
import { 
  Plus, 
  X,
  Users,
  PhoneOff,
  MessageSquare,
  Share2,
  Camera,
  Mic,
  Settings,
  MicOff,
  CameraOff
} from "lucide-react";

// Component để hiển thị local camera preview trực tiếp
function LocalCameraView({ 
  cameraId, 
  enabled, 
  micEnabled 
}: { 
  cameraId?: string; 
  enabled: boolean;
  micEnabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: cameraId ? { deviceId: { exact: cameraId } } : true,
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing local camera:', error);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraId, enabled]);

  return (
    <div className="relative rounded-2xl overflow-hidden h-full bg-gray-700">
      {enabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-semibold bg-blue-500">
            You
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-black/70 py-2 px-3 rounded-lg flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${micEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-white text-sm">You</span>
      </div>
    </div>
  );
}

// Component để hiển thị video hoặc avatar của từng participant
function ParticipantView({ participantId }: { participantId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { 
    webcamStream, 
    micOn, 
    webcamOn, 
    isLocal, 
    displayName 
  } = useParticipant(participantId);

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
    }
  }, [webcamStream]);

  const getInitials = (name: string) => name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'];
    return colors[name.length % colors.length];
  };

  return (
    <div className="relative rounded-2xl overflow-hidden h-full bg-gray-700">
      {webcamOn && webcamStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-semibold ${getAvatarColor(displayName || 'User')}`}>
            {getInitials(displayName || 'User')}
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-black/70 py-2 px-3 rounded-lg flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${micOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-white text-sm">{displayName || 'User'}</span>
        {isLocal && <span className="text-white text-xs">(Bạn)</span>}
      </div>
    </div>
  );
}

// Component chính của phòng họp
interface MeetingRoomProps {
  roomId: string;
  onLeaveMeeting: () => void;
  token: string;
  containerWidth: string; 
  containerHeight: string;
  initialCameraId?: string;
}

export default function MeetingRoom({
  roomId, 
  token, 
  onLeaveMeeting,
  containerWidth="100vw",
  containerHeight="100vh",
  initialCameraId,
}: MeetingRoomProps) {
    if (!roomId || !token) {
      return <div>Đang tải thông tin cuộc họp.....</div>
    }

    const {
      join, 
      leave, 
      toggleMic, 
      toggleWebcam,
      participants: meetingParticipants,
      localMicOn,
      localWebcamOn
    } = useMeeting();
    
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
      if (!hasJoined) {
        join();
        setHasJoined(true);
      }
    }, [join, hasJoined]);

    const participants = Array.from(meetingParticipants.values());
    const handleLeave = () => { leave(); onLeaveMeeting(); };
    const totalParticipants = participants.length + 1;

    return (
      <div
        className="bg-gray-900 flex flex-col h-screen overflow-hidden"
        style={{ width: containerWidth, height: containerHeight }}
      >
        <header className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BiLogoZoom className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white text-2xl font-semibold">ZUS Workplace</h2>
          <button onClick={handleLeave} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 min-h-0">
          <div className={`grid gap-4 w-full max-w-6xl ${
              totalParticipants === 1 ? "grid-cols-1"
              : totalParticipants === 2 ? "grid-cols-1 sm:grid-cols-2"
              : totalParticipants <= 4 ? "grid-cols-2"
              : totalParticipants <= 6 ? "grid-cols-2 sm:grid-cols-3"
              : totalParticipants <= 9 ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-2 md:grid-cols-4"
            }`}>
            
            
            {participants.map((participant) => (
              <div key={participant.id} className="aspect-video relative">
                <ParticipantView participantId={participant.id} />
              </div>
            ))}
          </div>
        </main>

        <div className="bg-gray-800 px-6 py-4">
          <div className="mx-auto flex items-center justify-center gap-4">
            <button onClick={() => toggleMic()} className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${localMicOn ? 'hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {localMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
              <span className="text-white text-xs">{localMicOn ? 'Tắt tiếng' : 'Bật tiếng'}</span>
            </button>
            <button onClick={() => toggleWebcam()} className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${localWebcamOn ? 'hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {localWebcamOn ? <Camera className="w-6 h-6 text-white" /> : <CameraOff className="w-6 h-6 text-white" />}
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
            <button onClick={handleLeave} className="flex flex-col items-center gap-1 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
              <PhoneOff className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Kết thúc</span>
            </button>
          </div>
        </div>
      </div>
    );
}
