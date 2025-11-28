// App.tsx
// trong này chỉ để link và gọi callback function 
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { LoginPage } from "./components/LoginPage.tsx";
import { OTPPage } from "./components/OTPPage.tsx";
import { HomePage } from "./components/Home.tsx";
import MeetingRoom from "./components/MeetingRoom.tsx";
import { useState } from "react";
import { useParams  } from "react-router-dom";
import AppMeeting from "./components/AppMeeting.tsx";
import PreJoinMeeting from "./components/PreJoinMeeting.tsx";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import type {MeetingSettings}   from './components/PreJoinMeeting';
import { meetingAPI } from "./apis/meetingApi.ts";



// có AppMeeting để bọc Provider cho meetingroom dùng Hook 

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/otp" element={<OTPWrapper />} />
        <Route path="/home" element={<HomeWrapper  />} />
        <Route path="/meeting/:roomId" element={<AppMeetingWrapper />} />
        <Route path="/pre-join" element={<PreJoinMeetingWrapper />} />
      </Routes>
    </Router>
  );
}
// Wrapper 
// function PreJoinMeetingWrapper() {
//   const location = useLocation(); 
//   const navigate = useNavigate(); 
//   const { roomId, token, micOn, camOn } = location.state || {};

//   return(
//     <MeetingProvider
//       config={{
//         meetingId: roomId,
//         micEnabled: micOn,
//         webcamEnabled: camOn,
//         name: "User",
//         debugMode: true
//       }}
//       token={token}
//     >
//       <PreJoinMeeting  />
//     </MeetingProvider>
//   );
// }

function PreJoinMeetingWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  // ================== CẦN XỬ LÍ THÊM CASE =====================//
  //======= BẤM VÀO NEW MEETINGS THÌ CŨNG RA =======//
  
  // Nhận data từ HomePage, nhận từ phần nhập 
  const { meetingCode, meetingLink, displayName: initialDisplayName } = location.state || {};

  const [meetingSettings, setMeetingSettings] = useState<MeetingSettings | null>(null);

  // Khi user bấm "Tham gia" trong PreJoinMeeting
  const handleJoinMeeting = (settings: MeetingSettings) => {
    setMeetingSettings(settings);
    
    // Navigate đến meeting page với settings
    navigate(`/meeting/${settings.meetingCode || meetingCode}`, {
      state: settings
    });
  };

  const handleCancel = () => {
    navigate(`/home`); // Quay lại HomePage
  };

  // Nếu chưa có meeting settings, hiển thị PreJoinMeeting
  if (!meetingSettings) {
    return (
      <PreJoinMeeting 
        onJoinMeeting={handleJoinMeeting}
        onCancel={handleCancel}
        initialMeetingCode={meetingCode}
        initialDisplayName={initialDisplayName}
      />
    );
  }

  // Nếu đã có settings, tự động join meeting
  return (
    <MeetingProvider
      config={{
        meetingId: meetingSettings.meetingCode || meetingCode,
        micEnabled: meetingSettings.micEnabled,
        webcamEnabled: meetingSettings.cameraEnabled,
        name: meetingSettings.name || "User",
        debugMode: true
      }}
      token={meetingSettings.token}
    >
      <PreJoinMeeting
        onJoinMeeting={handleJoinMeeting}
        onCancel={handleCancel}
        initialMeetingCode={meetingCode}
        initialDisplayName={initialDisplayName}
        // micDeviceId={meetingSettings.micId}
        // cameraDeviceId={meetingSettings.cameraId}
      />
    </MeetingProvider>
  );
}

// Viết Wrapper để giữ state 
// Wrapper để giữ email state
function LoginWrapper() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <LoginPage
      email={email}
      onSwitchToOTP={(enteredEmail) => {
        setEmail(enteredEmail);
        navigate("/otp", { state: { email: enteredEmail } });
      }}
    />
  );
}

function OTPWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <OTPPage
      email={email}
      onBack={() => navigate("/login")}
      onSwitchHome={() => navigate("/home", { state: { email } })}
    />
  );
}

function HomeWrapper() {
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const email = location.state?.email||""; 

  // ====================== CALLBACK cho homepage =======================//
  const handleNewMeeting = async() => {

    const response = await meetingAPI.createMeeting();
    // ========== LINK với Prejoin =============//
    navigate('/pre-join', {
        state: {
          token: testToken,           
          meetingCode: roomId,        
          displayName: email || "Guest",
          isNewMeeting: true          
        }
      });
    }

    // CALL BACK 
    const handleJoinMeeting = (meetingCode: string, displayName: string) => {
    navigate('/pre-join', {
      state: {
        meetingCode: meetingCode,
        displayName: displayName,
        isNewMeeting: false         
      }
    });
  };
  return (
    <HomePage  
      userEmail={email}
      onNewMeeting={handleNewMeeting}           
      onJoinMeeting={handleJoinMeeting}         
    />
  );

}
// AppMeetingRoom wrapper
function AppMeetingWrapper() {
  const { roomId } = useParams<{ roomId: string }>(); // lấy từ URL
  const location = useLocation();
  const navigate = useNavigate();

  // token có thể được truyền qua state khi navigate
  const token = location.state?.token || "";
  const displayName = location.state?.name || ""; 
  const handleLeaveMeeting = () => {
    // Khi leave, quay lại Home, chỗ nay chưa render lại được 
    navigate("/home");
  }

  if (!roomId || !token) {
    return <div>Đang tải thông tin phòng họp...</div>;
  }

  return (
    <AppMeeting 
      roomId={roomId}
      token={token}
      onLeaveMeeting={handleLeaveMeeting}
      name = {displayName}
    />
  );
}
