import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import { ArrowLeft, Download, Share2, Trash2, Calendar, Clock, Database, FileText, Loader2, AlertCircle } from "lucide-react";
import recordingAPI from "@/services/recordingApi";

export function RecordingDetail() {
  const { id } = useParams(); // sessionId
  const location = useLocation();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy roomId từ query params nếu có (từ link ở RecordingPage)
  const queryParams = new URLSearchParams(location.search);
  const roomIdFromQuery = queryParams.get("roomId");

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // roomId là optional trong API current implementation
        const data = await recordingAPI.getRecordingDetail(id, roomIdFromQuery || id);
        setRecording(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch recording detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, roomIdFromQuery]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Đang tải thông tin bản ghi...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !recording) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy bản ghi</h2>
          <p className="text-gray-600 mb-6">{error || "Bản ghi không tồn tại hoặc bạn không có quyền truy cập."}</p>
          <button
            onClick={() => navigate("/recording")}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </MainLayout>
    );
  }

  const isProcessing = !recording.fileUrl;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 line-clamp-1">
              Bản ghi: {recording.roomId}
            </h2>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Cột trái: Video & Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-2xl overflow-hidden aspect-video relative group shadow-xl border border-gray-800">
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold mb-2">Video đang được xử lý</h3>
                  <p className="text-gray-400 max-w-sm">
                    VideoSDK đang xử lý bản ghi của bạn. Có thể mất một chút thời gian tùy thuộc vào độ dài của cuộc họp.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
                  >
                    Làm mới trang
                  </button>
                </div>
              ) : (
                <video
                  src={recording.fileUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Recording {recording.sessionId.substring(0, 8)}</h1>
                  <p className="text-gray-500">Chủ trì: <span className="text-gray-900 font-medium">Host</span></p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 border border-gray-200 transition-colors">
                    <Download className="w-4 h-4" /> Tải về
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 font-medium flex items-center justify-center gap-2 border border-blue-100 transition-colors">
                    <Share2 className="w-4 h-4" /> Chia sẻ
                  </button> 
                  <button className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors border border-transparent hover:border-red-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Ngày ghi</p>
                    <p className="text-sm font-bold text-gray-900 font-mono italic">{new Date(recording.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Thời lượng</p>
                    <p className="text-sm font-bold text-gray-900">--:--</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  Thông tin hệ thống
                </h3>
                <div className="space-y-1 text-sm text-gray-600 font-mono">
                  <p>Session ID: <span className="text-gray-900">{recording.sessionId}</span></p>
                  <p>Room ID: <span className="text-gray-900">{recording.roomId || "N/A"}</span></p>
                  <p>Status: <span className={`font-bold ${isProcessing ? "text-orange-500" : "text-green-500"}`}>{isProcessing ? "PROCESSING" : "READY"}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Transcription */}
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-[600px] lg:h-auto shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button
                className="flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50/50 border-b-2 border-blue-600"
              >
                <FileText className="w-4 h-4" /> Ghi chép (Transcription)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <FileText className="w-12 h-12 text-gray-200 mb-4" />
                  <p className="text-gray-500 text-sm">Ghi chép sẽ sẵn sàng sau khi video được xử lý xong.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { time: "00:00:15", user: "Host", text: "Chào mọi người, bản ghi đã sẵn sàng." },
                    { time: "00:00:45", user: "Participant", text: "Chúng ta có thể bắt đầu xem lại nội dung cuộc họp hôm nay." }
                  ].map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.time}</span>
                        <span className="text-xs font-bold text-gray-700">{item.user}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900">{item.text}</p>
                    </div>
                  ))}
                  <div className="py-20 text-center">
                    <p className="text-xs text-gray-400 italic">Tính năng ghi chép chi tiết đang được phát triển...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
