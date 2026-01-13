import { useMeeting } from "@videosdk.live/react-sdk";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Share2,
  Users,
  Settings,
  Plus,
  CameraOff,
  Monitor,
  MonitorStop,
  MonitorPlay,
  Image,
  Subtitles,
  Circle,
  Square
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo } from "react";
interface MeetingControlsProps {
  onLeaveMeeting: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onOpenParticipant: () => void;
  isOpen: boolean;
  onToggleBackground: () => void;
  isBackgroundOpen: boolean;
  onTogglePip: () => void;
  isPipActive: boolean;
  onOpenSettings: () => void;
  isSettingOpen: boolean;
  isHost: boolean;
  onToggleRecording: () => void;
  isRecording: boolean;
  onToggleTranscript: () => void;
  isTranscripting: boolean;
  onShareClick: () => void;
}

export const MeetingControls = memo(({
  onLeaveMeeting,
  onToggleChat,
  isChatOpen,
  onOpenParticipant,
  isOpen,
  onTogglePip,
  isPipActive,
  // chỉnh sửa lại logic chỉ Host mới có nút cài đặt
  onOpenSettings,
  isSettingOpen,
  isHost,
  onToggleBackground,
  isBackgroundOpen,
  isRecording,
  onToggleRecording,
  isTranscripting,
  onToggleTranscript,
  onShareClick,
}: MeetingControlsProps) => {
  const {
    leave,
    toggleMic,
    toggleWebcam,
    toggleScreenShare,
    localScreenShareOn,
    localMicOn,
    localWebcamOn,
  } = useMeeting();

  const handleLeave = () => {
    leave();
    onLeaveMeeting();
  };

  const handleBackgroundClick = () => {
    onToggleBackground();
    // setShowMoreMenu(false);
  };

  const handleSubtitleClick = () => {
    onToggleTranscript()
    // setShowMoreMenu(false);
  };

  const ControlButton = ({
    icon: Icon,
    label,
    onClick,
    variant = "default",
  }: {
    icon: any;
    label: string;
    onClick?: () => void;
    variant?: "default" | "danger" | "success";
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-105 w-9 h-9 md:w-10 md:h-10 rounded-full${variant === "danger"
            ? "bg-red-600 hover:bg-red-700"
            : "hover:bg-gray-700 text-white"
            }`}
        >
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-gray-700 text-white border-gray-600"
      >
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
          {/*  Chia sẻ */}
          {isHost && (
            <ControlButton icon={Share2} label="Chia sẻ" onClick={onShareClick} />
          )}

          {/* Trò chuyện */}
          <ControlButton
            onClick={onToggleChat}
            icon={MessageSquare}
            label="Trò chuyện"
            variant={isChatOpen ? "success" : "default"}
          />

          {/* Participants */}
          <ControlButton
            icon={Users}
            label="Người tham gia"
            variant={isChatOpen ? "success" : "default"}
            onClick={onOpenParticipant}
          />

          {/* Recording */}
          {/* Chỉ host mới thấy nút này */}
          {isHost && (
            <ControlButton
              icon={isRecording ? Square : Circle}
              label={isRecording ? "Dừng ghi hình" : "Ghi hình"}
              onClick={onToggleRecording}
              variant={isRecording ? "danger" : "default"}
            ></ControlButton>
          )}

          {/* Settings */}
          {/* Chỉ host mới thấy nút này */}
          {isHost && (
            <ControlButton
              icon={Settings}
              label="Cài đặt"
              onClick={onOpenSettings}
              variant={isSettingOpen ? "success" : "default"}
            ></ControlButton>
          )}

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-3 rounded-full hover:bg-gray-700 text-white transition-all ">
                <Plus className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-900 border-gray-700 text-white w-56 p-2 rounded-xl shadow-2xl backdrop-blur-md"
            >
              {/* Mục Hình trong hình */}
              <DropdownMenuItem
                onClick={onTogglePip}
                className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                <MonitorPlay className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Hình trong hình</span>
              </DropdownMenuItem>

              {/* Mục Chia sẻ màn hình */}
              <DropdownMenuItem
                onClick={() => toggleScreenShare()}
                className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                {localScreenShareOn ? (
                  <MonitorStop className="w-4 h-4 text-red-400" />
                ) : (
                  <Monitor className="w-4 h-4 text-green-400" />
                )}
                <span className="text-sm">
                  {localScreenShareOn ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleBackgroundClick}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
              >
                <Image className="w-4 h-4" />
                <span>Chỉnh background</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSubtitleClick}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-700"
              >
                <Subtitles className="w-4 h-4" />
                <span>{isTranscripting ? "Tắt phụ đề" : "Bật phụ đề"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer border-t border-gray-800 mt-1">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Cài đặt</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
});
