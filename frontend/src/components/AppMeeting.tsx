// AppMeeting.tsx
import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingRoom from "./MeetingRoom";
import type { MeetingSettings } from "./PreJoinMeeting";
interface AppMeetingProps {
  roomId: string;       // ID phòng từ backend
  token: string;        // token từ backend
  onLeaveMeeting: () => void;
  name: string;         // tên người dùng, bắt buộc cho MeetingProvider
  peerId: string;
  settings: MeetingSettings;
}

export default function AppMeeting({ roomId, token, onLeaveMeeting, name, peerId, settings }: AppMeetingProps) {
  console.log(peerId);
  return (
    <MeetingProvider
      config={{
        meetingId: roomId,   // ID phòng họp
        participantId: peerId,
        name: name,          // tên người dùng
        micEnabled: settings.micEnabled,    // optional
        webcamEnabled: settings.cameraEnabled, // optional  
        autoConsume: true,   // optional
        debugMode: true      // optional
      }}
      token={token}
    >
      <MeetingRoom
        roomId={roomId}
        token={token}
        onLeaveMeeting={onLeaveMeeting}
        containerWidth="100vw"
        containerHeight="100vh"
      />
    </MeetingProvider>
  );
}
