import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole } = useApp();

  const getNavItems = () => {
    switch (currentRole) {
      case 'farmer':
        return [
          { label: 'Home', path: '/farmer/dashboard', icon: 'home' },
          { label: 'Market', path: '/farmer/market-comparison', icon: 'storefront' },
          { label: 'Add', path: '/farmer/add-produce', icon: 'add_circle', isAction: true },
          { label: 'Prices', path: '/farmer/market-prices', icon: 'trending_up' },
          { label: 'Profile', path: '/farmer/profile', icon: 'person' }
        ];
      case 'buyer':
        return [
          { label: 'Market', path: '/buyer/marketplace', icon: 'storefront' },
          { label: 'Deals', path: '/buyer/negotiation', icon: 'handshake' },
          { label: 'Orders', path: '/buyer/order-confirmation', icon: 'receipt_long' },
          { label: 'Tracking', path: '/buyer/live-tracking', icon: 'location_on' },
          { label: 'Profile', path: '/buyer/profile', icon: 'person' }
        ];
      case 'transporter':
        return [
          { label: 'Loads', path: '/transporter/dashboard', icon: 'dashboard' },
          { label: 'Routes', path: '/transporter/route-optimization', icon: 'alt_route' },
          { label: 'Tracking', path: '/transporter/live-tracking', icon: 'navigation' },
          { label: 'Deliveries', path: '/transporter/delivery-confirmation', icon: 'task_alt' },
          { label: 'Profile', path: '/transporter/profile', icon: 'person' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  if (navItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
      <div className="h-16 flex items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          if (item.isAction) {
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="-mt-5 w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-all"
                aria-label={item.label}
              >
                <span className="material-symbols-outlined text-[28px]">add</span>
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className={`text-[11px] font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
