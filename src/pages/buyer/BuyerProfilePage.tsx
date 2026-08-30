import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { BUYER_AVATAR } from '../../data/mockData';

export const BuyerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, switchRole, orders, logout } = useApp();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppLayout title="Buyer Profile" showBack onBack={() => navigate('/buyer/marketplace')}>
      <div className="flex flex-col w-full gap-5 pb-8">
        {/* Corporate Profile Card */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-card bg-surface-container-low border border-outline-variant/30 mt-2">
          <div className="h-28 bg-primary/10 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-primary bg-surface/80 px-3 py-1 rounded-full backdrop-blur-sm">
              Verified Enterprise Buyer
            </span>
          </div>

          <div className="px-4 pb-5 relative z-10 flex flex-col items-center -mt-10 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container shadow-sm p-1 border-2 border-surface-container-lowest overflow-hidden">
              <img
                src={currentUser.avatarUrl || BUYER_AVATAR}
                alt="XYZ Traders"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h2 className="mt-2.5 font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
              {currentUser.businessName || 'XYZ Traders'}
            </h2>
            <p className="font-body-md text-on-surface-variant text-[13px] flex items-center gap-1 justify-center mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
              Represented by {currentUser.name}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 bg-tertiary-container text-on-tertiary-container px-3 py-0.5 rounded-full text-[12px] font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              APMC Licensed Buyer
            </span>
          </div>
        </div>

        {/* 3-Column Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/30 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary mb-1 text-[22px]">shopping_basket</span>
            <span className="font-title-md text-title-md font-bold text-on-surface">{orders.length + 140}</span>
            <span className="text-[11px] font-medium text-on-surface-variant leading-tight mt-0.5">Orders Placed</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/30 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-secondary mb-1 text-[22px]">handshake</span>
            <span className="font-title-md text-title-md font-bold text-on-surface">3</span>
            <span className="text-[11px] font-medium text-on-surface-variant leading-tight mt-0.5">Active Deals</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-card border border-outline-variant/30 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-tertiary mb-1 text-[22px]">stars</span>
            <span className="font-title-md text-title-md font-bold text-on-surface">98</span>
            <span className="text-[11px] font-medium text-on-surface-variant leading-tight mt-0.5">Trust Score</span>
          </div>
        </div>

        {/* Business Information Section */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 overflow-hidden flex flex-col">
          <div className="p-3.5 bg-surface-container-low/60 flex items-center gap-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
            <h3 className="font-title-md text-body-md font-bold text-on-surface">Business & Compliance</h3>
          </div>
          <div className="p-4 flex flex-col gap-3 text-[13px]">
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Trade Entity</span>
              <span className="font-semibold text-on-surface">XYZ Agri Traders Pvt Ltd</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">GSTIN</span>
              <span className="font-semibold text-on-surface font-mono">29AABCU9603R1ZM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Default Warehouse</span>
              <span className="font-semibold text-on-surface text-right">KR Market Depot 4B, Bangalore</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-on-surface-variant">Payment Terms</span>
              <span className="font-semibold text-tertiary">AgriEscrow Instant Release</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={() => {
              switchRole('farmer');
              navigate('/farmer/dashboard');
            }}
            className="w-full h-touch-target-min bg-surface-container-high text-on-surface rounded-2xl font-label-sm font-semibold hover:bg-surface-container flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">agriculture</span>
            Switch to Farmer View
          </button>

          <button
            onClick={handleSignOut}
            className="w-full h-touch-target-min bg-error-container/20 text-error rounded-2xl font-label-sm font-semibold hover:bg-error-container/30 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
