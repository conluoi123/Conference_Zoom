// MeetingRoom.tsx 
import React from "react";
import {useState} from "react";
import { useEffect } from "react";
import {MeetingProvider, useMeeting, Constants} from "@videosdk.live/react-sdk";
import { BiLogoZoom } from "react-icons/bi";
import { Navigate, useNavigate } from "react-router-dom";

import { 
  Video, 
  Plus, 
  Calendar, 
  Upload, 
  Circle, 
  Clock, 
  Bell, 
  Settings, 
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  PhoneOff,
  MessageSquare,
  Share2,
  Camera,
  Mic
} from "lucide-react";

export interface Participant {
  id: number; 
  name: string; 
  initials: string; 
  color?: string; 
}

interface MeetingRoomProps {
  roomId: string;
  // participants: Participant[];  vì SDK có trả về ds 
  onLeaveMeeting: () => void; // callack 
  // thêm token 
  token: string;
  containerWidth: string; 
  containerHeight: string;
}

export default function MeetingRoom(
{
  // thêm token 
  roomId, 
  token, 
  // participants,
  onLeaveMeeting,
  containerWidth="100vw",
  containerHeight="100vh"}: MeetingRoomProps)  
  {
    if (!roomId || !token){
      return (
        <div>Đang tải thông tin cuộc họp.....</div>
      )
    }
    const {
      
      join, 
      leave, 
      toggleMic, 
      toggleWebcam,
      participants: meetingList, // meetingList lưu kq trả về
    } = useMeeting();



    // Chỉ join khi hook sẵn sàng
// chỉ join khi join function sẵn sàng
  useEffect(() => {
    if (!join) return;
    const joinMeeting = async () => {
      try {
        await join();
      } catch (err) {
        console.error(err);
      }
    };
    joinMeeting();
    // dependency chỉ là join function, tránh loop
  }, []);

  // leave khi unmount
  useEffect(() => {
    return () => {
      if (leave) leave();
    };
  }, []); // phải truyền mảng rỗng 

      const navigate = useNavigate();
      function LeaveMeeting() {
        leave(); 
        onLeaveMeeting();
      }


    // cho roomId để làm việc với BE 
    const participants = Object.values(meetingList);
    return(
      <div
        className="bg-gray-900 flex flex-col min-h-screen"
        style = {{width: containerWidth, height: containerHeight}} // dùng thì nó hết báo lỗi  
      >
        {/* Header */}
        <header className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="bg-blue-600 p-2 rounded-2lg">
            <BiLogoZoom className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-semibold">ZUS Workplace</h2>
          </div>
          {/* có thể có nút cài đặt, trạng thái -> thêm sau */}
          <button 
            onClick={onLeaveMeeting}
            className= "text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6 text-white" onClick={onLeaveMeeting} />
          </button>
        </header>


        {/* Các thẻ họp + chưa reponsive cho các màn nhỏ  */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-4">
          {participants.map((participant)=> (
            <div
              key={participant.id}
              className="relative rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className = {`w-32 h-32 rounded-full flex ${participant.color} items-center justify-center text-white text-4xl shadow-2xl font-semibold}`}
                >
                  {/* render avt */}
                  {participant.initials} 
                </div>
                <div
                  className="absolute bottom-4 left-4 bg-black/70 py-3 px-1 rounded-lg flex items-center gap-2"
                >
                  <Circle className="w-3 h-3 text-white" />
                  <span className="text-white text-sm">{participant.name}</span>
                </div>

              </div>
            </div>
          ))}
          {/* Control Bar */}
        </div>
        <div className="bg-gray-800 px-6 py-4 rounded-2xl">
          <div className=" mx-auto flex items-center justify-center gap-4">
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
              <Mic className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Tắt tiếng</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
              <Camera className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Video</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
              <Share2 className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Chia sẻ</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
              <MessageSquare className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Trò chuyện</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
              <Users className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Người tham gia</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Cài đặt</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-lg transition-colors">
              <Plus className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Thêm</span>
            </button>
            <button 
              onClick={LeaveMeeting}

              className="flex flex-col items-center gap-1 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
              <span className="text-white text-xs">Kết thúc</span>
            </button>
          </div>
      </div>
      </div>
    );
}
