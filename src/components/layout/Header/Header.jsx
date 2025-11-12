// src/components/Header/Header.jsx (Sử dụng Tailwind CSS)
import React, { useState } from 'react';
import TopNav from './TopNav';
import ProductsMegamenu from './ProductsMegamenu';
import SolutionMegamenu from './SolutionMegamenu';
const Header = () => {
  // Quản lý trạng thái xem menu mobile có mở không
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Quản lý trạng thái xem Megamenu nào đang mở (ví dụ: 'products', 'solutions', null)
  const [activeMegamenu, setActiveMegamenu] = useState(null);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveMegamenu(null); // Đóng megamenu khi mở menu mobile
  };

  const handleToggleMegamenu = (menuName) => {
    // Nếu megamenu đang mở là megamenu vừa được click, đóng nó lại (null), nếu không thì mở megamenu mới.
    setActiveMegamenu(activeMegamenu === menuName ? null : menuName);
  };
  
  return (
    // zdcm-header zdcm-header-v1 zdcm-global-navigation zdcm-dark-mode
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-900 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-4">
            
            {/* Logic Mobile Back (Tailwind: hidden theo default, flex md:hidden khi mở) */}
            {/* Giả định: Trên mobile, nút back chỉ xuất hiện nếu activeMegamenu không phải là null */}
            <button 
              className={`text-white items-center space-x-1 pr-4 md:hidden ${activeMegamenu ? 'flex' : 'hidden'}`}
              onClick={() => setActiveMegamenu(null)}
              aria-label="Back"
            >
              {/* Icon Back (Ví dụ: SVG) */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>Back</span>
            </button>
            
            {/* Nút Hamburger (Chỉ hiển thị trên Mobile/Tablet) */}
            <button 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
              aria-label="Toggle Menu" 
              aria-expanded={isMobileMenuOpen}
              onClick={handleToggleMobileMenu}
            >
              {/* Icon Hamburger/Close (Sử dụng logic Tailwind để chuyển đổi icon) */}
              {isMobileMenuOpen ? (
                // Icon Close
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Icon Hamburger
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            {/* Logo */}
            <a href="https://www.zoom.com/" className="flex-shrink-0">
              {/* Giả định logo là màu trắng cho chế độ tối (dark-mode) */}
              <span>
                <img src="https://st1.zoom.us/homepage/publish/primary/assets/images/zoom-logo.svg" alt="" className ="w-114px h-26px" />
              </span>
              {/* <img className="h-8 w-auto" src="/path/to/zoom-logo-white.svg" alt="Zoom" /> */}
            </a>
          </div>
            {/* layout hiện tại gồm ba phần : logo + topnav + sign in + contact sales */}
          {/* 2. Main Navigation List (Chỉ hiển thị trên Desktop) */}
          <div className="hidden md:block mr-100">
            <TopNav 
              activeMegamenu={activeMegamenu}
              onToggleMegamenu={handleToggleMegamenu}
            />
          </div>

          {/* 3. Phần bên phải (ví dụ: Nút Đăng nhập/Liên hệ bán hàng) */}

          <div className="hidden md:flex items-center space-x-4">
            <button>
              
            </button>
            <a href=""></a>
            <a href=""></a>

            <a href="/signin" className="text-sm font-medium text-white hover:text-blue-300">Sign In</a>
            <a href="/sales" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors">Contact Sales</a>
          </div>
        </div>
        
        {/* Mobile Menu Panel (Hiển thị khi isMobileMenuOpen là true) */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-2 pb-3 space-y-1 sm:px-3 absolute w-full left-0 bg-gray-800 shadow-lg">
            {/* Nội dung menu mobile sẽ được đặt ở đây (ví dụ: các mục của TopNav) */}
            <a href="#" className="text-white block px-3 py-2 rounded-md text-base font-medium bg-gray-700">Products</a>
            <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Solutions</a>
            {/* ... */}
          </div>
        )}
      </nav>

      {/* 4. Products Megamenu Component (Hiển thị có điều kiện dưới Header chính) */}
      {/* Tailwind cho Megamenu: 
        Định vị tuyệt đối, bao phủ chiều rộng, nằm ngay dưới Header chính.
      */}
      {activeMegamenu === 'products' && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-xl border-t border-gray-200 mt-4">
          <ProductsMegamenu />
        </div>
      )}
      {
        activeMegamenu == 'solutions' && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-xl border-t border-gray-200 mt-4">
            <SolutionMegamenu />
          </div>
        )
      }



    </header>
  );
};

export default Header;