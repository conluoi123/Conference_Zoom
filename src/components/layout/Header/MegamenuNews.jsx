// src/components/Header/MegamenuNews.jsx (Sử dụng Tailwind CSS)
import { IoMdVideocam } from "react-icons/io";

const MegamenuNews = ({ product }) => {
    // Nếu không có sản phẩm nào, không hiển thị gì
    if (!product) return null;

    return (
        // zdcm-megamenu-products-news
        // Container chính: Đảm bảo chiều cao đầy đủ (h-50) để chiếm nửa ko gian cột
        <div className="flex flex-col space-y-3">
            <div 
                // zdcm-news-container: Thiết lập vị trí tương đối và bo góc
                className="relative h-50 w-full overflow-hidden rounded-lg shadow-md group"
            >
                <img 
                    alt={product.name} 
                    // zdcm-news-background: Đặt làm nền, bao phủ toàn bộ, và thêm hiệu ứng zoom nhẹ khi hover (transition)
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    src={product.bgImage} 
                />
            </div>
            <div className="mb-2 mt-4">
                    <span className="inline-block text-[20px] font-bold uppercase tracking-wider rounded">
                        {product.name}
                    </span>
                </div>
                
                <div>
                    <p className="text-lg  leading-snug">{product.fullDescription}</p>
                </div>
        </div>
    );
};

export default MegamenuNews;