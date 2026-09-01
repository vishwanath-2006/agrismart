import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

export const DesktopSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole, currentUser, switchRole } = useApp();

  const farmerLinks = [
    { label: 'Farmer Dashboard', path: '/farmer/dashboard', icon: 'space_dashboard' },
    { label: 'Market Comparison', path: '/farmer/market-comparison', icon: 'compare_arrows' },
    { label: 'Mandi Market Prices', path: '/farmer/market-prices', icon: 'trending_up' },
    { label: 'Price History & Forecast', path: '/farmer/price-history', icon: 'insights' },
    { label: 'List / Add Produce', path: '/farmer/add-produce', icon: 'add_circle' },
    { label: 'Live Dispatch Tracking', path: '/farmer/live-tracking', icon: 'navigation' },
    { label: 'Farmer Profile & Settings', path: '/farmer/profile', icon: 'account_circle' }
  ];

  const buyerLinks = [
    { label: 'Buyer Marketplace', path: '/buyer/marketplace', icon: 'storefront' },
    { label: 'Live Price Negotiation', path: '/buyer/negotiation', icon: 'handshake' },
    { label: 'Transporter Matching', path: '/buyer/transporter-matching', icon: 'local_shipping' },
    { label: 'Order Summary & Checkout', path: '/buyer/order-confirmation', icon: 'receipt_long' },
    { label: 'Live Shipment Tracking', path: '/buyer/live-tracking', icon: 'location_on' },
    { label: 'Buyer Profile & History', path: '/buyer/profile', icon: 'account_circle' }
  ];

  const transporterLinks = [
    { label: 'Transporter Dashboard', path: '/transporter/dashboard', icon: 'dashboard' },
    { label: 'AI Route Optimization', path: '/transporter/route-optimization', icon: 'alt_route' },
    { label: 'Live Telemetry & GPS', path: '/transporter/live-tracking', icon: 'navigation' },
    { label: 'Delivery Proof & Signoff', path: '/transporter/delivery-confirmation', icon: 'task_alt' },
    { label: 'Transporter Fleet Profile', path: '/transporter/profile', icon: 'account_circle' }
  ];

  const getLinks = () => {
    switch (currentRole) {
      case 'farmer':
        return farmerLinks;
      case 'buyer':
        return buyerLinks;
      case 'transporter':
        return transporterLinks;
      default:
        return farmerLinks;
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    if (newRole === 'farmer') navigate('/farmer/dashboard');
    else if (newRole === 'buyer') navigate('/buyer/marketplace');
    else if (newRole === 'transporter') navigate('/transporter/dashboard');
  };

  return (
    <aside className="hidden md:flex flex-col w-[280px] shrink-0 min-h-screen bg-surface-container-lowest border-r border-outline-variant/30 p-6 sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/20">
        <img alt="AgriSmart Logo" className="h-11 w-11 object-contain rounded-full shadow-sm" src={LOGO_URL} />
        <div>
          <h2 className="font-title-md text-title-md text-primary font-bold tracking-tight">AgriSmart</h2>
          <p className="text-[12px] font-medium text-on-surface-variant">Marketplace & Logistics</p>
        </div>
      </div>

      {/* Role Selection Box */}
      <div className="my-6 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant px-1 block mb-2">
          Active Role
        </span>
        <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl">
          <button
            onClick={() => handleRoleChange('farmer')}
            className={`py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              currentRole === 'farmer'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Farmer
          </button>
          <button
            onClick={() => handleRoleChange('buyer')}
            className={`py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              currentRole === 'buyer'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Buyer
          </button>
          <button
            onClick={() => handleRoleChange('transporter')}
            className={`py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              currentRole === 'transporter'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Driver
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
          Navigation
        </div>
        {getLinks().map((link, idx) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={idx}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-label-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm shadow-primary/20 font-semibold'
                  : 'text-on-surface hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {link.icon}
              </span>
              <span className="truncate">{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Mini Profile */}
      <div className="pt-4 mt-auto border-t border-outline-variant/20 relative">
        <div
          onClick={() => {
            if (currentRole === 'farmer') navigate('/farmer/profile');
            else if (currentRole === 'buyer') navigate('/buyer/profile');
            else navigate('/transporter/profile');
          }}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer group"
        >
          <img
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
            src={currentUser.avatarUrl}
          />
          <div className="flex-1 min-w-0">
            <p className="font-label-sm text-label-sm font-semibold text-on-surface truncate">{currentUser.name}</p>
            <p className="text-[12px] text-on-surface-variant truncate capitalize">{currentRole} Account</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
        </div>
      </div>
    </aside>
  );
};
