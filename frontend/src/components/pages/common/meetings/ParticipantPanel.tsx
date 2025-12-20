import { useMeeting } from "@videosdk.live/react-sdk";
import { X, Mic, MicOff, Video, VideoOff, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

interface ParticipantPanelProps {
  onClose: () => void;
}

export function ParticipantPanel({ onClose }: ParticipantPanelProps) {
  // Lấy danh sách participants từ VideoSDK
  const { participants, localParticipant } = useMeeting();

  // Chuyển Map thành mảng để dễ render
  const allParticipants = Array.from(participants.values());

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col h-full shadow-2xl z-40"
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white">Mọi người ({allParticipants.length})</h2>
        <button onClick={onClose} className="hover:bg-gray-800 p-2 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Search (Tùy chọn - Giống Meet) */}
      <div className="p-4">
        <input 
          type="text" 
          placeholder="Tìm người" 
          className="w-full bg-gray-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-gray-300"
        />
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto px-2">
        <p className="text-xs font-medium text-gray-400 px-3 py-2 uppercase tracking-wider">Trong cuộc họp</p>
        
        {allParticipants.map((participant) => {
          // Lấy trạng thái Mic và Camera của từng người
          const isMicOn = participant.micOn;
          const isWebcamOn = participant.webcamOn;

          return (
            <div 
              key={participant.id} 
              className="flex items-center gap-3 p-3 hover:bg-gray-800/60 rounded-xl transition-all group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
                {participant.displayName.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-200">
                  {participant.displayName} 
                  {participant.id === localParticipant?.id && <span className="text-gray-500 ml-1">(Bạn)</span>}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {participant.id === localParticipant?.id ? "Người tổ chức" : "Cộng tác viên"}
                </p>
              </div>

              {/* Status Icons (Mic/Cam) */}
              <div className="flex items-center gap-2">
                <div className={`${isMicOn ? 'text-gray-400' : 'text-red-500'}`}>
                  {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                </div>
                <div className={`${isWebcamOn ? 'text-gray-400' : 'text-red-500'}`}>
                  {isWebcamOn ? <Video size={18} /> : <VideoOff size={18} />}
                </div>
                
                {/* Menu (Dấu 3 chấm) */}
                <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}