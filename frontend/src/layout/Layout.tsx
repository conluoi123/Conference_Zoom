import { ReactNode } from 'react';
import { BiLogoZoom } from 'react-icons/bi';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen flex justify-center px-4 py-12 bg-linear-to-br from-blue-600 to-violet-600">
      <div className="w-full max-w-md pt-8 pb-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <BiLogoZoom className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-normal text-white">ZUS</h1>
          </div>
          <p className="text-lg text-blue-100">Kết nối mọi lúc, mọi nơi</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}