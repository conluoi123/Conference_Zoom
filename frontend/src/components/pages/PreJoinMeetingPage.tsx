import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Mic, MicOff, Camera, CameraOff, Video } from "lucide-react";
// import { useMediaDevice } from "@videosdk.live/react-sdk";
export interface MeetingSettings {
  micEnabled: boolean;
  cameraEnabled: boolean;
}

export function PreJoinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { roomId, token, displayName: initialDisplayName } = location.state || {};

  // const { getCameras, getMicrophones } = useMediaDevice();
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !token) {
      navigate("/home");
    }
  }, [roomId, token, navigate]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        setLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setPermissionGranted(true);
        stream.getTracks().forEach((track) => track.stop());
        await loadDevices();
      } catch (error: any) {
        console.error("Permission denied:", error);
        setPermissionGranted(false);
        if (error.name === "NotAllowedError") {
          alert("Vui lòng cấp quyền camera và microphone");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeMedia();
  }, []);

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const audioDevices = devices.filter((d) => d.kind === "audioinput");

      setCameras(videoDevices);
      setMics(audioDevices);

      if (videoDevices.length > 0) setSelectedCam(videoDevices[0].deviceId);
      if (audioDevices.length > 0) setSelectedMic(audioDevices[0].deviceId);
    } catch (error) {
      console.error("Error loading devices:", error);
    }
  };

  useEffect(() => {
    if (!selectedCam || !isCameraOn || !permissionGranted) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: { exact: selectedCam } },
        audio: false,
      })
      .then((stream) => {
        setPreviewStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
        setIsCameraOn(false);
      });

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCam, isCameraOn, permissionGranted]);

  const handleRetryPermission = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPermissionGranted(true);
      stream.getTracks().forEach((track) => track.stop());
      await loadDevices();
    } catch (error) {
      console.error("Still no permission:", error);
      alert("Vui lòng cấp quyền trong trình duyệt");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    const settings: MeetingSettings = {
      micEnabled: isMicOn,
      cameraEnabled: isCameraOn,
    };

    navigate(`/meeting/${roomId}`, {
      state: {
        roomId,
        token,
        settings,
      },
    });
  };

  const handleCancel = () => {
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="min-w-screen min-h-screen flex bg-gray-900 justify-center items-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!permissionGranted) {
    return (
      <div className="min-w-screen min-h-screen flex bg-gray-900 justify-center items-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Cần quyền truy cập</h2>
          <p className="text-gray-400 mb-6">
            Vui lòng cấp quyền camera và microphone để tiếp tục
          </p>
          <button
            onClick={handleRetryPermission}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-screen min-h-screen flex bg-gray-900 justify-center items-center overflow-hidden p-4">
      {/* Left Side - Camera Preview */}
      <div className="flex-1 relative flex items-center justify-center">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-[90vh] object-cover rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="text-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-20 shadow-2xl">
            <div className="text-white text-xl mb-4">Camera đang tắt</div>
            <div className="text-gray-200">
              Bật camera để người khác nhìn thấy bạn
            </div>
          </div>
        )}

        {/* Control Buttons - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 items-center bg-gray-800/90 backdrop-blur-sm px-6 py-4 rounded-2xl">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMicOn
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isMicOn ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isCameraOn
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isCameraOn ? (
              <Camera className="w-6 h-6 text-white" />
            ) : (
              <CameraOff className="w-6 h-6 text-white" />
            )}
          </button>

          <select
            value={selectedMic}
            onChange={(e) => setSelectedMic(e.target.value)}
            className="max-w-[180px] bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="">Chọn microphone</option>
            {mics.map((mic, index) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone ${index + 1}`}
              </option>
            ))}
          </select>

          <select
            value={selectedCam}
            onChange={(e) => setSelectedCam(e.target.value)}
            className="max-w-[180px] bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="">Chọn camera</option>
            {cameras.map((cam, index) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Side - Meeting Options */}
      <div className="w-[350px] ml-6 bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Chuẩn bị vào phòng</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Display Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên hiển thị của bạn
          </label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Người khác sẽ nhìn thấy tên này trong cuộc họp
          </p>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={!displayName.trim()}
          className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Video className="w-6 h-6" />
          <span>Tham gia cuộc họp</span>
        </button>
      </div>
    </div>
  );
}