import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { assignRole, currentRole, currentUser, isProfileComplete } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'farmer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);
    try {
      await assignRole(role);
      const isComplete = isProfileComplete(role);
      if (role === 'farmer') {
        navigate(isComplete ? '/farmer/dashboard' : '/farmer/profile');
      } else if (role === 'buyer') {
        navigate(isComplete ? '/buyer/marketplace' : '/buyer/profile');
      } else {
        navigate(isComplete ? '/transporter/dashboard' : '/transporter/profile');
      }
    } catch (err) {
      console.error('Failed to assign role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-start">
      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto h-16 px-margin-mobile md:px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-unit">
            <img alt="AgriSmart AI" className="h-8 w-auto object-contain" src={LOGO_URL} />
            <span className="font-title-md text-title-md text-primary font-bold">AgriSmart</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-primary bg-primary-fixed/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Role Setup
            </span>
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant"
              src={currentUser?.avatarUrl}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative w-full pt-20 pb-28 bg-surface min-h-screen">
        <div className="max-w-2xl mx-auto flex flex-col w-full h-full px-margin-mobile gap-6 pt-4 pb-8">
          {/* Header Typography */}
          <div className="flex flex-col items-center justify-center text-center px-4 mb-2">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface font-bold mb-2">
              How will you use AgriSmart?
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-md">
              Select your primary role to customize your experience. You can change this later in settings.
            </p>
          </div>

          {/* Role Cards List */}
          <div className="flex flex-col gap-5">
            {/* Farmer Card */}
            <div
              onClick={() => setSelectedRole('farmer')}
              className={`w-full text-left bg-surface-container rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group border cursor-pointer ${
                selectedRole === 'farmer' ? 'border-primary ring-2 ring-primary/20 bg-surface-container-lowest' : 'border-transparent'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  agriculture
                </span>
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    agriculture
                  </span>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-title-md text-on-surface font-bold">Farmer</h2>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Seller</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-4">
                    Sell your produce directly to buyers and track market trends.
                  </p>
                  <ul className="flex flex-col gap-2 mb-6">
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm font-bold">check_circle</span>
                      List crops and manage inventory
                    </li>
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm font-bold">check_circle</span>
                      Direct communication with buyers
                    </li>
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm font-bold">check_circle</span>
                      Access AI pricing insights
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole('farmer');
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center h-touch-target-min px-6 bg-primary text-on-primary font-label-sm rounded-full w-full sm:w-auto hover:bg-primary-container active:scale-95 transition-all shadow-sm"
                >
                  Continue as Farmer
                </button>
              </div>
            </div>

            {/* Buyer Card */}
            <div
              onClick={() => setSelectedRole('buyer')}
              className={`w-full text-left bg-surface-container rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group border cursor-pointer ${
                selectedRole === 'buyer' ? 'border-secondary ring-2 ring-secondary/20 bg-surface-container-lowest' : 'border-transparent'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shopping_cart
                </span>
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shopping_basket
                  </span>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-title-md text-on-surface font-bold">Buyer</h2>
                    <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full uppercase">Procurement</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-4">
                    Find fresh produce and connect directly with local farmers.
                  </p>
                  <ul className="flex flex-col gap-2 mb-6">
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-sm font-bold">check_circle</span>
                      Browse verified local listings
                    </li>
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-sm font-bold">check_circle</span>
                      Secure payments and contracts
                    </li>
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-sm font-bold">check_circle</span>
                      Track bulk order fulfillment
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole('buyer');
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center h-touch-target-min px-6 bg-primary text-on-primary font-label-sm rounded-full w-full sm:w-auto hover:bg-primary-container active:scale-95 transition-all shadow-sm"
                >
                  Continue as Buyer
                </button>
              </div>
            </div>

            {/* Transporter Card */}
            <div
              onClick={() => setSelectedRole('transporter')}
              className={`w-full text-left bg-surface-container rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group border cursor-pointer ${
                selectedRole === 'transporter' ? 'border-tertiary ring-2 ring-tertiary/20 bg-surface-container-lowest' : 'border-transparent'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_shipping
                </span>
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center text-on-tertiary-container">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_shipping
                  </span>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-title-md text-on-surface font-bold">Transporter</h2>
                    <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full uppercase">Logistics</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-4">
                    Deliver agricultural orders and earn from farm-to-market logistics.
                  </p>
                  <ul className="flex flex-col gap-2 mb-6">
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-tertiary text-sm font-bold">check_circle</span>
                      Find delivery requests nearby
                    </li>
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-tertiary text-sm font-bold">check_circle</span>
                      Route optimization &amp; tracking
                    </li>
                    <li className="flex items-center gap-2 font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-tertiary text-sm font-bold">check_circle</span>
                      Guaranteed transit payments
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRole('transporter');
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center h-touch-target-min px-6 bg-primary text-on-primary font-label-sm rounded-full w-full sm:w-auto hover:bg-primary-container active:scale-95 transition-all shadow-sm"
                >
                  Continue as Transporter
                </button>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-auto pt-4 flex justify-center w-full">
            <button
              onClick={() => {
                if (currentRole === 'farmer') navigate('/farmer/dashboard');
                else if (currentRole === 'buyer') navigate('/buyer/marketplace');
                else navigate('/transporter/dashboard');
              }}
              className="font-label-sm text-on-surface-variant flex items-center justify-center h-touch-target-min px-4 hover:text-primary transition-colors"
            >
              Change role later in settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
