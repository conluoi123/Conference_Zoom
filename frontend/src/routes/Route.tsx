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
import ProtectedRoute from "./ProtectedRoute.tsx";
export default function AppRoutes() {
  const [target, setTarget] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLogout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const check = async () => {
      try {
        const flag = await AuthService.checkRefreshToken();
        setIsAuth(flag);
        setTarget(flag ? "/home" : "/login");
        if (isLogout) {
          navigate(`${target}`);
        }
      } catch (error) {
        setIsAuth(false);
        setTarget("/login");
      } finally {
        setLoading(false);
      }
      
    };
    check();
  }, [isLogout]);
  if (loading) return null;
  if (!target) return null;
  if (isAuth === null) return null;

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
      <Route
        path="/home"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meeting/:roomId"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <MeetingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pre-join"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <PreJoinPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <SchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meet"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <MeetingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recordings/:sessionId"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <RecordingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification"
        element={
          <ProtectedRoute isAuth={isAuth}>
            <NotificationPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
