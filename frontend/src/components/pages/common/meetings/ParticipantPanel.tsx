import { useMeeting } from "@videosdk.live/react-sdk";
import { X, Mic, MicOff, Video, VideoOff, MoreVertical, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface JoinRequest {
  participantId: string; 
  name: string; 
  deny: () => void; 
  allow : () => void; 
}
interface ParticipantPanelProps {
  onClose: () => void;
  joinedRequest : JoinRequest[]; 
  setJoinRequests: React.Dispatch<React.SetStateAction<JoinRequest[]>>; // hàm cập nhật state
}

export function ParticipantPanel({ onClose, joinedRequest, setJoinRequests }: ParticipantPanelProps) {
  // Lấy danh sách participants từ VideoSDK
  const { participants, localParticipant } = useMeeting();
  // Chuyển Map thành mảng để dễ render
  const allParticipants = Array.from(participants.values());
  // xử lí phần request join 
  const handleAction = (id:string, action : 'allow' | 'deny') => {
    const request = joinedRequest.find(req => req.participantId===id); 
    if(request) {
      if(action ==='allow') request.allow();
      else {request.deny()};
      //xử lí xong thì pop ra khỏi hàng đợi
      setJoinRequests(prev => prev.filter(req => req.participantId !== id));
    }
  }
  const { user } = useAuth();
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
        {joinedRequest.length >0 &&(
          <div className="mb-4 bg-blue-600/5 border-b border-blue-600/20">
            <p className="text-[11px] font-bold px-4 py-2">
              Đang chờ duyệt {joinedRequest.length}
            </p>
            {joinedRequest.map((req)=> (
              <div key={req.participantId} className="flex items-center gap-3 px-4 py-3 bg-blue-600/10">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {req.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-medium truncate text-white">{req.name}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(req.participantId, 'allow')}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-colors"
                  >
                    <Check size={14} />
                  </button>
                  <button 
                    onClick={() => handleAction(req.participantId, 'deny')}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}
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
              {user?.avatar ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
                  {participant.displayName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-200">
                  {participant.displayName}
                  {participant.id === localParticipant?.id && (
                    <span className="text-gray-500 ml-1">(Bạn)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {participant.id === localParticipant?.id
                    ? "Người tổ chức"
                    : "Cộng tác viên"}
                </p>
              </div>

              {/* Status Icons (Mic/Cam) */}
              <div className="flex items-center gap-2">
                <div
                  className={`${isMicOn ? "text-gray-400" : "text-red-500"}`}
                >
                  {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                </div>
                <div
                  className={`${isWebcamOn ? "text-gray-400" : "text-red-500"}`}
                >
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