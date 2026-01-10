import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import {
    Search,
    Calendar,
    Clock,
    Play,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sessionAPI, type SessionHistory } from "@/services/sessionApi";
import LoadingScreen from "@/components/ui/LoadingScreen";

const ITEMS_PER_PAGE = 5;

function HistoryPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [sessions, setSessions] = useState<SessionHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchItem, setSearchItem] = useState("");
    const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (user?.id) {
            fetchHistory();
        }
    }, [user]);
    // Reset page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchItem, filter]);

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

    const handleViewRecording = (session: SessionHistory) => {
        navigate(`/recordings/${session.sessionId}`, {
            state: { roomId: session.roomId, sessionId: session.sessionId },
        });
    };

    /* ================= FILTER + PAGINATION Logic ================= */
    const filteredSessions = sessions.filter((session) => {
        // 1. Filter by search text
        const matchesSearch = session.roomId?.toLowerCase().includes(searchItem.toLowerCase()) ||
            session.title?.toLowerCase().includes(searchItem.toLowerCase());

        // 2. Filter by time (Example placeholder logic)
        // You can implement proper date filtering here based on `filter` state
        // if (filter === 'today') { ... } 

        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);

    const paginatedSessions = filteredSessions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Show loading screen while fetching data
    if (loading) {
        return <LoadingScreen message="" variant="light" />;
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Link
                            to="/home"
                            className="flex items-center text-blue-600 text-sm font-medium hover:underline gap-1 mb-4"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Home
                        </Link>

                        <h1 className="text-2xl font-semibold">Lịch sử cuộc họp</h1>
                        <p className="text-gray-600 mb-6">
                            Xem lại các cuộc họp đã tham gia
                        </p>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm cuộc họp..."
                                    value={searchItem}
                                    onChange={(e) => setSearchItem(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        <div className="bg-white p-6 rounded-lg border">
                            <p className="text-gray-600 text-sm">Tổng số cuộc họp</p>
                            <p className="text-2xl font-bold">{sessions.length}</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border">
                            <p className="text-gray-600 text-sm">Có bản ghi</p>
                            <p className="text-2xl font-bold">
                                {sessions.filter((s) => s.hasRecording).length}
                            </p>
                        </div>
                    </div>

                    {/* Sessions List */}
                    {paginatedSessions.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl">
                            <Clock className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-600">Chưa có lịch sử cuộc họp</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl border overflow-hidden">
                                {paginatedSessions.map((session, index) => (
                                    <div
                                        key={session.sessionId}
                                        className={`flex justify-between items-center p-4 hover:bg-gray-50 ${index !== paginatedSessions.length - 1 ? "border-b" : ""
                                            }`}
                                    >
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                {session.title || session.roomId || "Cuộc họp"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <Calendar className="w-4 h-4" />
                                                {session.start
                                                    ? new Date(session.start).toLocaleString()
                                                    : "N/A"}
                                            </div>
                                        </div>

                                        {session.hasRecording && (
                                            <button
                                                onClick={() => handleViewRecording(session)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <Play className="w-4 h-4" />
                                                Xem bản ghi
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-6">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="px-3 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <span className="text-sm font-medium text-gray-700">
                                        Trang {currentPage} / {totalPages}
                                    </span>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="px-3 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default HistoryPage;
