import { motion } from "framer-motion";
import { X, Waves, Image as ImageIcon } from "lucide-react";

interface BackgroundPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (type: 'none' | 'blur' | 'image', imageUrl?: string) => void;
}

export const BackgroundPanel = ({ isOpen, onClose, onSelectBackground }: BackgroundPanelProps) => {
  const backgrounds = [
    {
      id: 1,
      url: "https://cdn.videosdk.live/virtual-background/beach.jpeg",
      name: "Beach"
    },
    {
      id: 2,
      url: "https://cdn.videosdk.live/virtual-background/san-fran.jpeg",
      name: "San Francisco"
    },
    {
      id: 3,
      url: "https://cdn.videosdk.live/virtual-background/paper-wall.jpeg",
      name: "Paper Wall"
    },
    {
      id: 4,
      url: "https://cdn.videosdk.live/virtual-background/cloud.jpeg",
      name: "Cloud"
    },
  ];
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 flex flex-col shadow-2xl z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Chỉnh background</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tùy chọn cơ bản */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Hiệu ứng</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Không dùng */}
            <button
              onClick={() => onSelectBackground('none')}
              className="aspect-video rounded-lg border-2 border-gray-700 hover:border-blue-500 flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-750 transition-all group"
            >
              <X className="w-8 h-8 text-gray-500 group-hover:text-blue-500 mb-2" />
              <span className="text-xs text-gray-400 group-hover:text-white">Không dùng</span>
            </button>

            {/* Làm mờ */}
            <button
              onClick={() => onSelectBackground('blur')}
              className="aspect-video rounded-lg border-2 border-gray-700 hover:border-blue-500 flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-750 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl"></div>
              <Waves className="w-8 h-8 text-gray-500 group-hover:text-blue-500 mb-2 relative z-10" />
              <span className="text-xs text-gray-400 group-hover:text-white relative z-10">Làm mờ</span>
            </button>
          </div>
        </div>

        {/* Background images */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Hình ảnh</h4>
          <div className="grid grid-cols-2 gap-3">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => onSelectBackground('image', bg.url)}
                className="aspect-video rounded-lg border-2 border-gray-700 hover:border-blue-500 overflow-hidden transition-all hover:scale-105 relative group"
              >
                <img 
                  src={bg.url} 
                  alt={bg.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {bg.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};