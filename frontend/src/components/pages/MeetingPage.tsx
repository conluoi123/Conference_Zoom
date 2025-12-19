import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import {MeetingRoom} from "./MeetingRoom";
import { useAuth } from "../../context/AuthContext.tsx";
import type { MeetingSettings } from "./PreJoinMeetingPage.tsx";


export function MeetingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: paramRoomId } = useParams();
  const { user } = useAuth();

  const { roomId: stateRoomId, token, settings } = location.state || {};
  const roomId = stateRoomId || paramRoomId;

  const displayName = user?.displayName || "Guest";
  const peerId = user?.id || "";

  useEffect(() => {
    if (!roomId || !token) {
      navigate("/home");
    }
  }, [roomId, token, navigate]);

  const handleLeaveMeeting = () => {
    navigate("/home");
  };

  if (!roomId || !token) {
    return (
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Đang tải thông tin cuộc họp...</div>
      </div>
    );
  }

  const meetingSettings: MeetingSettings = settings || {
    micEnabled: true,
    cameraEnabled: true,
  };

  return (
    <MeetingProvider
      config={{
        meetingId: roomId,
        participantId: peerId,
        name: displayName,
        micEnabled: meetingSettings.micEnabled,
        webcamEnabled: meetingSettings.cameraEnabled,
        autoConsume: true,
        debugMode: true,
        multiStream: true,
      }}
      token={token}
    >
      <MeetingRoom
        roomId={roomId}
        token={token}
        participantId={peerId}
        participantName={displayName}
        onLeaveMeeting={handleLeaveMeeting}
      />
    </MeetingProvider>
  );
}