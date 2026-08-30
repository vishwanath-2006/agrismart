import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack,
  onBack,
  rightAction
}) => {
  const navigate = useNavigate();
  const { currentRole, currentUser, switchRole } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleTitle = () => {
    if (title) return title;
    switch (currentRole) {
      case 'farmer':
        return 'Farmer Dashboard';
      case 'buyer':
        return 'Buyer Marketplace';
      case 'transporter':
        return 'Transporter Dashboard';
      default:
        return 'AgriSmart AI';
    }
  };

  const getProfileRoute = () => {
    switch (currentRole) {
      case 'farmer':
        return '/farmer/profile';
      case 'buyer':
        return '/buyer/profile';
      case 'transporter':
        return '/transporter/profile';
      default:
        return '/login';
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
    if (role === 'farmer') navigate('/farmer/dashboard');
    else if (role === 'buyer') navigate('/buyer/marketplace');
    else if (role === 'transporter') navigate('/transporter/dashboard');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
      <div className="max-w-7xl mx-auto h-16 px-margin-mobile md:px-margin-desktop flex items-center justify-between gap-unit">
        {/* Left Side */}
        <div className="flex items-center gap-unit">
          {showBack ? (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-95 transition-all text-on-surface"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <img
              alt="AgriSmart AI Logo"
              className="h-8 w-auto object-contain cursor-pointer"
              src={LOGO_URL}
              onClick={() => {
                if (currentRole === 'farmer') navigate('/farmer/dashboard');
                else if (currentRole === 'buyer') navigate('/buyer/marketplace');
                else if (currentRole === 'transporter') navigate('/transporter/dashboard');
              }}
            />
          )}
          <span className="font-title-md text-title-md text-primary font-semibold tracking-tight truncate max-w-[200px] sm:max-w-none">
            {getRoleTitle()}
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 relative">
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="hidden sm:flex items-center gap-1.5 bg-primary/10 hover:bg-primary/15 text-primary px-3 py-1.5 rounded-full text-label-sm font-medium border border-primary/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">
                {currentRole === 'farmer' ? 'agriculture' : currentRole === 'buyer' ? 'shopping_cart' : 'local_shipping'}
              </span>
              <span className="capitalize">{currentRole}</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-elevated border border-outline-variant/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70 border-b border-outline-variant/20">
                  Switch Persona
                </div>
                <button
                  onClick={() => handleRoleSelect('farmer')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-label-sm text-left hover:bg-surface-container transition-colors ${
                    currentRole === 'farmer' ? 'text-primary font-semibold bg-primary-fixed/20' : 'text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">agriculture</span>
                  Farmer View
                </button>
                <button
                  onClick={() => handleRoleSelect('buyer')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-label-sm text-left hover:bg-surface-container transition-colors ${
                    currentRole === 'buyer' ? 'text-primary font-semibold bg-primary-fixed/20' : 'text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  Buyer View
                </button>
                <button
                  onClick={() => handleRoleSelect('transporter')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-label-sm text-left hover:bg-surface-container transition-colors ${
                    currentRole === 'transporter' ? 'text-primary font-semibold bg-primary-fixed/20' : 'text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  Transporter View
                </button>
                <div className="border-t border-outline-variant/20 my-1"></div>
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-label-sm text-left text-error hover:bg-error-container/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout / Switch Account
                </button>
              </div>
            )}
          </div>

          {rightAction ? (
            rightAction
          ) : (
            <>
              <button
                className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full hover:bg-surface-container active:scale-95 transition-all text-on-surface-variant"
                aria-label="Notifications"
                onClick={() => {
                  if (currentRole === 'farmer') navigate('/farmer/market-prices');
                  else if (currentRole === 'buyer') navigate('/buyer/negotiation');
                  else navigate('/transporter/dashboard');
                }}
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>

              <button
                onClick={() => navigate(getProfileRoute())}
                className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 p-0.5 hover:ring-2 hover:ring-primary/40 active:scale-95 transition-all"
                aria-label="User Profile"
              >
                <img
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  src={currentUser.avatarUrl}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
