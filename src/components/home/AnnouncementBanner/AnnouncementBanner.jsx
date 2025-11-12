import {React, useState} from 'react'
import { IoIosClose } from "react-icons/io";
import { CiCircleChevRight } from "react-icons/ci";


export default function  AnnouncementBanner() {
    const [isVisible, setIsvisible] = useState(true); 
    // để kiểm tra việc tắt hay bật thanh banner 
    if(!isVisible){
        return null;
    }
    return(
        <div className="bg-linear-to-r from-indigo-900 to-blue-800 round-lg w-[90vw] text-white p-3 sm:px-6 lg:px-8 shadow-lg  flex justify-between items-center mx-auto rounded-xl relative">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Nội dung */}
                <div className="flex-1 min-w-0 flex items-center justify-center sm:justify-start space-x-4">
                    {/* Văn bản */}
                    <span className="text-sm font-medium text-center sm:text-left">
                        Zoom is a Leader in the **2025 Gartner® Magic Quadrant™ for UCaaS**
                    </span>
                    {/* Nút  */}
                    <a href="#"
                        className= "hidden sm:inline-flex items-center px-3 py-1 border border-white border-opacity-30 text-xs font-semibold rounded-full shadow-sm bg-linear-to-r from-fuchsia-400 to-rose-600 bg-opacity-10 hover:bg-opacity-30 transition duration-200 ease-in-out"
                    >
                        Read the report
                        <CiCircleChevRight className="w-4 h-4" />
                    </a>
                </div>
                {/* 2. Nút Đóng (X) */}
                <button
                    onClick={() => setIsvisible(false)} // Thay đổi trạng thái để ẩn banner
                    type="button"
                    className="flex shrink-0 ml-4 p-1 rounded-full text-white opacity-70 hover:opacity-100 hover:bg-white hover:bg-opacity-10 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white absolute right-5"
                    aria-label="Dismiss"
                >
                    {/* Icon X */}
                    <IoIosClose className="w-5 h-5" />
                </button>
            </div>
        </div>
        
    )
}