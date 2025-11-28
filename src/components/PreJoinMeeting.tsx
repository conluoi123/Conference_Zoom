import { 
  Video, 
  Plus, 
  Calendar, 
  Upload, 
  Circle, 
  Clock, 
  Bell, 
  Settings, 
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Mic,
  MicOff,
  CameraOff,
  Camera,
} from "lucide-react";

import { DeviceInfo, useMediaDevice, useMeeting}   from "@videosdk.live/react-sdk";
import { useNavigate } from "react-router-dom";
import {useState, useEffect, useRef} from "react"; 
import type { MediaDevice } from "@zoom/videosdk";

// ============Thêm export để xuất khẩu sang bên App.tsx==============//
export interface MeetingSettings {
  token: string;
  name: string;
  meetingCode: string;
  micId: string;
  cameraId: string;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

//=================== PREJOINMEETINGPROPS ===========================//
interface PreJoinMeetingProps {
  onJoinMeeting: (settings: MeetingSettings) => void; // call back function 
  onCancel: () => void; 
  initialMeetingCode?: string; // có ? là kiểu optional này ko bắt buộc 
  initialDisplayName?: string; 

}

export default function PreJoinMeeting({onJoinMeeting, onCancel, initialMeetingCode="", initialDisplayName=""}: PreJoinMeetingProps) {

  const navigate = useNavigate(); 
  const videoRef = useRef<HTMLVideoElement>(null); 
  const {getCameras, getMicrophones} = useMediaDevice();
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]); 
  const [cameras, setCameras] = useState<MediaDevice[]>([]); 
  const [selectedCam, setselectedCam] = useState(""); 
  const [selectedMic, setselectedMic] = useState(""); 
  const [isMicOn, setIsMicOn] = useState(true); 
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [previewStream, setpreviewStream] = useState<MediaStream | null>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName || "Guest");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. INITIALIZE MEDIA PERMISSIONS AND DEVICES
  useEffect(() => {
      const initializeMedia = async () => {
          try {
              setLoading(true);
              // Request camera and microphone permissions
              const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                  audio: true
              });              
              
              setPermissionGranted(true);             
              // Stop temporary stream (just checking permissions)
              stream.getTracks().forEach(track => track.stop());              
              // Load device list after getting permissions
              await loadDevices();              
          } catch (error: any) {
              console.error("Permission denied:", error);
              setPermissionGranted(false);             
              if (error.name === 'NotAllowedError') {
                  alert("Vui lòng cấp quyền camera và microphone để sử dụng tính năng video call");
              }
          } finally {
              setLoading(false);
          }
      };

      initializeMedia();
  }, []);

  // 2. LOAD DEVICE LIST
  const loadDevices = async () => {
      try {
          const cams = await getCameras(); 
          const mics = await getMicrophones();          
          setCameras(cams); 
          setMics(mics as MediaDeviceInfo[]);
          // Select first device if available
          if (cams.length > 0) setselectedCam(cams[0].deviceId);
          if (mics.length > 0) setselectedMic(mics[0].deviceId);

      } catch (error) {
          console.error("Error loading devices:", error);
      }
  };

  // 3. CAMERA PREVIEW WITH PERMISSION CHECK
  useEffect(() => {
      let currentStream: MediaStream | null = null;
      let isActive = true;
      
      console.log('=== Camera Preview Effect ===');
      console.log('selectedCam:', selectedCam);
      console.log('isCameraOn:', isCameraOn);
      console.log('permissionGranted:', permissionGranted);
      
      if (!isCameraOn || !permissionGranted) {
          console.log('Camera disabled or no permission - clearing video');
          // Clear video if camera is off or no permission
          if (videoRef.current) {
              videoRef.current.srcObject = null;
          }
          if (previewStream) {
              previewStream.getTracks().forEach(track => track.stop());
              setpreviewStream(null);
          }
          return;
      }
      
      // Start camera preview with selected device
      const videoConstraints = selectedCam 
          ? { deviceId: { exact: selectedCam } }
          : { facingMode: 'user' }; // Default to front camera
          
      console.log('Starting camera with constraints:', videoConstraints);
      
      navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
      })
      .then((stream) => {
          if (!isActive) return; // Component unmounted
          
          console.log('Camera stream obtained successfully');
          currentStream = stream;
          setpreviewStream(stream);
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              return videoRef.current.play();
          }
      })
      .then(() => {
          console.log('Video playing successfully');
      })
      .catch(error => {
          if (!isActive) return;
          
          console.error("Error accessing camera:", error);
          // Try without device ID if specific device fails
          if (selectedCam) {
              console.log('Retrying with default camera...');
              navigator.mediaDevices.getUserMedia({
                  video: { facingMode: 'user' },
                  audio: false,
              })
              .then((stream) => {
                  if (!isActive) return;
                  
                  console.log('Default camera stream obtained');
                  currentStream = stream;
                  setpreviewStream(stream);
                  if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                      return videoRef.current.play();
                  }
              })
              .catch(err => {
                  if (!isActive) return;
                  console.error("Error with default camera too:", err);
                  setIsCameraOn(false);
              });
          } else {
              setIsCameraOn(false);
          }
      });

      // Cleanup: stop camera when unmount or device changes
      return () => {
          isActive = false;
          console.log('Cleaning up camera stream');
          if (currentStream) {
              currentStream.getTracks().forEach(track => track.stop());
          }
      };
  }, [selectedCam, isCameraOn, permissionGranted]);

  // Add effect to debug when devices are loaded
  useEffect(() => {
      console.log('=== Devices Updated ===');
      console.log('Cameras:', cameras);
      console.log('Mics:', mics);
      console.log('Selected Camera ID:', selectedCam);
      console.log('Selected Mic ID:', selectedMic);
  }, [cameras, mics, selectedCam, selectedMic]);

  // 4. RETRY PERMISSION IF USER DENIED
  const handleRetryPermission = async () => {
      try {
          setLoading(true);
          const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
          });
          
          setPermissionGranted(true);
          stream.getTracks().forEach(track => track.stop());
          await loadDevices();
          
      } catch (error) {
          console.error("Still no permission:", error);
          alert("Vui lòng cấp quyền trong trình duyệt để tiếp tục");
      } finally {
          setLoading(false);
      }
  };

  //======================== LINK VÀO PHÒNG ========================= //
// thay vì route trực tiếp trong handlJoin => sd callback function ở đâu để việc điều chỉnh link dễ mở rộng hơn 

  const handleJoin = () => {
      //==================== SẼ CÓ CODE ĐỂ XỬ LÍ RESPONSE TỪ BACKEND =====================//
      const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJiNGNjNjlmNy0xZTNkLTQ3NmMtODlkMC1mNGMwZGE1NTU1NTciLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc2NDE1MTg1MCwiZXhwIjoxNzY0NzU2NjUwfQ.CsiPzYBbx3ZHxh7KGEpoI_qxYGkwabEJGEyE6JWo2QE"; 
      const roomId = "3494-3huj-pikr"
      
      //================== THAY VÀO ĐÓ DÙNG MEETINGSSETTINGS =============//
      const meetingsettings : MeetingSettings =  {
        token: testToken, 
        name: displayName || "Guest", 
        meetingCode: roomId, 
        micId: selectedMic, 
        cameraId: selectedCam, 
        micEnabled: isMicOn, 
        cameraEnabled: isCameraOn,
      }
      
      console.log('=== PreJoinMeeting Debug ===');
      console.log('Meeting settings being passed:', meetingsettings);
      console.log('Selected devices:');
      console.log('  - Mic ID:', selectedMic);
      console.log('  - Camera ID:', selectedCam);
      console.log('States:');
      console.log('  - isMicOn:', isMicOn);
      console.log('  - isCameraOn:', isCameraOn);
      console.log('  - displayName:', displayName);
      
      //======================= CALLBACK FUNCTION ======================//
      onJoinMeeting(meetingsettings);
  }; 
  const handleCancel = () => {
    //==================== GỌI CALLBACK FUNCTION =======================//
    onCancel();
  }

  // RENDER LOADING STATE
  if (loading) {
      return (
          <div className="min-w-screen min-h-screen flex bg-amber-50 justify-center items-center">
              <div className="text-center">
                  <div className="text-xl mb-4">Đang kiểm tra quyền truy cập...</div>
                  <div className="text-gray-600">Vui lòng cho phép truy cập camera và microphone</div>
              </div>
          </div>
      );
  }

  // RENDER PERMISSION DENIED STATE
  if (!permissionGranted) {
      return (
          <div className="min-w-screen min-h-screen flex bg-amber-50 justify-center items-center">
              <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                  <div className="text-xl mb-4 text-red-600">Không có quyền truy cập</div>
                  <div className="text-gray-600 mb-6">
                      Ứng dụng cần quyền truy cập camera và microphone để tham gia cuộc họp
                  </div>
                  <div className="flex gap-4 justify-center">
                      <button
                          onClick={handleRetryPermission}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                          Thử lại
                      </button>
                      <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                          Hủy
                      </button>
                  </div>
              </div>
          </div>
      );
  }

    return (
    <div className="min-w-screen min-h-screen flex bg-amber-50 justify-center items-center overflow-y-scroll">
        {/* Left Side - Camera Preview */}
        <div className="flex-1 relative flex items-center justify-center bg-black rounded-2xl ml-1">
          {/* Debug Info - Remove this later */}
          <div className="absolute top-4 left-4 text-white text-xs bg-black/50 p-2 rounded z-10">
            <div>Camera: {isCameraOn ? 'ON' : 'OFF'}</div>
            <div>Permission: {permissionGranted ? 'YES' : 'NO'}</div>
            <div>Selected: {selectedCam || 'NONE'}</div>
            <div>Stream: {previewStream ? 'ACTIVE' : 'NONE'}</div>
          </div>

          {/* Camera Preview Area */}
          {isCameraOn && permissionGranted ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[96vh] object-cover rounded-2xl ml-1 shadow-2xl"
              style={{ transform: 'scaleX(-1)' }} // Mirror effect like selfie
            />
          ) : (
            <div className="text-center h-[96vh] rounded-2xl ml-1 flex flex-col items-center justify-center">
              <CameraOff className="w-16 h-16 text-white mb-4" />
              <div className="text-white text-xl mb-4">Camera đang tắt</div>
              <div className="text-gray-400">Bật camera để người khác nhìn thấy bạn</div>
              {!permissionGranted && (
                <button 
                  onClick={handleRetryPermission}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Cấp quyền camera
                </button>
              )}
            </div>
          )}

          {/* Control Buttons - Bottom Center */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 justify-around items-center">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMicOn 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-red-500 hover:bg-red-600'
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
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isCameraOn ? (
                <Camera className="w-6 h-6 text-white" />
              ) : (
                <CameraOff className="w-6 h-6 text-white" />
              )}
            </button>
            {/* Device Selectors - Bottom */}       
            <select 
                value={selectedMic}
                onChange={(e) => setselectedMic(e.target.value)}
                className="max-w-[240px] bg-gray-800/80 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                {/* Option mặc định */}
                <option value="">Chọn microphone</option>
                
                {/* Map qua danh sách mics từ state */}
                {mics.map((mic, index) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${index + 1}`}
                    </option>
                ))}
            </select>
            <select 
                value={selectedCam}
                onChange={(e) => setselectedCam(e.target.value)}
                className="max-w-[240px] bg-gray-800/80 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 overflow-x-hidden"
                >
                {/* Option mặc định */}
                <option value="">Chọn camera</option>
                
                {/* Map qua danh sách mics từ state */}
                {cameras.map((cam, index) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${index + 1}`}
                    </option>
                ))}
            </select>
          </div>

          
        </div>

        {/* Right Side - Meeting Options */}
        <div className="w-[350px] max-h-[80vh] my-10 mx-4 border-black  shadow-2xl rounded-lg bg-white p-6 flex flex-col items-center justify-center gap-8">
          {/* Header */}
          <div className="w-full flex items-center justify-between">
            <h2 className="text-xl font-bold">Chuẩn bị vào phòng</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

        {/* Display Name Input */}
        <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên hiển thị của bạn
        </label>
        <input
            type="text"
            placeholder="Nguyễn Kim Quốc"
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
        className=" px-4 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex  items-center justify-center gap-2"
        >
        <Video className="w-8 h-8" />
        <span className="text-sm">Tham gia cuộc họp</span>
        </button>
    </div>
      </div>
    )
}
