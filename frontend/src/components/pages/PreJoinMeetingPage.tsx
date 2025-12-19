import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Mic, MicOff, Camera, CameraOff, Video } from "lucide-react";

export interface MeetingSettings {
  micEnabled: boolean;
  cameraEnabled: boolean;
  webcamDeviceId: string;
  micDeviceId: string;
  displayName: string;
}

export function PreJoinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Ref để kiểm soát việc gọi API nhiều lần
  const initializingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const { roomId, token, settings, displayName: initialDisplayName } = location.state || {};

  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper để stop stream an toàn
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!roomId || !token) {
      navigate("/home");
    }
  }, [roomId, token, navigate]);

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

  // Khởi tạo permission ban đầu
  useEffect(() => {
    const initializeMedia = async () => {
      // Ngăn chặn chạy 2 lần liên tiếp
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        setLoading(true);
        // Yêu cầu quyền
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        setPermissionGranted(true);
        // Dừng ngay lập tức để giải phóng thiết bị cho bước chọn cam sau này
        stream.getTracks().forEach((track) => track.stop());
        
        await loadDevices();
      } catch (error: any) {
        console.error("Permission denied:", error);
        setPermissionGranted(false);
      } finally {
        setLoading(false);
        initializingRef.current = false;
      }
    };

    initializeMedia();
    
    // Cleanup khi unmount trang PreJoin
    return () => {
      stopStream();
    };
  }, []);

  // Xử lý Preview Camera khi user thay đổi thiết bị hoặc bật/tắt
  useEffect(() => {
    // Nếu chưa có quyền hoặc user tắt cam thì dừng stream
    if (!permissionGranted || !isCameraOn) {
      stopStream();
      return;
    }

    if (!selectedCam) return;

    let isMounted = true;

    const startCamera = async () => {
      stopStream(); // Dừng stream cũ trước

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCam } },
          audio: false,
        });

        if (!isMounted) {
          // Nếu component đã unmount trong lúc đang await, dừng stream ngay
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream; // Lưu vào ref để quản lý cleanup
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error: any) {
        console.error("Error accessing camera:", error);
        // Xử lý lỗi "NotReadableError" (Camera đang bận)
        if (error.name === "NotReadableError") {
            alert("Camera đang được sử dụng bởi ứng dụng khác hoặc chưa được giải phóng. Vui lòng thử lại.");
        }
        setIsCameraOn(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [selectedCam, isCameraOn, permissionGranted]);

  const handleJoin = () => {
    // Dừng preview trước khi chuyển trang
    stopStream();

    const userSettings: MeetingSettings = {
      micEnabled: isMicOn,
      cameraEnabled: isCameraOn,
      webcamDeviceId: selectedCam,
      micDeviceId: selectedMic,
      displayName: displayName,
    };

    const micState = settings.allowMic && userSettings ? userSettings.micEnabled:settings.allowMic;
    const camState = settings.allowCam && userSettings ? userSettings.cameraEnabled:settings.allowCam;

    settings.allowMic = micState;
    settings.allowCam = camState

    navigate(`/meeting/${roomId}`, {
      state: {
        roomId,
        token,
        settings, 
      },
    });
  };

  const handleCancel = () => {
    stopStream();
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="min-w-screen min-h-screen flex bg-gray-900 justify-center items-center">
        <div className="text-white text-xl animate-pulse">Đang kiểm tra thiết bị...</div>
      </div>
    );
  }

  return (
    <div className="min-w-screen min-h-screen flex bg-gray-900 justify-center items-center overflow-hidden p-4">
      {/* Left Side - Camera Preview */}
      <div className="flex-1 relative flex items-center justify-center">
        {isCameraOn && permissionGranted ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-4xl max-h-[80vh] object-cover rounded-2xl shadow-2xl transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full max-w-4xl h-[60vh] flex flex-col items-center justify-center bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
            <div className="text-white text-xl mb-4">Camera đang tắt</div>
            <div className="text-gray-400">
              {permissionGranted 
                ? "Bật camera để xem trước hình ảnh" 
                : "Không có quyền truy cập camera"}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 items-center bg-gray-900/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-700 shadow-xl">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMicOn
                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-500"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
              }`}
            >
              {isMicOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isCameraOn
                  ? "bg-gray-700 hover:bg-gray-600 border border-gray-500"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
              }`}
            >
              {isCameraOn ? <Camera className="w-5 h-5 text-white" /> : <CameraOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="h-8 w-[1px] bg-gray-600 mx-2"></div>

            <div className="flex flex-col gap-2">
                <select
                    value={selectedMic}
                    onChange={(e) => setSelectedMic(e.target.value)}
                    className="w-[160px] bg-gray-800 text-white px-3 py-1.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-xs truncate"
                >
                    {mics.map((mic, index) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Microphone ${index + 1}`}
                    </option>
                    ))}
                </select>

                <select
                    value={selectedCam}
                    onChange={(e) => setSelectedCam(e.target.value)}
                    className="w-[160px] bg-gray-800 text-white px-3 py-1.5 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-xs truncate"
                >
                    {cameras.map((cam, index) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                        {cam.label || `Camera ${index + 1}`}
                    </option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {/* Right Side - Meeting Options */}
      <div className="w-[350px] ml-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Sẵn sàng tham gia?</h2>
          <button onClick={handleCancel} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tên hiển thị</label>
          <input
            type="text"
            placeholder="Nhập tên của bạn..."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={!displayName.trim()}
          className="px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          <Video className="w-5 h-5" />
          <span>Tham gia ngay</span>
        </button>
      </div>
    </div>
  );
}