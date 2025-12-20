import React, { useEffect, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { MicOff, Monitor } from "lucide-react";

export const ParticipantTile = React.memo(({ participantId }: { participantId: string }) => {
  const { 
    webcamStream, 
    webcamOn, 
    micStream, 
    micOn, 
    isLocal, 
    displayName,
    screenShareStream,
    screenShareOn,
  } = useParticipant(participantId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);

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
  }, [webcamStream, webcamOn, screenShareOn]); // Chỉ chạy lại khi stream hoặc trạng thái cam thay đổi

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

  // 3. Xử lí share screen stream
  useEffect(() => {
    const screenElement = screenShareRef.current;

    if (screenElement) {
      if (screenShareOn && screenShareStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(screenShareStream.track);
        screenElement.srcObject = mediaStream;

        screenElement.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Screen share play error");
          }
        });
      } else {
        screenElement.srcObject = null;
      }
    }
  }, [screenShareStream, screenShareOn]);

  const showScreenShare = screenShareOn && screenShareStream;
  const showWebcam = !showScreenShare && webcamOn && webcamStream;
  const showAvatar = !showScreenShare && !showWebcam;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-800 aspect-video ring-1 ring-white/10">
      
      {/* Audio luôn phát (ẩn) */}
      <audio ref={audioRef} autoPlay playsInline controls={false} />

      {/* 1. SCREEN SHARE (Ưu tiên cao nhất) */}
      {showScreenShare && (
        <>
          <video 
            ref={screenShareRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain bg-black"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 px-3 py-2 rounded-lg shadow-lg">
            <Monitor className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">
              Đang chia sẻ màn hình
            </span>
          </div>
        </>
      )}

      {/* 2. WEBCAM */}
      {showWebcam && (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={true}
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      )}

      {/* 3. AVATAR (fallback) */}
      {showAvatar && (
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