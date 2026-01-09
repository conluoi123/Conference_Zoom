import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthService } from "../services/authApi";
import ProtectedLoginRoute from "../routes/ProtectedLoginRoute.tsx";
import { LoginPage } from "../components/pages/LoginPage.tsx";
import { OTPPage } from "../components/pages/OTPPage.tsx";
import { HomePage } from "../components/pages/Home.tsx";
import { MeetingPage } from "../components/pages/VideoSDK.tsx";
import SchedulePage from "../components/pages/Schedule.tsx";
import { PreJoinPage } from "../components/pages/PreJoinMeetingPage.tsx";
import MeetingsPage from "../components/pages/MeetingPage.tsx";
import HistoryPage from "../components/pages/HistoryPage.tsx";
import { RecordingDetail } from "../components/pages/RecordingDetail.tsx";
import NotificationPage from "../components/pages/NotificationPage.tsx";
import { useNavigate } from "react-router-dom";
export default function AppRoutes() {
  const [target, setTarget] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const check = async () => {
      const flag = await AuthService.checkRefreshToken();
      setTarget(flag ? "/home" : "/login");
      if (target === "/login") {
        navigate("/login");
      } else {
        navigate("home");
      }
    };
    check();
  }, [user, target]);

  if (!target) return null;
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`${target}`} replace />} />
      <Route
        path="/login"
        element={
          <ProtectedLoginRoute flag={target !== "/login"}>
            <LoginPage />
          </ProtectedLoginRoute>
        }
      />
      <Route path="/otp" element={<OTPPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/meeting/:roomId" element={<MeetingPage />} />
      <Route path="/pre-join" element={<PreJoinPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/meet" element={<MeetingsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/recordings/:sessionId" element={<RecordingDetail />} />
      <Route path="/notification" element={<NotificationPage />} />
    </Routes>
  );
}
