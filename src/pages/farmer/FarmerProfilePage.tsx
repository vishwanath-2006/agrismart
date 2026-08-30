import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { FARMER_AVATAR } from '../../data/mockData';

export const FarmerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, switchRole, produceListings } = useApp();

  return (
    <AppLayout title="Farmer Profile" showBack onBack={() => navigate('/farmer/dashboard')}>
      <div className="flex flex-col w-full gap-5 pb-8">
        {/* Profile Header & Identity */}
        <section className="flex flex-col items-center text-center mt-2">
          <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-card border-4 border-surface-container-lowest mb-3">
            <img
              src={currentUser.avatarUrl || FARMER_AVATAR}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-tertiary w-7 h-7 rounded-full flex items-center justify-center border-2 border-surface shadow-sm">
              <span className="material-symbols-outlined text-on-tertiary text-[16px]">verified</span>
            </div>
          </div>

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
            {currentUser.name}
          </h1>
          <div className="flex items-center gap-1 text-on-surface-variant font-body-md text-[14px] mt-0.5">
            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
            <span>{currentUser.location}</span>
          </div>

          {/* Stats Row */}
          <div className="flex w-full mt-5 bg-surface-container-low rounded-2xl p-4 shadow-card border border-outline-variant/30">
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
              <span className="font-title-md text-title-md font-bold text-primary">{currentUser.totalSales || '₹1.2L'}</span>
              <span className="text-[12px] text-on-surface-variant font-medium">Total Sales</span>
            </div>
            <div className="w-px h-8 bg-outline-variant/40 self-center" />
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
              <span className="font-title-md text-title-md font-bold text-primary">{produceListings.length}</span>
              <span className="text-[12px] text-on-surface-variant font-medium">Listings</span>
            </div>
            <div className="w-px h-8 bg-outline-variant/40 self-center" />
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
              <div className="flex items-center gap-1 font-title-md text-title-md font-bold text-primary">
                <span>{currentUser.rating || 4.9}</span>
                <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              </div>
              <span className="text-[12px] text-on-surface-variant font-medium">Rating</span>
            </div>
          </div>
        </section>

        {/* Account Sections */}
        <section className="flex flex-col gap-2">
          <h2 className="font-title-md text-title-md font-bold text-on-surface px-1">Account & Farm Settings</h2>
          
          <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
            <button
              onClick={() => alert('Personal details: Ramesh Kumar, Phone: +91 98450 12345')}
              className="flex items-center gap-3.5 p-4 w-full text-left hover:bg-surface-container-low active:bg-surface-container transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">Personal Details</h3>
                <p className="text-[12px] text-on-surface-variant">Update contact info & language</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
            </button>

            <button
              onClick={() => alert('Payout Account: State Bank of India •••• 4421 (Active)')}
              className="flex items-center gap-3.5 p-4 w-full text-left hover:bg-surface-container-low active:bg-surface-container transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-fixed/30 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">Bank & Payout Mandate</h3>
                <p className="text-[12px] text-on-surface-variant">Direct Mandi payment settlement</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
            </button>

            <button
              onClick={() => alert('Farm Location: Mysore Farm Gate 2, Plot 4A (2.4 Acres)')}
              className="flex items-center gap-3.5 p-4 w-full text-left hover:bg-surface-container-low active:bg-surface-container transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed/30 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">agriculture</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">Farm Locations & Land Records</h3>
                <p className="text-[12px] text-on-surface-variant">GPS boundary & soil verification</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
            </button>

            <button
              onClick={() => alert('Daily SMS and WhatsApp Mandi alerts enabled.')}
              className="flex items-center gap-3.5 p-4 w-full text-left hover:bg-surface-container-low active:bg-surface-container transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">SMS & Mandi Alerts</h3>
                <p className="text-[12px] text-on-surface-variant">Daily price ticker subscriptions</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Persona Switch / Logout actions */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => {
              switchRole('buyer');
              navigate('/buyer/marketplace');
            }}
            className="w-full h-touch-target-min bg-surface-container-high text-on-surface rounded-2xl font-label-sm font-semibold hover:bg-surface-container flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            Switch to Buyer View
          </button>

          <button
            onClick={() => navigate('/login')}
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
