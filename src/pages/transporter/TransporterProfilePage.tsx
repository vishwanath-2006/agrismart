import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TRANSPORTER_AVATAR } from '../../data/mockData';

export const TransporterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, switchRole, logout } = useApp();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppLayout title="Transporter Profile" showBack onBack={() => navigate('/transporter/dashboard')}>
      <div className="flex flex-col w-full gap-5 pb-8">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 bg-surface-container rounded-2xl p-5 shadow-card border border-outline-variant/30 mt-2">
          <div className="relative w-20 h-20 rounded-full bg-surface-container-high shrink-0 overflow-hidden border-2 border-surface-container-lowest shadow-sm">
            <img
              src={currentUser.avatarUrl || TRANSPORTER_AVATAR}
              alt="Marcus Vance"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-tertiary text-on-tertiary p-1 rounded-full shadow-sm flex items-center justify-center border-2 border-surface">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface truncate">
              {currentUser.name}
            </h1>
            <p className="text-[13px] text-on-surface-variant truncate">Heavy Duty Cold-Chain Fleet</p>
            <div className="flex items-center gap-1 mt-1 text-primary text-[12px] font-bold">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Verified Logistics Partner</span>
            </div>
          </div>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Trips Completed */}
          <div className="bg-surface-container-low rounded-2xl p-4 shadow-card border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">route</span>
              <span className="text-[11px] font-bold text-tertiary bg-tertiary-container/30 px-2 py-0.5 rounded-full">
                +12 this mo
              </span>
            </div>
            <div>
              <span className="font-display-lg text-on-surface block font-bold leading-tight">
                {currentUser.tripsCompleted || 842}
              </span>
              <span className="text-[12px] text-on-surface-variant font-medium">Trips Completed</span>
            </div>
          </div>

          {/* Right Column Bento Items */}
          <div className="flex flex-col gap-3">
            <div className="bg-surface-container-low rounded-2xl p-3 shadow-card border border-outline-variant/30 flex-1 flex items-center justify-between">
              <div>
                <span className="font-title-md text-title-md font-bold text-on-surface block leading-tight">
                  {currentUser.reliabilityScore || 4.96}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">Reliability</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>

            <div className="bg-primary rounded-2xl p-3 shadow-card flex-1 flex items-center justify-between text-on-primary">
              <div>
                <span className="font-title-md text-title-md font-bold block leading-tight">
                  {currentUser.totalEarnings || '₹3.4L'}
                </span>
                <span className="text-[11px] opacity-90">Total Earnings</span>
              </div>
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
          </div>
        </div>

        {/* Fleet & Vehicle Details Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h3 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">directions_car</span>
            <span>Registered Vehicle & Permits</span>
          </h3>

          <div className="space-y-2 text-[13px] pt-1">
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Vehicle Model</span>
              <span className="font-semibold text-on-surface">{currentUser.vehicleModel || 'Tata 407 Reefer (4T)'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Registration Plate</span>
              <span className="font-mono font-bold text-on-surface">{currentUser.vehiclePlate || 'KA-09-E-4421'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Temperature Control</span>
              <span className="font-semibold text-tertiary">Active (0°C to 18°C)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-on-surface-variant">All India Agri-Permit</span>
              <span className="font-semibold text-primary">Valid till Dec 2027</span>
            </div>
          </div>
        </div>

        {/* Actions */}
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
