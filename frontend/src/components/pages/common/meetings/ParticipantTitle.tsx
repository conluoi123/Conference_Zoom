import React, { useEffect, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { MicOff, Monitor } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
    isActiveSpeaker, // VideoSDK provides this - true when participant is speaking
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
  }, [webcamStream, webcamOn, screenShareOn]);

  // 2. Xử lý Audio Stream
  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      if (micOn && micStream && !isLocal) {
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
  const { user } = useAuth();

  // Speaking indicator - only show when actively speaking
  const isSpeaking = isActiveSpeaker && micOn;

  // Gradient color palette - 12 diverse colors
  const gradientColors = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-emerald-600',
    'from-yellow-500 to-orange-600',
    'from-red-500 to-pink-600',
    'from-purple-500 to-fuchsia-600',
    'from-teal-500 to-cyan-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-violet-500 to-purple-600',
    'from-sky-500 to-blue-600',
    'from-lime-500 to-green-600',
  ];

  // Hash function
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const gradientClass = gradientColors[hashString(participantId) % gradientColors.length];

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-800 aspect-video transition-all duration-300 ${isSpeaking
      ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/50 rounded-2xl'
      : showWebcam
        ? 'ring-1 ring-blue-400/40 rounded-2xl'
        : 'ring-1 ring-white/10 rounded-2xl'
      }`}>
      {/* Audio luôn phát (ẩn) */}
      <audio ref={audioRef} autoPlay playsInline controls={false} />

      {/* 1. SCREEN SHARE */}
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
          className="w-full h-full object-cover transform scale-x-[-1] rounded-2xl"
        />
      )}

      {/* 3. AVATAR (fallback) */}
      {showAvatar && (
        <div className={`flex items-center justify-center h-full bg-gradient-to-br ${gradientClass} relative`}>
          {/* Pulsing wave rings when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/20 animate-ping" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center animation-delay-150">
                <div className="w-28 h-28 rounded-full bg-white/10 animate-ping" />
              </div>
            </>
          )}

          {user?.avatar ? (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white z-10">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white z-10">
              {displayName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
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