import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { PiMicrosoftOutlookLogo } from "react-icons/pi";
import { MdOutlineMailOutline } from "react-icons/md";
import { AuthLayout } from "../../layout/Layout.tsx";
import { logIn} from "../../services/userApi.ts";
import { Loading } from "../ui/loading.tsx";
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  // thêm state loading để tránh việc gửi nhiều yêu cầu 
  const [isLoading, setIsLoading] = useState(false);
  const regexEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value.length > 0) {
      if (!regexEmail(value)) {
        setError("Email không hợp lệ");
      } else {
        setError("");
      }
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !regexEmail(email)) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    setIsLoading(true);
    try {
      const loginData = { email };
      const res = await logIn.sendOtp(loginData);
      console.log("OTP sent:", res);
      navigate("/otp", { state: { email } });
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message ||"Có lỗi xảy ra. Vui lòng thử lại.");
    } finally{
      setIsLoading(false);
    }

  };

  const handleGoogleLogin = async () => {
    try {
      await logIn.outsideLogin("google");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleOutlookLogin = async () => {
    try {
      await logIn.outsideLogin("outlook");
    } catch (error) {
      console.error("Outlook login error:", error);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-normal text-gray-900 text-center mb-2">
          Đăng nhập
        </h2>
        <p className="text-base text-gray-600 text-center mb-8">
          Chào mừng bạn quay lại với Zus
        </p>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 h-12 w-full bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="font-medium text-sm text-gray-700">
              Tiếp tục với Google
            </span>
          </button>
          <button
            onClick={handleOutlookLogin}
            className="flex items-center justify-center gap-3 h-12 w-full bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PiMicrosoftOutlookLogo className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-sm text-gray-700">
              Tiếp tục với Outlook
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        {/* Email Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <MdOutlineMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && email && !error) {
                    handleEmailLogin();
                  }
                }}
                placeholder="abc@example.com"
                className={`w-full h-12 pl-10 pr-3 bg-gray-100 border-2 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {!error && email && regexEmail(email) && (
              <p className="text-xs text-green-500">Email hợp lệ</p>
            )}
            <p className="text-xs text-gray-500">
              Chúng tôi sẽ gửi mã xác thực đến email của bạn
            </p>
          </div>

          <button
            onClick={handleEmailLogin}
            disabled={!email || !!error || isLoading}
            className="w-full h-12 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loading size="small" /> : "Gửi mã xác thực"}
          </button>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <button className="text-blue-600 hover:underline">
              Điều khoản dịch vụ
            </button>
          </p>
          <p className="text-sm text-gray-600">
            và{" "}
            <button className="text-blue-600 hover:underline">
              Chính sách bảo mật
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}