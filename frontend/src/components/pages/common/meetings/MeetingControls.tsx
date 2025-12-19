import { useMeeting } from "@videosdk.live/react-sdk";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  MessageSquare, Share2, Users, Settings, Plus, 
  CameraOff
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MeetingControlsProps {
  onLeaveMeeting: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const MeetingControls = ({ 
  onLeaveMeeting, 
  onToggleChat, 
  isChatOpen 
}: MeetingControlsProps) => {
  const { leave, toggleMic, toggleWebcam, localMicOn, localWebcamOn } = useMeeting();

  const handleLeave = () => {
    leave();
    onLeaveMeeting();
  };

  const ControlButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    variant = "default" 
  }: { 
    icon: any, 
    label: string, 
    onClick?: () => void, 
    variant?: "default" | "danger" | "success" 
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-105 w-9 h-9 md:w-10 md:h-10 rounded-full${
            variant === "danger" 
              ? "bg-red-600 hover:bg-red-700" 
              : "hover:bg-gray-700 text-white"
          }`}
        >
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gray-700 text-white border-gray-600">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-black/40 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          
          {/* Mic */}
          <ControlButton 
            onClick={() => toggleMic()}
            icon={localMicOn ? Mic : MicOff}
            label={localMicOn ? "Tắt tiếng" : "Bật tiếng"}
            variant={localMicOn ? "default" : "danger"}
          />

          {/* Camera */}
          <ControlButton 
            onClick={() => toggleWebcam()}
            icon={localWebcamOn ? Video : VideoOff}
            label={localWebcamOn ? "Tắt video" : "Bật video"}
            variant={localWebcamOn ? "default" : "danger"}
          />

          <ControlButton icon={Share2} label="Chia sẻ" />

          <ControlButton 
            onClick={onToggleChat}
            icon={MessageSquare}
            label="Trò chuyện"
            variant={isChatOpen ? "success" : "default"} 
          />

          {/* Participants */}
          <ControlButton icon={Users} label="Người tham gia" />
        
          {/* Settings */}
          <ControlButton icon={Settings} label="Cài đặt" />

          {/* More Actions */}
          <ControlButton icon={Plus} label="Thêm" />

          {/* Leave Button */}
          <ControlButton 
            onClick={handleLeave}
            icon={PhoneOff}
            label="Kết thúc"
            variant="danger"
          />
          
        </div>
      </div>
    </TooltipProvider>
  );
};