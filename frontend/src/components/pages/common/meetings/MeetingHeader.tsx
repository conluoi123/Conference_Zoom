import { BiLogoZoom } from "react-icons/bi";
import { Copy, Check, Info, X, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MeetingHeaderProps {
  roomId: string;
  onLeave: () => void;
  isRecording?: boolean;
}

export const MeetingHeader = ({ roomId, onLeave, isRecording = false }: MeetingHeaderProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Timer for recording
  useEffect(() => {
    let interval: number | null = null;

    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRecording]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyRoomId = () => {
    // Logic sao chép link hoặc mã phòng
    const meetingLink = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(meetingLink);

    setIsCopied(true);
    toast.success("Đã sao chép link cuộc họp!");

    // Reset icon sau 2 giây
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <header className="bg-gray-900/50 border-b border-white/10 px-6 py-3 flex items-center justify-between backdrop-blur-md z-10">
        {/* Thông tin phòng họp */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <BiLogoZoom className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-white font-semibold text-sm leading-tight">ZUS Workplace</h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs font-mono">{roomId}</span>
              <button
                onClick={copyRoomId}
                className="text-gray-500 hover:text-blue-400 transition-colors"
              >
                {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Recording indicator - only show when recording */}
        {isRecording && (
          <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-300">REC</span>
            <div className="w-px h-3 bg-white/20" />
            <span className="text-xs text-gray-400 font-mono">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all">
                <Info className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Thông tin cuộc họp</TooltipContent>
          </Tooltip>

          <button
            onClick={onLeave}
            className="ml-2 p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>
    </TooltipProvider>
  );
};