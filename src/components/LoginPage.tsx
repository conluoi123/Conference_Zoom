import { useState } from "react";

import { FcGoogle } from "react-icons/fc";
import { PiMicrosoftOutlookLogo } from "react-icons/pi";
import { BiLogoZoom } from "react-icons/bi";
import { MdOutlineMailOutline } from "react-icons/md";
// viết thêm phần validate cho email 

interface LoginPageProps {
  onSwitchToOTP: (email: string) => void;
  email: string;
}

export function LoginPage({ onSwitchToOTP, email: initialEmail }: LoginPageProps) {
    const [email, setEmail] = useState(initialEmail);
    const [error, setError] = useState(""); 
    const [touched, setTouched] = useState(false); 
    
    const regexEmail = (value:string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return regex.test(value);
    }  
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value; 
        setEmail(value); 

        // validate khi người dùng nhập 
        if(value.length > 0) {
            if(!regexEmail(value)){
                setError("Email không hợp lệ");
            }
            else {
                setError("");
            }

        }
    }
    const handleEmailLogin = () => {
        console.log("Login with email:", email);
        onSwitchToOTP(email);
    };

    const handleGoogleLogin = () => {
        console.log("Login with Google");
    };

    const handleOutlookLogin = () => {
        console.log("Login with Outlook");
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-600 to-violet-600 ">
        <div className="w-full max-w-[448px]  pt-8 pb-8 flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4 items-center ">
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <BiLogoZoom className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-4xl font-normal text-white">ZUS</h1>
                </div>
            
            <p className="text-lg text-blue-100">Kết nối mọi lúc, mọi nơi</p>
            </div>

            {/* Login Form */}
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
                className="flex items-center justify-center gap-3 h-12 w-full bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" 
                >
                <FcGoogle className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-sm text-gray-700">
                    Tiếp tục với Google
                </span>
                </button>
                <button 
                onClick={handleOutlookLogin}
                className="flex items-center justify-center gap-3 h-12 w-full bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" 
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
                    onChange = {handleEmailChange}
                    onKeyPress= {(e) => {
                    if(e.key === 'Enter') {
                        handleEmailLogin();
                    }
                }}
                    placeholder="abc@example.com"
                    className= {'w-full h-12 pl-10 pr-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors ' + (error ? 'border-red-500' : '') }
                    />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                {!error && email && <p className="text-xs text-green-500">Email hợp lệ</p>}
                <p className="text-xs text-gray-500">
                    Chúng tôi sẽ gửi mã xác thực đến email của bạn
                </p>
                </div>
                
                <button 
                onClick={handleEmailLogin}
                // xử lí nút enter cho form email
                
                className="w-full h-12 bg-blue-600 text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-blue-700 transition-colors" 
                >
                Tiếp tục với Email
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

            {/* Register Link
            <div className="text-center">
            <p className="text-base text-white">
                Chưa có tài khoản?{" "}
                <button 
                onClick={onSwitchToRegister}
                className="font-semibold hover:underline cursor-pointer"
                >
                Đăng ký ngay
                </button>
            </p>
            </div> */}
        </div>
        </div>
    );
}