// import { useState, useEffect } from "react";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { MeetingProvider } from "@videosdk.live/react-sdk";
// import { MeetingRoom } from "./MeetingRoom.tsx";
// import { useAuth } from "../../context/AuthContext.tsx";
// import LoadMeeting from "./common/meetings/LoadMeeting.tsx";

// export function MeetingPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { roomId: paramRoomId } = useParams();
//   const { user } = useAuth();
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const { roomId: stateRoomId, token, settings } = location.state || {};
//   const roomId = stateRoomId || paramRoomId;
//   const displayName = user?.displayName || "Guest";
//   const peerId = user?.id;
//   const handleToggleChat = () => {
//     setIsChatOpen((prev) => !prev);
//   };

//   useEffect(() => {
//     if (!roomId || !token) {
//       navigate("/home");
//     }
//   }, [roomId, token, navigate]);

//   const handleLeaveMeeting = () => {
//     navigate("/home");
//   };

//   return (
//     <MeetingProvider
//       config={{
//         meetingId: roomId,
//         participantId: peerId,
//         name: displayName,
//         micEnabled: settings.allowMic,
//         webcamEnabled: settings.allowCam,
//         autoConsume: true,
//         debugMode: true,
//         multiStream: true,
//       }}
//       token={token}
//     >
//       <MeetingRoom
//         roomId={roomId}
//         onLeaveMeeting={handleLeaveMeeting}
//         onToggleChat={handleToggleChat}
//         onChatOpen={isChatOpen}
//       />
//     </MeetingProvider>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";
import { MeetingRoom } from "./MeetingRoom.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import LoadMeeting from "./common/meetings/LoadMeeting.tsx";

export const MeetingPage = React.memo(() => {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 1. Lấy dữ liệu an toàn và ghi nhớ vào memo/state để tránh tính toán lại mỗi lần render
  const meetingData = (() => {
    const stateData = location.state;
    const storageData = JSON.parse(sessionStorage.getItem(`meeting_${paramRoomId}`) || "null");
    return stateData || storageData || {};
  })();

  const { 
    token, 
    roomId: stateRoomId, 
    hostId,
    settings,
    displayName: stateName 
  } = meetingData;

  const roomId = stateRoomId || paramRoomId;
  const finalDisplayName = stateName || user?.displayName || "Guest";

  // 2. Kiểm tra điều kiện ngay lập tức
  useEffect(() => {
    if (!roomId || !token) {
      console.error("❌ Thiếu dữ liệu quan trọng để khởi tạo cuộc họp.");
      navigate("/home");
    }
  }, [roomId, token, navigate]);

  if (!token || !roomId) {
    return <LoadMeeting />; 
  }

  return (
    <MeetingProvider
      key={Date.now().toString()}
      config={{
        meetingId: roomId,
        participantId: user?.id || `guest`,
        name: finalDisplayName,
        micEnabled: settings.allowMic,
        webcamEnabled: settings.allowCam,
        autoConsume: true,
        debugMode: true,
        multiStream: true,
        maxResolution: "hd",
      }}
      token={token}
      joinWithoutUserInteraction={settings.allowJoin}
      reinitialiseMeetingOnConfigChange={true}
    >
      
      <MeetingRoom
        roomId={roomId}
        isHost={hostId === user?.id}
        onLeaveMeeting={() => navigate("/home")}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onChatOpen={isChatOpen}
      />
    </MeetingProvider>
  );
})