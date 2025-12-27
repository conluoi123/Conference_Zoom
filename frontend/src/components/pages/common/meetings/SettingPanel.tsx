import { X, ShieldCheck, Mic, Video, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomSettings: {
    allowChat: boolean;
    allowMic: boolean;
    allowWebcam: boolean;
  };
  onUpdateSettings: (key: string, value: boolean) => void;
}

export const SettingsPanel = ({
  isOpen,
  onClose,
  roomSettings,
  onUpdateSettings,
}: SettingsPanelProps) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-80 h-full bg-gray-900 border-l border-white/10 flex flex-col shadow-2xl z-40"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
          <ShieldCheck className="text-blue-500" size={20} />
          Cài đặt cho Host
        </h2>
        <button onClick={onClose} className="hover:bg-gray-800 p-1 rounded-full text-gray-400">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Quyền của người tham gia</p>

        {/* Quyền Micro */}
        <div className="flex items-center justify-between group">
          <div className="flex gap-3 items-center">
            <Mic size={18} className="text-gray-400 group-hover:text-blue-400" />
            <div>
              <Label className="text-sm font-medium text-white">Bật Micro</Label>
              <p className="text-[10px] text-gray-500">Cho phép mọi người nói</p>
            </div>
          </div>
          <Switch 
            checked={roomSettings.allowMic} 
            onCheckedChange={(val) => onUpdateSettings("allowMic", val)} 
          />
        </div>

        {/* Quyền Camera */}
        <div className="flex items-center justify-between group">
          <div className="flex gap-3 items-center">
            <Video size={18} className="text-gray-400 group-hover:text-blue-400" />
            <div>
              <Label className="text-sm font-medium text-white">Bật Camera</Label>
              <p className="text-[10px] text-gray-500">Cho phép dùng webcam</p>
            </div>
          </div>
          <Switch 
            checked={roomSettings.allowWebcam} 
            onCheckedChange={(val) => onUpdateSettings("allowWebcam", val)} 
          />
        </div>

        {/* Quyền Chat */}
        <div className="flex items-center justify-between group">
          <div className="flex gap-3 items-center">
            <MessageSquare size={18} className="text-gray-400 group-hover:text-blue-400" />
            <div>
              <Label className="text-sm font-medium text-white">Gửi tin nhắn</Label>
              <p className="text-[10px] text-gray-500">Cho phép trò chuyện</p>
            </div>
          </div>
          <Switch 
            checked={roomSettings.allowChat} 
            onCheckedChange={(val) => onUpdateSettings("allowChat", val)} 
          />
        </div>
      </div>

      <div className="p-4 bg-blue-600/5 border-t border-white/5">
        <p className="text-[10px] text-gray-400 text-center italic">
          Các thay đổi sẽ có hiệu lực ngay lập tức với tất cả mọi người.
        </p>
      </div>
    </motion.div>
  );
};