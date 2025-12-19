import React, { useEffect, useRef } from "react";
import { useParticipant, useStream } from "@videosdk.live/react-sdk";
import { MicOff } from "lucide-react";

export const ParticipantTile = React.memo(({ participantId }: { participantId: string }) => {
  const { webcamStream, webcamOn, micStream, micOn, isLocal, displayName } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const webcamStreamState = useStream(webcamStream?.id);
  const micStreamState = useStream(micStream?.id);


  useEffect(() => {
    const videoElement = videoRef.current; 
    if(videoElement && webcamStream && !webcamStreamState?.paused) {
        const existingStream = videoElement.srcObject as MediaStream; 
        if (!existingStream?.id || webcamStream.id) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(webcamStream.track);
            videoElement.srcObject = mediaStream;
            videoElement.play().catch((err)=> {
                if(err.name !== "AbortError" ) {
                    console.error("Video play error: ", err); 
                }
            })

        }
    }
  }, [webcamStream, webcamStreamState?.paused, participantId]);
  

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-800 aspect-video ring-1 ring-white/10">
      {webcamOn && webcamStream ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full bg-linear-to-br from-indigo-500 to-purple-600">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
            {displayName?.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">
        {!micOn && <MicOff className="w-4 h-4 text-red-500" />}
        <span className="text-white text-xs font-medium">{displayName} {isLocal && "(Bạn)"}</span>
      </div>
    </div>
  );
});