import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
    fullScreen?: boolean;
    size?: 'small' | 'default' | 'large'; 
    message?: string;
}
export const Loading : React.FC<LoadingProps> =({ fullScreen = false, size = 'default' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <Loader2 className={`${sizeClasses.large} animate-spin text-primary`} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
    </div>
  );
};


