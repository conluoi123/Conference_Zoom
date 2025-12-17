import React from 'react';
import { BiLogoZoom } from 'react-icons/bi';
import { Header } from './Header';

function MainLayout({children}: {children: React.ReactNode}) {
    
    return(
    <>
       <Header 
        onOpenProfile={() => {}}
        onToggleMenu={() => {}}
        showProfileMenu={false}
       />
       <main className="flex-1 bg-gray-50 min-h-screen p-6">
        {children}
       </main>
    </>
    )
}

export default MainLayout;