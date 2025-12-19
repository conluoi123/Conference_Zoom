import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Video,
  Plus,
  Calendar,
  Upload,
  Circle,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import {MainLayout} from "../../layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { meetingAPI } from "../../services/meetingApi";
import { socket } from "@/services/socket";

interface MeetingData {
  peerId?: string;
  title?: string;
  meetingType?: "instant" | "scheduled";
  startTime?: string;
}

interface JoinMeetingData {
  roomId: string;
  peerId?: string;
}

interface MeetingResponse {
  roomId: string;
  token: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  console.log("User from AuthContext in HomePage:", user);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const upcomingMeetings = [
    {
      title: "Team Standup",
      time: "09:00 AM",
      duration: "30 min",
      participants: 5,
    },
    {
      title: "Product Review",
      time: "02:00 PM",
      duration: "1 hr",
      participants: 8,
    },
  ];

  //socket
  useEffect(()=>{socket.connect()},[]);

  // Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dataParam = params.get("data");
    
    if (dataParam) {
      try {
        const decodedData = decodeURIComponent(dataParam);
        const userData = JSON.parse(decodedData);
        console.log("OAuth login data:", userData);
        if (userData.accessToken) {
          localStorage.setItem("accessToken", userData.accessToken);
        }
        if (userData.user) {
          localStorage.setItem("user", JSON.stringify(userData.user));
          localStorage.setItem("peerId", userData.user.userId);
          //debug 
          localStorage.setItem("email", userData.user.email);
          localStorage.setItem("displayName", userData.user.displayName);
        }
        navigate("/home", { replace: true });
      } catch (error) {
        console.error("OAuth data parse error:", error);
      }
    }
  }, [location.search, navigate]);
  console.log("OAuth user data:", user);
  console.log("User in HomePage:", localStorage.getItem("peerId"));
  const handleNewMeeting = async () => {
    try {
      const meetingData: MeetingData = {
        peerId: localStorage.getItem("peerId") || "",
        title: "Cuộc họp mới",
        meetingType: "instant",
        startTime: new Date().toISOString(),
      };
      console.log("Creating meeting with data:", meetingData.peerId);
      const response : MeetingResponse = await meetingAPI.createMeeting(meetingData);
      console.log("Create meeting response:", response);
      if (response.roomId && response.token) {
        navigate(`/meeting/${response.roomId}`, {
          state: {
            token: response.token,
            roomId: response.roomId,
            settings: {
              micEnabled: true,
              cameraEnabled: true,
            },
          },
        });
      }
    } catch (error) {
      console.error("Create meeting error:", error);
      //debug 
      console.log("User: ", user)
      alert("Không thể tạo phòng họp. Vui lòng thử lại.");
    }
  };

  const handleJoinMeeting = async () => {
    const roomId = meetingCode.trim() || extractRoomIdFromLink(meetingLink);
    
    if (!roomId) {
      alert("Vui lòng nhập mã cuộc họp hoặc link hợp lệ");
      return;
    }

    try {
      const joinData: JoinMeetingData = {
        roomId: roomId,
        peerId: localStorage.getItem("peerId") || "",
      };

      
      const token = await meetingAPI.joinMeeting(joinData);

      if (token) {
        navigate("/pre-join", {
          state: {
            token,
            roomId,
            displayName: localStorage.getItem("displayName") || "",
          },
        });
      }
    } catch (error) {
      console.error("Join meeting error:", error);
      alert("Không thể tham gia phòng họp. Vui lòng kiểm tra mã phòng.");
    }
  };

  const extractRoomIdFromLink = (link: string): string => {
    // Extract room ID from meeting link
    // Example: https://zus.com/meeting/abc-def-ghi -> abc-def-ghi
    const match = link.match(/\/meeting\/([^\/\?]+)/);
    return match ? match[1] : "";
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tham gia cuộc họp
                </h2>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setMeetingCode("");
                    setMeetingLink("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã ID cuộc họp
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập mã cuộc họp"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">hoặc</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link mời
                  </label>
                  <input
                    type="text"
                    placeholder="Dán link mời cuộc họp"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleJoinMeeting}
                disabled={!meetingCode.trim() && !meetingLink.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={handleNewMeeting}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col items-center"
              >
                <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-white" />
                </div>
                <p className="text-gray-900 font-medium text-sm">New meeting</p>
              </button>

              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col items-center"
              >
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
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
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
                  <div
                    key={i}
                    className="text-xs font-medium text-gray-500 pb-2"
                  >
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
                      onClick={() =>
                        setCurrentDay(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day
                          )
                        )
                      }
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming
                </h3>
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
      </div>
    </MainLayout>
  );
}
