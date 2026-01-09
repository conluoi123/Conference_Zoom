import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import {
    Search,
    Calendar,
    Clock,
    Play,
    ChevronLeft,
    Video,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sessionAPI, type SessionHistory } from "@/services/sessionApi";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function HistoryPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<SessionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchItem, setSearchItem] = useState("");
    const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");

    useEffect(() => {
        if (user?.id) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await sessionAPI.getUserHistory(user!.id);
            setSessions(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter((session) =>
        session.roomId?.toLowerCase().includes(searchItem.toLowerCase())
    );

    const handleViewRecording = (session: SessionHistory) => {
        navigate(`/recordings/${session.sessionId}`, {
            state: { roomId: session.roomId, sessionId: session.sessionId },
        });
    };

    // Show loading screen while fetching data
    if (loading) {
        return <LoadingScreen message="Đang tải lịch sử cuộc họp..." />;
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <Link
                                    to="/home"
                                    className="flex items-center text-blue-600 text-sm font-medium hover:underline gap-1 mb-4"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back to Home
                                </Link>
                                <h1 className="text-2xl font-semibold">Lịch sử cuộc họp</h1>
                                <p className="text-gray-600">
                                    Xem lại các cuộc họp đã tham gia
                                </p>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm cuộc họp..."
                                    value={searchItem}
                                    onChange={(e) => setSearchItem(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

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
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1">Tổng số cuộc họp</p>
                                    <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Video className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1">Có bản ghi</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {sessions.filter((s) => s.hasRecording).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Play className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sessions List */}
                    {loading ? (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <p className="text-gray-600">Đang tải...</p>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Chưa có lịch sử
                            </h3>
                            <p className="text-gray-600">
                                Bạn chưa tham gia cuộc họp nào
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                            {filteredSessions.map((session, index) => (
                                <div
                                    key={session.sessionId}
                                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index !== filteredSessions.length - 1
                                        ? "border-b border-gray-200"
                                        : ""
                                        }`}
                                >
                                    {/* Session Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {session.roomId || session.title || "Cuộc họp"}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{session.start ? new Date(session.start).toLocaleString() : "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Recording Button */}
                                    {session.hasRecording && (
                                        <button
                                            onClick={() => handleViewRecording(session)}
                                            className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Play className="w-4 h-4" />
                                            <span>Xem bản ghi</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default HistoryPage;
