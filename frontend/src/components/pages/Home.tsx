import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Video,
  Plus,
  Calendar,
  Circle,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { MainLayout } from "../../layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { meetingAPI } from "../../services/meetingApi";
import { scheduleApi } from "@/services/scheduleApi";
import { LoadingScreen } from "../ui/LoadingScreen";

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
  hostId: string;
  token: string;
}

// Helper function để format date key theo local timezone
const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
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

  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalMeetings, setModalMeetings] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loading, setLoading] = useState(true);
  // if (!user) {
  //   navigate("/login");
  // }
  useEffect(() => {
    if (!user?.id) return;

    const fetchMeetings = async () => {
      try {
        const res = await scheduleApi.getUpcomingSchedule({
          userId: user.id,
        });
        setUpcomingMeetings(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSchedules = async () => {
      try {
        setLoadingSchedule(true);
        const res = await scheduleApi.getListSchedule({
          userId: user.id,
        });
        setSchedules(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchSchedules();
  }, [user?.id]);

  // Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dataParam = params.get("data");
    if (dataParam) {
      try {
        const decodedData = decodeURIComponent(dataParam);
        const userData = JSON.parse(decodedData);
        if (userData.accessToken && userData.user) {
          login(
            {
              id: userData.user.userId,
              email: userData.user.email,
              displayName: userData.user.displayName,
              avatar: userData.user.avatar,
            },
            userData.accessToken
          );
        }
        navigate("/home", { replace: true });
      } catch (error) {
        console.error("OAuth data parse error:", error);
      }
    }
  }, [location.search, navigate]);

  const handleNewMeeting = async () => {
    if (!user) return;
    try {
      const meetingData: MeetingData = {
        peerId: user?.id || "",
        title: "Cuộc họp mới",
        meetingType: "instant",
        startTime: new Date().toISOString(),
      };
      const response: MeetingResponse = await meetingAPI.createMeeting(
        meetingData
      );
      if (response.roomId && response.token) {
        navigate(`/meeting/${response.roomId}`, {
          state: {
            token: response.token,
            roomId: response.roomId,
            hostId: response.hostId,
            displayName: user?.displayName || "",
            settings: {
              allowJoin: false,
              allowShareScreen: true,
              allowChat: true,
              allowMic: true,
              allowCam: true,
            },
          },
        });
      }
    } catch (error) {
      console.error("Create meeting error:", error);
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
        peerId: user?.id || "",
      };
      const room = await meetingAPI.joinMeeting(joinData);

      if (room) {
        navigate("/pre-join", {
          state: {
            token: room.token,
            roomId,
            hostId: room.hostId,
            displayName: user?.displayName || "",
            settings: room.settings,
          },
        });
      }
    } catch (error) {
      console.error("Join meeting error:", error);
      alert("Không thể tham gia phòng họp. Vui lòng kiểm tra mã phòng.");
    }
  };

  const extractRoomIdFromLink = (link: string): string => {
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

  // Group schedules by date using local timezone
  const schedulesByDate = schedules.reduce((acc: any, item: any) => {
    const dateObj = new Date(item.startTime);
    const dateKey = getLocalDateKey(dateObj);

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  // const selectedDateKey = getLocalDateKey(currentDay);
  if (loading || loadingSchedule) {
    return <LoadingScreen message="" variant="light" />;
  }
  
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

              <Link
                to="/schedule"
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow group flex flex-col items-center"
              >
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <p className="text-gray-900 font-medium text-sm">Schedule</p>
              </Link>
            </div>

            {/* Recordings & History */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <Link
                to="/history"
                className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow items-start"
              >
                <div className="flex gap-4">
                  <div className="bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Circle className="w-6 h-6 text-red-600 fill-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 font-medium mb-1">History</p>
                    <p className="text-gray-500 text-sm">Lịch sử cuộc họp và bản ghi</p>
                  </div>
                </div>
              </Link>
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
                  const dateObj = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  );
                  const dateKey = getLocalDateKey(dateObj);
                  const hasMeeting = schedulesByDate[dateKey]?.length > 0;
                  const isSelected =
                    currentDay.getDate() === day &&
                    currentDay.getMonth() === currentMonth.getMonth() &&
                    currentDay.getFullYear() === currentMonth.getFullYear();

                  return (
                    <button
                      key={day}
                      className={`relative h-9 rounded-lg text-sm font-medium transition-colors ${isSelected
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      onClick={() => {
                        setCurrentDay(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day
                          )
                        )
                        setOpenModal(true);
                        if(hasMeeting)
                        setModalMeetings(schedulesByDate[dateKey]);
                      }
                      }
                    >
                      {day}
                      {hasMeeting && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full absolute left-1/2 -translate-x-1/2 bottom-1"></span>
                      )}
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
                <button
                  onClick={() => navigate("/schedule")}
                  className="cursor-pointer text-blue-600 text-sm font-medium hover:underline"
                >
                  + Schedule
                </button>
              </div>

              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-start gap-3 p-3 bg-gray-100 rounded-xl"
                    >
                      <div className="bg-gray-300 w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="bg-gray-300 h-4 w-2/3 rounded" />
                        <div className="bg-gray-200 h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))
                  : upcomingMeetings.slice(0, 3).map((meeting, index) => (
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
                          <span>
                            {new Date(meeting.startTime).toLocaleString(
                              "vi-VN",
                              {
                                weekday: "long",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {meeting.duration && (
                            <>
                              <span>•</span>
                              <span>{meeting.duration}</span>
                            </>
                          )}
                          {meeting.participants && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {meeting.participants}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => navigate("/meet")}
                className="w-full mt-4 text-blue-600 text-sm font-medium hover:underline cursor-pointer"
              >
                See More
              </button>
            </div>
          </div>
        </div>

        {/* Meeting Detail Modal */}
        {openModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[480px] max-w-[90vw]">
              {/* Header */}
              <div className="bg-blue-500 px-4 py-3 rounded-t-2xl flex justify-between items-center">
                <p className="font-semibold text-black">
                  Lịch họp ngày {currentDay.toLocaleDateString("vi-VN")}
                </p>
                <button
                  className="text-gray-500 hover:text-black"
                  onClick={() => setOpenModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {modalMeetings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Không có cuộc họp nào
                  </p>
                ) : (
                  modalMeetings.map((m, i) => (
                    <div key={i} className="border-b pb-3 last:border-b-0">
                      <p className="font-semibold text-blue-900">{m.title}</p>
                      <div className="text-sm text-gray-600 mt-1">
                        ⏰{" "}
                        {new Date(m.startTime).toLocaleString("vi-VN", {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sự kiện lịch họp
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 text-right">
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-green-700 hover:underline font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
