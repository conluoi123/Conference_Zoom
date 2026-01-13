const LoadMeeting = ({ message = "Đang tải thông tin cuộc họp..."}) => {
  return (
    <div className="bg-gray-900 flex flex-col items-center justify-center min-h-screen z-50 fixed inset-0">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-6"></div>

          <div className="text-white text-xl font-medium animate-pulse">
            {message}
          </div>
        </div>
  );
};

export default LoadMeeting;