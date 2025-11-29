// App.tsx
// trong này chỉ để link và gọi callback function
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { LoginPage } from "./components/LoginPage.tsx";
import { OTPPage } from "./components/OTPPage.tsx";
import { HomePage } from "./components/Home.tsx";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AppMeeting from "./components/AppMeeting.tsx";
import PreJoinMeeting from "./components/PreJoinMeeting.tsx";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import type { MeetingSettings } from "./components/PreJoinMeeting";
import { meetingAPI } from "./apis/meetingApi.ts";

interface IUser {
  id: string;
  email: string;
  displayName: string;
}

// Định nghĩa kiểu dữ liệu cho Meeting
interface MeetingData {
  peerId?: string;
  title?: string;
  meetingType?: "instant" | "scheduled";
  startTime?: string;
}

interface JoinMeetingData {
  roomId: string;
  peerId?: string;
}

interface MeetingResponse {
  roomId: string;
  token: string;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/otp" element={<OTPWrapper />} />
        <Route path="/home" element={<HomeWrapper />} />
        <Route path="/meeting/:roomId" element={<AppMeetingWrapper />} />
        <Route path="/pre-join" element={<PreJoinMeetingWrapper />} />
      </Routes>
    </Router>
  );
}

// Wrapper cho login page
function LoginWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <LoginPage
      initEmail={email}
      onSwitchToOTP={(enteredEmail) => {
        navigate("/otp", { state: { email: enteredEmail } });
      }}
    />
  );
}

//Wrapper cho OTP page
function OTPWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <OTPPage
      email={email}
      onBack={() => navigate("/login", { state: { email } })}
      onSwitchHome={() => navigate("/home", { state: { email } })}
    />
  );
}

//Wrapper cho HomePage
function HomeWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  // Xử lý OAuth redirect (Google/Outlook login)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dataParam = params.get("data");

    if (dataParam) {
      try {
        // Parse data từ URL params
        const decodedData = decodeURIComponent(dataParam);
        const userData = JSON.parse(decodedData);

        console.log("OAuth login data:", userData);

        // Lưu vào localStorage
        if (userData.accessToken) {
          localStorage.setItem("accessToken", userData.accessToken);
        }
        if (userData.user) {
          localStorage.setItem(`user`, JSON.stringify(userData.user));
          localStorage.setItem(`peerId`, userData.user.userId);
          // console.log(localStorage.getItem(`peerId${email}`))
          localStorage.setItem(`email`, userData.user.email);
          localStorage.setItem(`displayName`, userData.user.displayName);
        }

        // Clear query params sau khi đã lưu
        navigate("/home", {
          replace: true,
          state: { email: userData.user?.email || "" },
        });
      } catch (error) {
        console.error("Lỗi khi parse OAuth data:", error);
      }
    }
  }, [location.search, navigate]);

  // ====================== CALLBACK cho homepage =======================//
  const handleNewMeeting = async () => {
    try {
      // Gọi API tạo phòng họp
      console.log(localStorage.getItem("peerId"))
      const email = localStorage.getItem("email")
      const meetingData: MeetingData = {
        peerId: localStorage.getItem("peerId") || "",
        title: "Cuộc họp mới",
        meetingType: "instant",
        startTime: new Date().toISOString(),
      };
      console.log(1)
      // createMeeting already returns parsed JSON data { roomId, token }, not a Response object
      const response: MeetingResponse = await meetingAPI.createMeeting(
        meetingData
      );

      if (response && response.roomId && response.token) {
        // ========== LINK với Prejoin =============//
        navigate(`/meeting/${response.roomId}`, {
          state: {
            token: response.token,
            roomId: response.roomId,
            settings: {
              micEnabled: true,
              cameraEnabled: true,
            },
          },
        });
      } else {
        console.error("Không nhận được roomId hoặc token từ API");
        alert("Không thể tạo phòng họp. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo phòng họp:", error);
      alert("Có lỗi xảy ra khi tạo phòng họp.");
    }
  };

  // CALL BACK - Join meeting
  const handleJoinMeeting = async (meetingCode: string) => {
    try {
      const joinData: JoinMeetingData = {
        roomId: meetingCode,
        peerId: localStorage.getItem("peerId") || "",
      };

      console.log("joinData", joinData);

      const token = await meetingAPI.joinMeeting(joinData);

      if (token) {
        navigate("/pre-join", {
          state: {
            token: token,
            roomId: meetingCode,
            displayName: localStorage.getItem("displayName") || "",
          },
        });
      } else {
        console.error("Không nhận được token từ API join");
        alert("Không thể tham gia phòng họp. Vui lòng kiểm tra mã phòng.");
      }
    } catch (error) {
      console.error("Lỗi khi tham gia phòng họp:", error);
      alert("Có lỗi xảy ra khi tham gia phòng họp.");
    }
  };

  return (
    <HomePage
      userEmail={email}
      onNewMeeting={handleNewMeeting}
      onJoinMeeting={handleJoinMeeting}
    />
  );
}

function PreJoinMeetingWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  // ================== CẦN XỬ LÍ THÊM CASE =====================//
  //======= BẤM VÀO NEW MEETINGS THÌ CŨNG RA =======//

  // Nhận data từ HomePage, nhận từ phần nhập
  const { roomId, token, displayName } = location.state || {};

  const [meetingSettings, setMeetingSettings] =
    useState<MeetingSettings | null>(null);

  // Khi user bấm "Tham gia" trong PreJoinMeeting
  const handleJoinMeeting = (settings: MeetingSettings) => {
    setMeetingSettings(settings);

    // Navigate đến meeting page với settings
    navigate(`/meeting/${roomId}`, {
      state: {
        roomId: roomId,
        token: token,
        settings: settings,
      },
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
        initialRoomId={roomId}
        initialPeerId={localStorage.getItem("peerId") || ""}
        initialDisplayName={displayName}
      />
    );
  }
}

// AppMeetingRoom wrapper
function AppMeetingWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const roomId = location.state?.roomId || "";
  const token = location.state?.token || "";
  const settings = location.state?.settings || null;

  console.log(roomId, token);

  const handleLeaveMeeting = () => {
    // Khi leave, quay lại Home, chỗ nay chưa render lại được
    navigate("/home");
  };

  if (!roomId || !token) {
    return <div>Đang tải thông tin phòng họp...</div>;
  }

  return (
    <AppMeeting
      roomId={roomId}
      token={token}
      onLeaveMeeting={handleLeaveMeeting}
      name={localStorage.getItem("displayName") || ""}
      peerId={localStorage.getItem("peerId") || ""}
      settings={settings}
    />
  );
}

export type { MeetingData, JoinMeetingData };
