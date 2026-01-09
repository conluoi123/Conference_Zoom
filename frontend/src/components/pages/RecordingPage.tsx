import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import {
  Search,
  Calendar,
  Clock,
  Users,
  Play,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { ChevronLeft } from "lucide-react";
import recordingAPI from "@/services/recordingApi";
import type { Recording as APIRecording } from "@/services/recordingApi";
import { toast } from "sonner";

export interface Recording {
  id: string;
  sessionId: string;
  roomId: string;
  hostId: string;
  title: string;
  date: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  host: string;
  participants: number;
  size: string;
}

export const mockRecordings: Recording[] = [
  {
    id: "1",
    sessionId: "3739-ycme-k9nj",
    roomId: "3739-ycme-k9nj",
    hostId: "694eb047d05b6a0780b04262",
    title: "Recording 3739-ycme",
    date: "2024-12-30 22:40",
    duration: "--:--",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    host: "Host",
    participants: 1,
    size: "Processing...",
  }
];

function RecordingPage() {
  const navigate = useNavigate();
  const [searchItem, setSearchItem] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "day" | "week" | "month">("all");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recordings from API
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const data = await recordingAPI.getRecordings();

        // Transform API data to match UI format
        const transformedData: Recording[] = data.map((rec: APIRecording) => ({
          id: rec.sessionId,
          sessionId: rec.sessionId,
          roomId: rec.roomId,
          hostId: rec.hostId,
          title: `Recording ${rec.sessionId.substring(0, 8)}`, // Use sessionId as title
          date: new Date(rec.createdAt).toLocaleString('vi-VN'),
          duration: "--:--", // TODO: Calculate from recording metadata
          thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
          videoUrl: rec.fileUrl || "https://www.w3schools.com/html/mov_bbb.mp4", // Mock URL if no fileUrl
          host: "Unknown", // TODO: Get from Room
          participants: 0, // TODO: Get from Session
          size: rec.fileUrl ? "-- MB" : "Processing...", // Show processing if no URL
        }));

        setRecordings(transformedData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch recordings:", err);
        setError(err.message);
        toast.error("Không thể tải danh sách recordings");
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const filterRecording = recordings.filter(
    (recording) =>
      recording.title.toLowerCase().includes(searchItem.toLowerCase()) ||
      recording.host.toLowerCase().includes(searchItem.toLowerCase())
  );

  const onSelectRecording = (record: Recording) => {
    // Chúng ta cần cả sessionId (định danh duy nhất cuộc họp) và roomId (để phân quyền)
    navigate(`/recordings/${record.sessionId}`, {
      state: { roomId: record.roomId }
    });
  };
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}

        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <Link
                    to="/home"
                    className="flex items-center text-blue-600 text-sm font-medium hover:underline gap-1 mb-4"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                  <h1 className="text-2xl font-semibold">Bản ghi cuộc họp</h1>
                  <p className="text-gray-600">
                    Quản lý và xem lại các cuộc họp đã ghi lại
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bản ghi..."
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                </select>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2.5 transition-colors ${viewMode === "grid"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2.5 transition-colors border-l border-gray-300 ${viewMode === "list"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Tổng số bản ghi</p>
                  <p className="text-gray-900">{recordings.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recordings Grid/List */}
          {loading ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Đang tải recordings...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : filterRecording.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2">Không tìm thấy bản ghi</h3>
              <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterRecording.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => onSelectRecording(recording)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={recording.thumbnail}
                      alt={recording.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white rounded-full p-4">
                        <Play className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {recording.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {recording.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{recording.host}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{recording.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {recording.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <button className="text-gray-600 hover:text-gray-900 p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              {mockRecordings.map((recording, index) => (
                <div
                  key={recording.id}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${index !== mockRecordings.length - 1
                    ? "border-b border-gray-200"
                    : ""
                    }`}
                  onClick={() => onSelectRecording(recording)}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={recording.thumbnail}
                      alt={recording.title}
                      className="w-40 h-24 object-cover rounded"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {recording.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-2">{recording.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recording.host}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{recording.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recording.participants} người</span>
                      </div>
                      <span className="text-gray-500">{recording.size}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="text-gray-600 hover:text-gray-900 p-2">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default RecordingPage;
