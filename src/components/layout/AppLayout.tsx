import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from '../navigation/BottomNav';
import { DesktopSidebar } from '../navigation/DesktopSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  hideNav?: boolean;
  maxWidthClass?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  showBack,
  onBack,
  rightAction,
  hideNav,
  maxWidthClass = 'max-w-md md:max-w-4xl lg:max-w-5xl'
}) => {
  return (
    <div className="min-h-screen bg-surface flex flex-row">
      {/* Desktop Fixed Sidebar */}
      {!hideNav && <DesktopSidebar />}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        {/* Sticky Mobile/Desktop Header */}
        <AppHeader
          title={title}
          showBack={showBack}
          onBack={onBack}
          rightAction={rightAction}
        />

        {/* Scrollable Page Body */}
        <main className={`w-full mx-auto pt-4 md:pt-6 pb-24 md:pb-12 ${maxWidthClass} px-margin-mobile md:px-margin-desktop min-h-[calc(100vh-4rem)]`}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
};
