// src/components/Header/ProductsMegamenu.jsx (Sử dụng Tailwind CSS)
import React, { useState } from 'react';
import MegamenuNews from './MegamenuNews';
import { WORKPLACE_PRODUCTS, BUSINESS_SERVICES } from './data'; // Giả định dữ liệu sản phẩm được tách ra
import { IoMdVideocam, IoMdChatbubbles, IoMdCall, IoMdMail, IoMdCalendar, IoMdDocument, IoMdClipboard, IoMdColorPalette, IoMdRepeat, IoMdCube, IoMdContacts, IoMdPeople, IoMdSchool } from "react-icons/io";
// import để lấy icons 
// tạo danh sách ánh xạ 
const IMap = {
  // ====== COMMUNICATION ======
  "meetings": IoMdVideocam,
  "team-chat": IoMdChatbubbles,
  "phone" : IoMdCall,
  "mail" : IoMdMail,
  "scheduler": IoMdPeople,
}

const ProductsMegamenu = () => {
  const [activeTab, setActiveTab] = useState('workplace'); // 'workplace' hoặc 'business'
  const [highlightedProduct, setHighlightedProduct] = useState(WORKPLACE_PRODUCTS[0].items[0]); // Sản phẩm đang được hover

  const renderProductColumn = (category) => (
    <div className="flex flex-col space-y-2"> 
      <ul className="list-none p-0 m-0 space-y-1">
        <li 
          className="text-sm font-semibold text-gray-400 pointer-events-none cursor-default mb-1"
        >
          {category.category}
        </li>
        {category.items.map((item) => (
          <li
            key={item.name} 
            // Tailwind cho item danh sách, onMouseEnter để xử lý hover
            className="flex items-start p-2 rounded-lg transition duration-150 ease-in-out hover:bg-gray-100"
            onMouseEnter={() => setHighlightedProduct(item)} // Cập nhật sản phẩm nổi bật khi hover
          >
            {/* Icon: Sử dụng một div/span với kích thước và màu sắc Tailwind */}
            {/* Giả định item.icon là một lớp Tailwind cho icon hoặc icon được render bên trong span */}
            <span className={`h-10 w-10 mr-3 flex-shrink-0 text-blue-600 flex  bg-blue-100 rounded-sm
              hover:bg-blue-600 
              `}>
              {IMap[item.icon] ? (
                React.createElement(IMap[item.icon], { className: "text-lg text-blue-600 ml-2 mt-2.5 hover:text-white" })
              ) : (
                <IoMdCube className="text-lg  text-blue-600" /> // icon mặc định
              )}  
            
            </span>
            <div className="flex flex-col">
              <a href={item.url} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                {item.name}
                {/* Tailwind cho mô tả: text nhỏ, màu nhạt */}
                <span className="block text-xs text-gray-500 mt-0.5 font-normal">{item.description}</span>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    // Các lớp Tailwind cho container chính của Megamenu
    <section className="bg-white shadow-xl max-w-7xl mx-auto p-6" aria-label="Products">
      <div className="flex">
        <div className="flex-grow">
          
          {/* Tabs Navigation (Zoom Workplace / Business Services) */}
          {/* fdn-tabs column-1 fdn-tabs--text => Thiết lập Tailwind cho Tabs */}
          <div className="flex border-b border-gray-200">
            <div className="flex space-x-4" role="tablist">
              <button 
                // Lớp Tailwind cho tab: active/inactive state
                className={`pb-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                  activeTab === 'workplace' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('workplace')}
                role="tab"
                aria-selected={activeTab === 'workplace'}
              >
                Zoom Workplace
              </button>
              <button 
                className={`pb-2 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                  activeTab === 'business' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('business')}
                role="tab"
                aria-selected={activeTab === 'business'}
              >
                Business Services
              </button>
            </div>
          </div>
          
          {/* Tab Content: Zoom Workplace */}
          {activeTab === 'workplace' && (
            // Layout 5 cột (grid grid-cols-4), padding top, hiển thị nội dung
            <div className="pt-4 grid grid-cols-5 gap-2" role="tabpanel"> 
              <div className="col-span-4 grid grid-cols-4 gap-6"> 
                {/* RENDER CÁC CỘT DỰA TRÊN DỮ LIỆU */}
                {WORKPLACE_PRODUCTS.map(renderProductColumn)}
              </div>
              
              {/* Phần Tin tức/Ảnh nổi bật (Cột cuối cùng) */}
              <div className="col-span-1 border-l pl-6">
                <MegamenuNews product={highlightedProduct} />
              </div>
            </div>
          )}
          
          {/* Tab Content: Business Services */}
          {activeTab === 'business' && (
            // Layout 3 cột (grid grid-cols-3), padding top, hiển thị nội dung
            <div className="pt-4 grid grid-cols-3 gap-6" role="tabpanel"> 
              <div className="col-span-2 grid grid-cols-2 gap-6"> 
                {/* RENDER CÁC CỘT DỰA TRÊN DỮ LIỆU */}
                {BUSINESS_SERVICES.map(renderProductColumn)}
              </div>
              
              {/* Phần Tin tức/Ảnh nổi bật (Cột cuối cùng) */}
              <div className="col-span-1 border-l pl-6">
                <MegamenuNews product={highlightedProduct} />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default ProductsMegamenu;