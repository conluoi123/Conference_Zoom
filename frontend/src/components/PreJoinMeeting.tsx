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
import { useNavigate } from "react-router-dom"; // link tới trang khác 
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
  const {getCameras, getMicrophones} = useMediaDevice(); // lấy danh sách thiết bị ở local 
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]); 
  const [cameras, setCameras] = useState<MediaDevice[]>([]); 
  const [selectedCam, setselectedCam] = useState(""); 
  const [selectedMic, setselectedMic] = useState(""); 
  const [isMicOn, setIsMicOn] = useState(true); 
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [previewStream, setpreviewStream] = useState<MediaStream | null>(null);
  const [displayName, setDisplayName] = useState("Guest");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

// ================== MEDIADEVICEHOOK + USEMEETINGHOOK=================
  useEffect(() => {
      const initializeMedia = async () => {
          try {
              setLoading(true);
              // Yêu cầu permission camera và microphone
              const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                  audio: true
              });              
              // Nếu thành công -> có permission
              setPermissionGranted(true);             
              // Dừng stream tạm thời (chỉ cần check permission)
              stream.getTracks().forEach(track => track.stop());              
              // Load danh sách thiết bị sau khi có permission
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

  // 2. LOAD DANH SÁCH THIẾT BỊ
  const loadDevices = async () => {
      try {
          const cams = await getCameras(); 
          const mics = await getMicrophones();          
          setCameras(cams); 
          setMics(mics as MediaDeviceInfo[]);
          // Chọn thiết bị đầu tiên nếu có
          if (cams.length > 0) setselectedCam(cams[0].deviceId);
          if (mics.length > 0) setselectedMic(mics[0].deviceId);

      } catch (error) {
          console.error("Error loading devices:", error);
      }
  };

  // 3. HIỂN THỊ CAMERA PREVIEW
  useEffect(() => {
      if (!selectedCam || !isCameraOn || !permissionGranted) {
          // Clear video nếu camera tắt hoặc không có permission
          if (videoRef.current) {
              videoRef.current.srcObject = null;
          }
          return;
      }
      
      // Bật camera preview với device đã chọn
      navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCam } },
          audio: false, // có lấy tiếng hay ko kiểu v
      })
      .then((stream) => {
          setpreviewStream(stream);
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      })
      .catch(error => {
          console.error("Error accessing camera:", error);
          setIsCameraOn(false);
      });

      // Cleanup: dừng camera khi unmount hoặc thay đổi device
      return () => {
          if (previewStream) {
              previewStream.getTracks().forEach(track => track.stop());
          }
      };
  }, [selectedCam, isCameraOn, permissionGranted]);

  // 4. RETRY PERMISSION NẾU USER TỪ CHỐI
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


  useEffect(()=>{
      (
          async () => {
              const cams = await getCameras(); 
              const mics = await getMicrophones(); 
              // lấy tất cả các thiết bị ở local
              setCameras(cams); 
              setMics(mics as MediaDeviceInfo[]); // fix vì mics có thể trả về 2 kiểu

              if(cams.length >0) setselectedCam(cams[0].deviceId)
              if (mics.length >0) setselectedMic(mics[0].deviceId)

          }
      )();
  }, []);
  // Bật camera hiển thị trước khi vào phòng 
  useEffect(()=> {
      if(!selectedCam) return; 
      
      navigator.mediaDevices.getUserMedia({
          video: {deviceId: {exact: selectedCam}},
          audio: false,
      })
      .then((stream)=>{
          setpreviewStream(stream) // lưu stream vào state 
          if(videoRef.current)
              videoRef.current.srcObject = stream; // hiển thị lên video element 
      })
      // chạy khi component uncount hoặc khi selectedCam thay đổi
      return() =>{
          previewStream?.getTracks().forEach((t)=>t.stop()); // dừng tất cả 
      }
  // chỉ chạy lại khi selectedCam thay đổi
  },[selectedCam])

//======================== LINK VÀO PHÒNG ========================= //
// thay vì route trực tiếp trong handlJoin => sd callback function ở đâu để việc điều chỉnh link dễ mở rộng hơn 

  const handleJoin = () => {
      //==================== SẼ CÓ CODE ĐỂ XỬ LÍ RESPONSE TỪ BACKEND =====================//
      const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJiNGNjNjlmNy0xZTNkLTQ3NmMtODlkMC1mNGMwZGE1NTU1NTciLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc2NDE1MTg1MCwiZXhwIjoxNzY0NzU2NjUwfQ.CsiPzYBbx3ZHxh7KGEpoI_qxYGkwabEJGEyE6JWo2QE"; 
      const roomId = "3494-3huj-pikr"
      // nhận các giá trị này để render - KO làm kiểu này vì lí do ở trên
      // navigate(`/meeting/${roomId}`, {
      //     state : {
      //         token: testToken, 
      //         name: displayName ||  "Guest", // lấy giá trị user nhập vào, nếu giữ nguyên ko nhập thì tên Guest
      //         micId: selectedMic,
      //         cameraId: selectedCam,
      //         micEnabled: isMicOn,
      //         cameraEnabled: isCameraOn, 
      //     }
      // });
      //================== THAY VÀO ĐÓ DÙNG MEETINGSSETTINGS =============//
      const meetingsettings : MeetingSettings =  {
        token: testToken, 
        name: displayName || "Guest", 
        meetingCode: initialMeetingCode, 
        micId: selectedMic, 
        cameraId: selectedCam, 
        micEnabled: isMicOn, 
        cameraEnabled: isCameraOn,
      }
      //======================= CALLBACK FUNCTION ======================//
      onJoinMeeting(meetingsettings);
  }; 
  const handleCancel = () => {
    //==================== GỌI CALLBACK FUNCTION =======================//
    onCancel();
  }

    return (
    <div className="min-w-screen min-h-screen flex bg-amber-50 justify-center items-center overflow-y-scroll">
        {/* Left Side - Camera Preview (takes most space) */}
        <div className="flex-1 relative flex items-center justify-center bg-black rounded-2xl ml-1">
          {/* Camera Preview Area */}
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[96vh] object-cover rounded-2xl ml-1 shadow-2xl"
            />
          ) : (
            <div className="text-center h-[96vh] rounded-2xl ml-1">
              <div className="text-white text-xl mb-4">Camera đang tắt</div>
              <div className="text-gray-400">Bật camera để người khác nhìn thấy bạn</div>
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
        <div className="w-full h-[50vw]">
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
