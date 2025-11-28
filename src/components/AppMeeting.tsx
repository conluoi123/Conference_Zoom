// AppMeeting.tsx
import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingRoom from "./MeetingRoom";
interface AppMeetingProps {
  roomId: string;       // ID phòng từ backend
  token: string;        // token từ backend
  onLeaveMeeting: () => void;
  name: string;         // tên người dùng, bắt buộc cho MeetingProvider
  micId?: string;       // ID thiết bị microphone
  cameraId?: string;    // ID thiết bị camera
  micEnabled?: boolean; // trạng thái mic
  cameraEnabled?: boolean; // trạng thái camera
}

export default function AppMeeting({ 
  roomId, 
  token, 
  onLeaveMeeting, 
  name, 
  micId, 
  cameraId, 
  micEnabled = true, 
  cameraEnabled = true 
}: AppMeetingProps) {
  
  console.log('=== AppMeeting Debug ===');
  console.log('Received props:');
  console.log('  - roomId:', roomId);
  console.log('  - token:', token);
  console.log('  - name:', name);
  console.log('  - micId:', micId);
  console.log('  - cameraId:', cameraId);
  console.log('  - micEnabled:', micEnabled);
  console.log('  - cameraEnabled:', cameraEnabled);
  
  return (
    <MeetingProvider
      config={{
        meetingId: roomId,   // ID phòng họp
        name: name,          // tên người dùng
        micEnabled: micEnabled,    // từ PreJoinMeeting
        webcamEnabled: cameraEnabled, // từ PreJoinMeeting
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
        initialMicId={micId}
        initialCameraId={cameraId}
        initialMicEnabled={micEnabled}
        initialCameraEnabled={cameraEnabled}
        userName={name}
      />
    </MeetingProvider>
  );
}
