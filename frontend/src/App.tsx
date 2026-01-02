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
// import { ProfileModal } from "./pages/ProfilePage/ProfileModal.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { PreJoinPage } from "./components/pages/PreJoinMeetingPage.tsx";
import { Toaster } from "sonner"
import MeetingsPage from "./components/pages/MeetingPage.tsx";
import HistoryPage from "./components/pages/HistoryPage.tsx";
import { RecordingDetail } from "./components/pages/RecordingDetail.tsx";
import { SocketListener } from "./context/SocketContext.tsx";
import NotificationPage from "./components/pages/NotificationPage.tsx";
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <SocketListener />
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp" element={<OTPPage />} />
            <Route path="/home" element={
              <HomePage />
            } />
            <Route path="/meeting/:roomId" element={<MeetingPage />} />
            <Route path="/pre-join" element={<PreJoinPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/meet" element={<MeetingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/recordings/:sessionId" element={<RecordingDetail />} />
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
