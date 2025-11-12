import React from 'react'; 
import Header from '../../components/layout/Header/Header'
import AnnouncementBanner from '../../components/home/AnnouncementBanner/AnnouncementBanner'
// // thanh nằm ngang trên đầu
import HeroSection from '../../components/home/HeroSection/HeroSection' 
// // nội dung to nằm ngay dưới AnnouncementBanner 
// import ProductCarousel from '../../components/home/ProductCarousel/ProductCarousel'
// // trượt các slide thẻ 
// import ResourcesSection from '../../components/home/ResourcesSection/ResourcesSection'
// // cung cấp phần thông tin hướng dẫn 
// import PlatformSection from '../../components/home/PlatformSection/PlatformSection'
// // giới thiệu nền tảng 
// import Footer from '../../components/layout/Footer/Footer';
// //import ChatWidget from '../../components/common/ChatWidget/ChatWidget';

const Home = () => {
    return ( 
        <div>
            <Header /> 
            <div className="mt-16">
                <AnnouncementBanner /> 
            </div>
            <HeroSection />
            
            {/*
            <ProductCarousel /> 
            <ResourcesSection /> 
            <PlatformSection /> 
            <Footer /> 
            <ChatWidget />  */}
        </div>
    )
}
export default Home; 


