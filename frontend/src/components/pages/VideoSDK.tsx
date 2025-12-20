import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { MeetingRoom } from "./MeetingRoom.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import LoadMeeting from "./common/meetings/LoadMeeting.tsx";

export function MeetingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: paramRoomId } = useParams();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { roomId: stateRoomId, token, settings } = location.state || {};
  const roomId = stateRoomId || paramRoomId;
  const displayName = user?.displayName || "Guest";
  const peerId = user?.id;
  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!roomId || !token) {
      navigate("/home");
    }
  }, [roomId, token, navigate]);

  const handleLeaveMeeting = () => {
    navigate("/home");
  };

  return (
    <MeetingProvider
      config={{
        meetingId: roomId,
        participantId: peerId,
        name: displayName,
        micEnabled: settings.allowMic,
        webcamEnabled: settings.allowCam,
        autoConsume: true,
        debugMode: true,
        multiStream: true,
      }}
      token={token}
    >
      <MeetingRoom
        roomId={roomId}
        onLeaveMeeting={handleLeaveMeeting}
        onToggleChat={handleToggleChat}
        onChatOpen={isChatOpen}
      />
    </MeetingProvider>
  );
}
