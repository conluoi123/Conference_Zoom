import {useState, useRef, useEffect} from 'react'; 
import  type { KeyboardEvent } from 'react';

import React from 'react';
import { BiLogoZoom } from "react-icons/bi";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";  

interface OTPPageProps {
    email: string; // giữ email khỏi cần nhập lại 
    onBack: () => void; // dùng để quay lại
    onSwitchHome: () => void; // dùng để chuyển sang trang Home (trạng thái đăng nhập thành công)
}


export function OTPPage({email, onBack, onSwitchHome}: OTPPageProps) {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const input = useRef<(HTMLInputElement | null)[]>([]); 
    const [timer, setTimer] = useState(15); // thời gian đếm ngược gửi lại OTP
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    const handleChange = (index: number, value:string) => {
       // Chỉ cho phép nhập số 
       if(value && !/^\d*$/.test(value)) {
        return;
       }
       const newOtp = [...otp]; 
       newOtp[index] = value; 
       setOtp(newOtp);
       setError("");
      // 5 ô tiếp theo 
      if(value && index<5) {
        input.current[index+1]?.focus();
      }
    }; 
    // xử lí nút xóa 
    const handlBackspace = (index:number, e:KeyboardEvent<HTMLInputElement>) => {
      if(e.key==="Backspace" && !otp[index] && index>0){
        input.current[index-1]?.focus();
      }
    };
    
    // nhập chữ ko đc dán
    // focus vào ô cuối khi nhập xong hết 
    const handleVerify = () => {
      const otpCode = otp.join(""); 
      if (otpCode.length !== 6) {
        setError("Vui lòng nhập đầy đủ"); 
        return;
      }
      // xử lí với BE, trường hợp giả đỉnh là 123456
      if(otpCode==="123456") {
        console.log("Đăng nhập thành công với OTP:", otpCode);
        onSwitchHome();
      }
      else{
        setError("OTP không đúng, vui lòng thử lại");
        setOtp(["", "", "", "", "", ""]);
        input.current[0]?.focus(); // đặt con trỏ
      }
    };
    useEffect(()=> {
      if(timer>0){
        const interval = setInterval(() => {
          setTimer((prev) => prev -1);
        },1000);
        return () => clearInterval(interval); // cleanup khi unmount
      } else {
        // mở nút gửi lại 
        setIsResendDisabled(false);
      }
    })
    // reset lại khi gửi Otp
    const handleResend = () => {
      console.log("Gửi lại OTP đến email:", email);
      setOtp(["", "", "", "", "", ""]);
      input.current[0]?.focus();
      setError("");
      setTimer(15); // reset countdown
      setIsResendDisabled(true);
    };

    const isComplete = otp.every((digit) => digit !==""); 
    return(
      <div className="w-full min-h-screen flex flex-col justify-between px-4 py-8 bg-gradient-to-br from-blue-600 to-violet-600">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[448px] bg-white rounded-2xl p-8 flex flex-col gap-6 shadow-2xl">
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
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Back Button */}
            <button
              onClick={onBack}
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
                    input.current[index] = el; // chỉ gán, không return
                  }}

                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handlBackspace(index, e)}
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

            {/* Timer & Resend */}
            <p className="text-xs text-gray-500 text-center mb-6">
              Gửi lại: <span className="text-gray-700 font-medium">Sử dụng mã 123456 để demo</span>
            </p>

            {/* Verify Button */}
            <button 
              onClick={handleVerify}
              disabled={!isComplete}
              className={`w-full h-12 rounded-lg font-medium text-sm transition-colors mb-4 ${
                isComplete
                  ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Xác thực
            </button>

            {/* Resend Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Không nhận được mã?{" "}
                <button
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  className = {`text-blue-600 font-medium hover:underline ${isResendDisabled ? "cursor-not-allowed text-gray-400 hover:no-underline" : "cursor-pointer" }`}
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
          

