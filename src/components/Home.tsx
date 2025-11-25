// import {useState} from 'react'; 
// import { BiLogoZoom } from 'react-icons/bi';
// import { IoVideocamOutline } from "react-icons/io5";
// import { AiOutlinePlus } from "react-icons/ai";
// import { IoCalendarClearOutline } from "react-icons/io5";
// import { MdOutlineFileUpload } from "react-icons/md";
// import {Circle} from "lucide-react"
// import { FaClock } from "react-icons/fa";
import { useState } from "react";
import { BiLogoZoom } from "react-icons/bi";
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
  Users
} from "lucide-react";

interface HomePageProps {
  userEmail: string;
}

export function HomePage({ userEmail }: HomePageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025
  const [showTip, setShowTip] = useState(true);
  const [currentDay, setCurrentDay] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const upcomingMeetings = [
    { title: "Team Standup", time: "09:00 AM", duration: "30 min", participants: 5 },
    { title: "Product Review", time: "02:00 PM", duration: "1 hr", participants: 8 }
  ];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  const goToNextDay = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }
  const goToPreviousDay = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }
  // 
  return (
    <div className="w-[100vw] h-[100vh] bg-gray-50 overflow-y-scroll">  
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4  w-full z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <BiLogoZoom className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">ZUS</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button className="text-blue-600 font-medium text-sm">Home</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">Meetings</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">Team Chat</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">New meeting</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium text-sm">More</button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              NK
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pt-4- flex-1">
        {/* Tip Banner */}
        {showTip && (
          <div className="bg-blue-600 text-white rounded-2xl p-6 mb-8 relative">
            <button
              onClick={() => setShowTip(false)}
              className="absolute top-4 right-4 p-1 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <BiLogoZoom className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Làm việc hiệu quả hơn với ZUS</h3>
                <p className="text-blue-100 text-sm">
                  Nền tảng tích hợp AI giúp bạn quản lý cuộc họp, trò chuyện nhóm, và chia sẻ tài liệu - tất cả trong một nơi.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col items-center">
                <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ">
                  <Video className="w-7 h-7 text-white" />
                </div>
                <p className="text-gray-900  font-medium text-sm">New meeting</p>
              </button>

              <button className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col items-center">
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <p className="text-gray-900 font-medium text-sm">Join</p>
              </button>

              <button className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col items-center">
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <p className="text-gray-900 font-medium text-sm">Schedule</p>
              </button>

              <button className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col items-center">
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <p className="text-gray-900 font-medium text-sm">Share screen</p>
              </button>
            </div>

            {/* Recordings & History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Circle className="w-6 h-6 text-red-600 fill-red-600" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-medium mb-1">Recordings</p>
                  <p className="text-gray-500 text-sm">Cuộc họp đã ghi</p>
                </div>
              </button>

              <button className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-medium mb-1">History</p>
                  <p className="text-gray-500 text-sm">Lịch sử cuộc họp</p>
                </div>
              </button>
            </div>
          </div>

          {/* Right Column - Calendar & Upcoming */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={goToPreviousMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={goToNextMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs font-medium text-gray-500 pb-2">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = 
                    currentDay.getDate() === day &&
                    currentDay.getMonth() === currentMonth.getMonth() &&
                    currentDay.getFullYear() === currentMonth.getFullYear();
                  return (
                    <button
                      key={day}
                      className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))} // click vào ngày cũng cập nhật
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">
                  + Schedule
                </button>
              </div>

              <div className="space-y-3">
                {upcomingMeetings.map((meeting, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {meeting.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{meeting.time}</span>
                        <span>•</span>
                        <span>{meeting.duration}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meeting.participants}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-blue-600 text-sm font-medium hover:underline">
                Open recordings →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

