import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { KeyboardEvent } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";
import { BiLogoZoom } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import { logIn } from "../../services/userApi";
import { Loading } from "../ui/loading.tsx";
export function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const { login } = useAuth();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const input = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  // hiệu ứng loading
  const [isLoading, setIsLoading] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  // Điều hướng
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);
  // validate OTP input
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) {
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      input.current[index + 1]?.focus();
    }
  };
  // nhấn nút Space
  const handleBackspace = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      input.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }
    setIsLoading(true);
    try {
      const otpData = { email, otp: otpCode };
      const res = await logIn.verifyOtp(otpData);
      console.log("OTP verification response:", res);
      if (res) {
        // Use AuthContext login
        if (res.data.data && res.data.accessToken) {
          login(
            {
              id: res.data.data.userId,
              email: res.data.data.email,
              displayName: res.data.data.displayName,
              avatar: res.data.data.avatar,
            },
            res.data.accessToken
          );
        }
        navigate("/home");
      } else {
        setError("Mã OTP không đúng, vui lòng thử lại");
        setOtp(["", "", "", "", "", ""]);
        input.current[0]?.focus();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  // gửi lại OTP khi nhấn nút
  const handleResend = async () => {
    try {
      await logIn.sendOtp({ email });
      console.log("Resending OTP to:", email);
      setOtp(["", "", "", "", "", ""]);
      input.current[0]?.focus();
      setError("");
      setTimer(60);
      setIsResendDisabled(true);
    } catch (error) {
      console.error("Resend OTP error:", error);
    }
  };

  const handleBack = () => {
    navigate("/login", { state: { email } });
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="w-full min-h-screen overflow-y-scroll flex flex-col justify-between px-4 py-8 bg-gradient-to-br from-blue-600 to-violet-600">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <BiLogoZoom className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-normal text-blue-600">ZUS</h1>
            </div>
          </div>

          {/* OTP Form */}
          <div className="bg-white rounded-2xl p-8">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
              <span className="text-sm">Quay lại</span>
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <MdOutlineMailOutline className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <h2 className="text-2xl font-normal text-gray-900 text-center mb-2">
              Xác thực Email
            </h2>

            <p className="text-sm text-gray-600 text-center mb-2">
              Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến
            </p>
            <p className="text-sm text-blue-600 text-center mb-8 font-medium">
              {email}
            </p>

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => {
                    input.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleBackspace(index, e)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && isComplete) {
                      handleVerify();
                    }
                  }}
                  className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none transition-colors ${
                    error
                      ? "border-red-500 focus:border-red-500"
                      : digit
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-xs text-red-500 text-center mb-4 flex items-center justify-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}

            {/* Demo Hint */}
            {/* <p className="text-xs text-gray-500 text-center mb-6">
              Demo: Sử dụng mã <span className="font-bold text-blue-600">123456</span>
            </p> */}

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={!isComplete}
              className={`w-full h-12 rounded-lg font-medium text-sm transition-colors mb-4 ${
                isComplete
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? <Loading size="small" /> : "Xác thực OTP"}
            </button>

            {/* Resend Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Không nhận được mã?{" "}
                <button
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  className={`text-blue-600 font-medium hover:underline ${
                    isResendDisabled
                      ? "cursor-not-allowed text-gray-400 hover:no-underline"
                      : ""
                  }`}
                >
                  {isResendDisabled ? `Gửi lại sau ${timer}s` : "Gửi lại OTP"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
