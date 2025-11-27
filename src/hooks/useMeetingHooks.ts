import { useState, useEffect, useCallback } from "react";

export type Participant = {
  id: string;
  name: string;
  micOn: boolean;
  cameraOn: boolean;
};

export function useMeetingHook() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  // 🔹 Giả lập join room
  const joinMeeting = useCallback(() => {
    setIsJoined(true);
    setParticipants([
      { id: "1", name: "Bạn", micOn: true, cameraOn: false },
      { id: "2", name: "User A", micOn: true, cameraOn: true },
    ]);
  }, []);

  // 🔹 Rời phòng
  const leaveMeeting = useCallback(() => {
    setIsJoined(false);
    setParticipants([]);
  }, []);

  // 🔹 Bật tắt mic
  const toggleMic = useCallback((id: string) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === id ? { ...p, micOn: !p.micOn } : p
      )
    );
  }, []);

  // 🔹 Bật tắt camera
  const toggleCamera = useCallback((id: string) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === id ? { ...p, cameraOn: !p.cameraOn } : p
      )
    );
  }, []);

  return {
    isJoined,
    participants,
    joinMeeting,
    leaveMeeting,
    toggleMic,
    toggleCamera,
  };
}
