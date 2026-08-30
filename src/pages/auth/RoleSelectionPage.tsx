import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { assignRole, currentUser, supabaseUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName =
    supabaseUser?.user_metadata?.full_name ||
    supabaseUser?.user_metadata?.name ||
    currentUser.name ||
    'Agri Partner';

  const roleOptions: Array<{
    role: UserRole;
    title: string;
    description: string;
    icon: string;
    badge: string;
  }> = [
    {
      role: 'farmer',
      title: 'Farmer / Producer',
      description: 'List fresh harvests, compare real-time APMC Mandi rates, and maximize your net farm returns.',
      icon: 'agriculture',
      badge: 'Seller'
    },
    {
      role: 'buyer',
      title: 'Buyer / Wholesale Trader',
      description: 'Procure verified Grade A commodities directly from farms, negotiate deals, and fund secure escrow.',
      icon: 'shopping_bag',
      badge: 'Procurement'
    },
    {
      role: 'transporter',
      title: 'Transporter / Fleet Driver',
      description: 'Accept high-demand agricultural dispatch loads, optimize highway routes, and earn direct escrow payouts.',
      icon: 'local_shipping',
      badge: 'Logistics'
    }
  ];

  const handleConfirmRole = async () => {
    setIsSubmitting(true);
    try {
      await assignRole(selectedRole);
      if (selectedRole === 'farmer') navigate('/farmer/dashboard', { replace: true });
      else if (selectedRole === 'buyer') navigate('/buyer/marketplace', { replace: true });
      else navigate('/transporter/dashboard', { replace: true });
    } catch (err) {
      console.error('Error assigning role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between p-4 md:p-8">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between max-w-lg w-full mx-auto py-2">
        <div className="flex items-center gap-2">
          <img alt="AgriSmart AI Logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
          <span className="font-title-md text-title-md text-primary font-bold">AgriSmart AI</span>
        </div>
        <span className="text-[11px] font-bold text-tertiary bg-tertiary-fixed/30 px-3 py-1 rounded-full uppercase tracking-wider">
          Profile Setup
        </span>
      </div>

      {/* Main Content Box */}
      <div className="max-w-lg w-full mx-auto my-auto py-6 flex flex-col gap-5">
        <div className="text-center">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
            Welcome, {displayName}!
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Choose your primary role to customize your marketplace experience.
          </p>
        </div>

        {/* Persona Options Grid */}
        <div className="space-y-3">
          {roleOptions.map(option => {
            const isSelected = selectedRole === option.role;
            return (
              <div
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-card relative flex items-start gap-4 ${
                  isSelected
                    ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary/30'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {option.icon}
                  </span>
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-title-md text-body-md font-bold text-on-surface">
                      {option.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant leading-snug mt-1">
                    {option.description}
                  </p>
                </div>

                {/* Radio selection indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-primary bg-primary' : 'border-outline-variant bg-transparent'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-on-primary" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirmRole}
            disabled={isSubmitting}
            className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Get Started as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-center text-[12px] text-on-surface-variant/80 py-2">
        You can seamlessly switch roles anytime from your profile or header menu.
      </div>
    </div>
  );
};
