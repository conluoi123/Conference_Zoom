import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./components/pages/LoginPage.tsx";
import { OTPPage } from "./components/pages/OTPPage.tsx";
import { HomePage } from "./components/pages/Home.tsx";
import { MeetingPage } from "./components/pages/VideoSDK.tsx";
import SchedulePage from "./components/pages/Schedule.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { PreJoinPage } from "./components/pages/PreJoinMeetingPage.tsx";
import { Toaster } from "sonner";
import MeetingsPage from "./components/pages/MeetingPage.tsx";
import HistoryPage from "./components/pages/HistoryPage.tsx";
import { RecordingDetail } from "./components/pages/RecordingDetail.tsx";
import { SocketListener } from "./context/SocketContext.tsx";
import NotificationPage from "./components/pages/NotificationPage.tsx";
import { AuthService } from "./services/authApi.ts";
import { useEffect, useState } from "react";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
export default function App() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const flag = await AuthService.checkRefreshToken();
      setTarget(flag ? "/home" : "/login");
    };

    check();
  }, []);

  if (!target) return null;
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <SocketListener />
          <Toaster position="bottom-right" richColors />
          <Routes>
            <Route path="/" element={<Navigate to={`${target}`} replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp" element={<OTPPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route
              path="/meeting/:roomId"
              element={
                <ProtectedRoute>
                  <MeetingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pre-join"
              element={
                <ProtectedRoute>
                  <PreJoinPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meet"
              element={
                <ProtectedRoute>
                  <MeetingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recordings/:sessionId"
              element={
                <ProtectedRoute>
                  <RecordingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/settings/profile" element={<ProfileModal onClose={() => {}} chosenPage="profile"/>} />
            <Route path="/settings/notifications" element={<ProfileModal onClose={() => {}} chosenPage="notifications"/>} /> */}
            {/* <Route path="/settings/privacy" element={<ProfileModal onClose={() => {}} chosenPage="privacy"/>} />
            <Route path="/settings/meetings" element={<ProfileModal onClose={() => {}} chosenPage="meetings"/>} /> */}
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
