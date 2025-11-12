
const TopNav = ({ activeMegamenu, onToggleMegamenu }) => {
  return (
    <ul className="flex  space-x-6 list-none p-0 m-0">
      {/* Mục Menu Products */}
      <li className="relative">
        <button 
          // zdcm-main-nav__megamenu-trigger => Thiết lập Tailwind cho nút trigger
          className={`
            text-sm font-medium transition-colors duration-200 
            hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${activeMegamenu === 'products' ? 'text-blue-600' : 'text-white'}
          `} 
          aria-haspopup="true" 
          aria-expanded={activeMegamenu === 'products'}
          onClick={() => onToggleMegamenu('products')}
        >
          Products
          {/* Icon mũi tên xuống, xoay khi megamenu đang mở */}
          <span className={`ml-1 inline-block transition-transform duration-200 ${
            activeMegamenu === 'products' ? 'rotate-180' : 'rotate-0'
          }`}>
            {/* Đây là một SVG đơn giản cho icon mũi tên */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </button>
      </li>
      
      {/* Mục Menu Solutions */}
      <li className="relative">
        <button 
        // Đã chỉnh màu chữ ở đây 
          className="text-sm font-medium text-white hover:text-blue-600 transition-colors duration-200 focus:outline-none" 
          aria-haspopup="true"
          aria-expanded = {activeMegamenu === 'solutions'}
          onClick = {() => onToggleMegamenu('solutions')}
        >
          Solutions
          {/* Icon mũi tên xuống */}
          <span className={` ml-1 inline-block transition-transform duration-200
          ${activeMegamenu==='solutions' ? 'rotate-180':'rotate-0'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </button>
      </li>
      
        
      {/* ... Các mục menu khác tương tự (chỉ thêm pricing vào thôi) ... */}
    </ul>
  );
};

export default TopNav;