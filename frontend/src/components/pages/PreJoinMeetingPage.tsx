import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { Constants, useMediaDevice } from "@videosdk.live/react-sdk";

export function PreJoinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestPermission, getCameras, getMicrophones } = useMediaDevice();
  const [devices, setDevices] = useState<{ m: any[]; c: any[] }>({
    m: [],
    c: [],
  });
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const {
    roomId,
    token,
    hostId,
    displayName: initialName,
    settings,
  } = location.state || {};
  const [displayName, setDisplayName] = useState(initialName || "");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Tắt đèn Camera
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // 2. Hàm khởi tạo ban đầu
  const initialize = async () => {
    try {
      const p = await requestPermission(Constants.permission.AUDIO_AND_VIDEO);
      const [cams, mics] = await Promise.all([getCameras(), getMicrophones()]);

      setDevices({ c: cams, m: mics });

      if (cams.length > 0) setSelectedCam(cams[0].deviceId);
      if (mics.length > 0) setSelectedMic(mics[0].deviceId);

      // Nếu không có quyền Camera, set state về false luôn
      if (!p.get(Constants.permission.VIDEO)) {
        setIsCameraOn(false);
      }
    } catch (err) {
      console.error("Lỗi khởi tạo:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. EFFECT QUAN TRỌNG: Điều khiển việc bật/tắt Camera preview
  useEffect(() => {
    const startPreview = async () => {
      // Dọn dẹp stream cũ trước khi tạo cái mới hoặc khi bị tắt
      stopStream();

      // Chỉ khởi tạo stream NẾU camera đang bật và có deviceId
      if (isCameraOn && selectedCam) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: selectedCam } },
            audio: false,
          });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("❌ Preview Error:", error);
          setIsCameraOn(false);
        }
      }
    };

    startPreview();

    // Cleanup khi component unmount
    return () => stopStream();
  }, [selectedCam, isCameraOn]); // Tự động chạy lại khi đổi Cam hoặc bấm nút On/Off

  useEffect(() => {
    initialize();
  }, []);

  const handleJoin = () => {
    const micState = settings.allowMic ? isMicOn : settings.allowMic;
    const camState = settings.allowCam ? isCameraOn : settings.allowCam;

    settings.allowMic = micState;
    settings.allowCam = camState;

    const meetingSession = {
      roomId,
      token,
      hostId,
      displayName,
      settings,
    };

    sessionStorage.setItem(`meeting_${roomId}`, JSON.stringify(meetingSession));

    stopStream();
    navigate(`/meeting/${roomId}`, { state: meetingSession });
  };

  if (loading)
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center text-white">
        Đang chuẩn bị...
      </div>
    );

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center p-6 gap-10">
      {/* CỘT TRÁI: PREVIEW */}
      <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-gray-700">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <CameraOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>Camera đang tắt</p>
          </div>
        )}

        <div className="absolute bottom-4 flex gap-4">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-4 rounded-full ${
              isMicOn ? "bg-gray-800" : "bg-red-600"
            }`}
          >
            {isMicOn ? (
              <Mic className="text-white" />
            ) : (
              <MicOff className="text-white" />
            )}
          </button>
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-4 rounded-full ${
              isCameraOn ? "bg-gray-800" : "bg-red-600"
            }`}
          >
            {isCameraOn ? (
              <Camera className="text-white" />
            ) : (
              <CameraOff className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* CỘT PHẢI: SETTINGS */}
      <div className="w-96 flex flex-col gap-6 text-white">
        <h1 className="text-2xl font-bold">Sẵn sàng tham gia?</h1>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Tên của bạn"
          className="bg-gray-800 border border-gray-700 p-3 rounded-lg outline-none"
        />
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Chọn Camera</label>
          <select
            value={selectedCam}
            onChange={(e) => setSelectedCam(e.target.value)}
            className="bg-gray-800 p-2 rounded border border-gray-700"
          >
            {devices.c.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Camera"}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleJoin}
          disabled={!displayName.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-3 rounded-xl font-bold"
        >
          Tham gia ngay
        </button>
      </div>
    </div>
  );
}
