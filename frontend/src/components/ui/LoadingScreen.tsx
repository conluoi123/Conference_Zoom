import { motion } from "framer-motion";

interface LoadingScreenProps {
    message?: string;
    variant?: "light" | "dark"; // light cho trang sáng (History, Recording), dark cho trang tối (MeetingRoom)
}

export const LoadingScreen = ({
    message = "Đang tải...",
    variant = "light"
}: LoadingScreenProps) => {
    const bgColor = variant === "light" ? "bg-gray-100" : "bg-gray-900";
    const textColor = variant === "light" ? "text-gray-400" : "text-gray-600";

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${bgColor}`}>
            {/* Logo mờ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
            >
                {/* ZUS Logo - Gradient nổi bật */}
                <motion.span
                    className="text-8xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent select-none"
                    animate={{
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    ZUS
                </motion.span>
            </motion.div>

            {/* Loading text và dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`mt-6 flex items-center gap-2 ${textColor}`}
            >
                <span className="text-sm font-medium">{message}</span>

                {/* Simple dots */}
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${variant === "light" ? "bg-gray-400" : "bg-gray-600"}`}
                            animate={{
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
