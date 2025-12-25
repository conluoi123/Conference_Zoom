import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import { ArrowLeft, Download, Share2, Trash2, Calendar, Clock, Users, Database, FileText, MessageSquare } from "lucide-react";
import { mockRecordings } from "./RecordingPage"; 

export function RecordingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"transcription" | "chat">("transcription");
   
  // Tìm bản ghi dựa trên ID từ URL
  const recording = mockRecordings.find((r) => r.id === id);

  console.log(recording);
  if (!recording) return <div className="p-10 text-center text-red-500">Không tìm thấy bản ghi!</div>;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Cột trái: Video & Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-xl overflow-hidden aspect-video relative group shadow-2xl">
              <video 
                src={recording.videoUrl} 
                controls 
                className="w-full h-full"
                poster={recording.thumbnail}
              />
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{recording.title}</h1>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Download className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Share2 className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              
              <p className="text-gray-500 mb-6">Chủ trì: <span className="text-gray-900 font-medium">{recording.host}</span></p>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div><p className="text-xs text-gray-400">Ngày ghi</p><p className="text-sm font-medium">{recording.date.split(' ')[0]}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div><p className="text-xs text-gray-400">Thời lượng</p><p className="text-sm font-medium">{recording.duration}</p></div>
                </div>

              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-2">Chi tiết cuộc họp</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Bản ghi này bao gồm video, audio và chia sẻ màn hình từ cuộc họp. Bạn có thể tải xuống hoặc chia sẻ bản ghi với các thành viên khác.
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: Transcription & Chat */}
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[600px] lg:h-auto shadow-sm">
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab("transcription")}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${activeTab === "transcription" ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/30" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FileText className="w-4 h-4" /> Transcription
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeTab === "transcription" ? (
                // Dữ liệu mẫu transcription
                [
                  { time: "00:00:15", user: "Nguyễn Văn A", text: "Chào mọi người, hôm nay chúng ta sẽ thảo luận về kế hoạch phát triển sản phẩm trong quý 1 năm 2025." },
                  { time: "00:00:45", user: "Trần Thị B", text: "Vâng, em đã chuẩn bị báo cáo về các tính năng mới. Chúng ta có 3 tính năng chính cần triển khai." },
                  { time: "00:01:20", user: "Lê Văn C", text: "Anh nghĩ chúng ta nên ưu tiên tính năng chat trước, vì nhiều khách hàng đang yêu cầu." }
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.time}</span>
                      <span className="text-xs font-bold text-gray-700">{item.user}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900">{item.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400 text-sm italic">Không có tin nhắn chat trong bản ghi này.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}