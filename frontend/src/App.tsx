import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedLoginRoute from "./routes/ProtectedLoginRoute.tsx";
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
export default function App() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const flag = await AuthService.checkRefreshToken();
        setTarget(flag ? "/home" : "/login");
      } catch (error) {
        setTarget("/login")
      }
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
            <Route
              path="/login"
              element={
                <ProtectedLoginRoute flag={target === "/login"}>
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
            <Route
              path="/recordings/:sessionId"
              element={<RecordingDetail />}
            />
            <Route path="/notification" element={<NotificationPage />} />
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
