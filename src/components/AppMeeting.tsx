// AppMeeting.tsx
import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingRoom from "./MeetingRoom";
interface AppMeetingProps {
  roomId: string;       // ID phòng từ backend
  token: string;        // token từ backend
  onLeaveMeeting: () => void;
  name: string;         // tên người dùng, bắt buộc cho MeetingProvider
}

export default function AppMeeting({ roomId, token, onLeaveMeeting, name }: AppMeetingProps) {
  return (
    <MeetingProvider
      config={{
        meetingId: roomId,   // ID phòng họp
        name: name,          // tên người dùng
        micEnabled: true,    // optional
        webcamEnabled: true, // optional
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
