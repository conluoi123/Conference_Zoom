import {
  Search,
  Plus,
  Video,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MainLayout } from "@/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { meetingAPI } from "@/services/meetingApi";
import { scheduleApi } from "@/services/scheduleApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function MeetingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [allMeetings, setAllMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    setCurrentPage(1);
  }, [meetings]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMeetings = async () => {
      try {
        const res = await scheduleApi.getUpcomingSchedule({
          userId: user.id,
        });

        setMeetings(res || []);
        setAllMeetings(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [user?.id]);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const text = searchText.trim().toLowerCase();

    if (!text) {
      setMeetings(allMeetings);
      return;
    }

    const filtered = allMeetings.filter((m: any) =>
      (m.title || "").toLowerCase().includes(text)
    );

    setMeetings(filtered);
  };

  const handleJoin = async (meeting: any) => {
    if (!user?.id) return;

    const now = new Date();
    const start = new Date(meeting.startTime);

    if (now < start) {
      toast.info(
        "Cuộc họp này chưa tới giờ bắt đầu. Vui lòng quay lại đúng lịch hẹn nhé!"
      );
      return;
    }

    // ▶ ĐÃ TỚI GIỜ → JOIN
    try {
      const res = await meetingAPI.joinMeeting({
        peerId: user.id,
        roomId: meeting.roomId,
      });

      if (res?.success === false) {
        toast.error(res.error || "Không thể tham gia phòng");
        return;
      }

      toast.success("Tham gia phòng họp thành công!");

        navigate("/pre-join", {
          state: {
            token: res.token,
            roomId: meeting.roomId,
            hostId: res.hostId,
            displayName: user?.displayName || "",
            settings: res.settings,
          },
        });
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi tham gia phòng họp");
    }
  };
  const totalPages = Math.ceil(meetings.length / ITEMS_PER_PAGE);

  const paginatedMeetings = meetings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900">Meetings</h1>
              <p className="text-slate-500">
                Manage your upcoming and past meetings
              </p>
            </div>
            <Link to="/schedule">
              <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-lg gap-2">
                <Plus className="w-5 h-5" />
                Schedule Meeting
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search meetings..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleSearchKey}
                className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Upcoming Meetings
          </h2>

          {/* LIST */}
          <div className="space-y-4">
            {loading && <p className="text-slate-500 text-sm">Loading...</p>}

            {!loading && meetings.length === 0 && (
              <p className="text-slate-500 text-sm">No meetings found.</p>
            )}

            {!loading &&
              paginatedMeetings.map((meeting: any) => {
                const dateStr = new Date(meeting.startTime).toLocaleString();

                return (
                  <Card
                    key={meeting._id}
                    className="border-none shadow-sm ring-1 ring-slate-200 hover:ring-blue-200 transition-all"
                  >
                    <CardContent className="p-5 flex items-center gap-5">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Video className="w-7 h-7 text-blue-600" />
                      </div>

                      <div className="flex-1 space-y-3">
                        <h3 className="text-xl font-bold text-slate-900">
                          {meeting.title || "Meeting"}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {dateStr}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {meeting.duration || "60 min"}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">
                            Host:{" "}
                            {meeting.hostId === user?.id
                              ? "You"
                              : meeting.hostId}
                          </span>

                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">
                            ID: {meeting.roomId}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 px-6 font-bold h-10 rounded-lg"
                          onClick={() => handleJoin(meeting)}
                        >
                          Join
                        </Button>

                        {/* <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button> */}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-slate-600 font-medium">
                Trang {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
