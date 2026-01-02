import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import {
  ArrowLeft,
  Share2,
  Calendar,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { recordingAPI } from "@/services/recordingApi";
import { socketService } from "@/services/socket";

export function RecordingDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [recordingUrls, setRecordingUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmails, setShareEmails] = useState("");

  // Get roomId from location state
  const roomId = location.state?.roomId || "";

  console.log("🔍 RecordingDetail mounted:", { sessionId, roomId, locationState: location.state });

  useEffect(() => {
    console.log("🔄 useEffect triggered:", { sessionId, roomId });
    if (sessionId) {
      if (!roomId) {
        console.warn("⚠️ Missing roomId!");
        setError("Thiếu thông tin roomId. Vui lòng quay lại trang History.");
        setLoading(false);
        return;
      }
      console.log("✅ Calling fetchRecordings...");
      fetchRecordings();
    }
  }, [sessionId, roomId]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📹 Fetching recordings for:", { roomId, sessionId });
      const urls = await recordingAPI.getSessionRecordings(roomId, sessionId!);
      console.log("✅ Recordings fetched:", urls);
      setRecordingUrls(urls);
    } catch (err: any) {
      console.error("❌ Error fetching recordings:", err);
      setError(err.message || "Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  const handleShareRecording = () => {
    if (!user?.id || !sessionId) return;

    const emails = shareEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);

    if (emails.length === 0) {
      alert("Vui lòng nhập ít nhất 1 email");
      return;
    }

    socketService.shareRecording(user.id, roomId, sessionId, emails);
    setShowShareModal(false);
    setShareEmails("");
    alert("Đã chia sẻ recording thành công!");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline"
            >
              Quay lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Cột trái: Video & Info */}
          <div className="lg:col-span-2 space-y-6">
            {recordingUrls.length > 0 && (
              <div className="bg-black rounded-xl overflow-hidden aspect-video relative group shadow-2xl">
                <video
                  src={recordingUrls[0]}
                  controls
                  className="w-full h-full"
                />
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Bản ghi cuộc họp
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400">Session ID</p>
                    <p className="text-sm font-medium">
                      {sessionId?.slice(0, 12)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-400">Số lượng</p>
                    <p className="text-sm font-medium">
                      {recordingUrls.length} video(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-2">Chi tiết cuộc họp</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Bản ghi này bao gồm video, audio và chia sẻ màn hình từ cuộc
                  họp. Bạn có thể chia sẻ bản ghi với các thành viên khác.
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: Recording List */}
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[600px] lg:h-auto shadow-sm">
            <div className="border-b p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Danh sách recordings
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recordingUrls.map((url, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Recording {index + 1}
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate block"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chia sẻ Recording
                </h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (phân cách bằng dấu phẩy)
                </label>
                <textarea
                  placeholder="email1@example.com, email2@example.com"
                  value={shareEmails}
                  onChange={(e) => setShareEmails(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleShareRecording}
                className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
              >
                Chia sẻ
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}