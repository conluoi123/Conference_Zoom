import React, { useEffect, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { MicOff } from "lucide-react";

export const ParticipantTile = React.memo(({ participantId }: { participantId: string }) => {
  const { 
    webcamStream, 
    webcamOn, 
    micStream, 
    micOn, 
    isLocal, 
    displayName 
  } = useParticipant(participantId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Xử lý Video Stream
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      if (webcamOn && webcamStream) {
        // Tạo MediaStream mới từ track của VideoSDK
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);

        videoElement.srcObject = mediaStream;
        
        videoElement.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Video play error", err);
          }
        });
      } else {
        // Nếu tắt cam thì clear srcObject để tránh hiện hình cũ
        videoElement.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]); // Chỉ chạy lại khi stream hoặc trạng thái cam thay đổi

  // 2. Xử lý Audio Stream (QUAN TRỌNG: Để nghe tiếng người khác)
  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      if (micOn && micStream && !isLocal) {
        // Chỉ phát âm thanh nếu mic bật VÀ KHÔNG PHẢI LÀ MÌNH (tránh vọng tiếng)
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        audioElement.srcObject = mediaStream;
        
        audioElement.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Audio play error", err);
          }
        });
      } else {
        audioElement.srcObject = null;
      }
    }
  }, [micStream, micOn, isLocal]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-800 aspect-video ring-1 ring-white/10">
      
      {/* Element Audio ẩn để phát tiếng */}
      <audio ref={audioRef} autoPlay playsInline controls={false} />

      {/* Hiển thị Video hoặc Avatar */}
      {webcamOn && webcamStream ? (
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted={true} // Video luôn mute vì tiếng phát qua thẻ audio rồi (tránh echo)
            className="w-full h-full object-cover transform scale-x-[-1]" // Lật gương video
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500 to-purple-600">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
            {displayName?.charAt(0).toUpperCase() || "?"}
          </div>
        </div>
      )}
      
      {/* Label tên và trạng thái mic */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm z-10">
        {!micOn && <MicOff className="w-4 h-4 text-red-500" />}
        <span className="text-white text-xs font-medium truncate max-w-[150px]">
            {displayName} {isLocal && "(Bạn)"}
        </span>
      </div>
    </div>
  );
});