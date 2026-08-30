import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { LiveMapPreview } from '../../components/common/LiveMapPreview';

export const RouteOptimizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, startTrip, orders } = useApp();

  const order = activeOrder || orders[0];

  const handleStartTrip = () => {
    startTrip(order.id);
    navigate('/transporter/live-tracking');
  };

  return (
    <AppLayout title="Route Optimization" showBack onBack={() => navigate('/transporter/dashboard')}>
      <div className="flex flex-col w-full gap-4 pb-6">
        {/* Map Overview */}
        <div className="mt-1">
          <LiveMapPreview
            origin="Mysore Farm, Gate 2"
            destination="KR Market Depot 4B, Bangalore"
            progressPercent={20}
            speedKmh={0}
            currentLocationDesc="Staged at Pickup Bay (Mysore)"
            isOptimizedRoute={true}
          />
        </div>

        {/* AI Route Advisory Badge */}
        <div className="bg-primary-container text-on-primary-container p-4 rounded-2xl shadow-card relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5 text-tertiary-fixed">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <h3 className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
              AI Dynamic Dispatch Guidance
            </h3>
          </div>
          <p className="text-body-md font-body-md opacity-95 leading-snug">
            Expressway routing via <span className="font-bold">NH-275 / SH-17 Mandya Bypass</span> avoids town congestion and reduces perishable shock vibration by 40%.
          </p>
        </div>

        {/* Route Stats Bento Box */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Total Distance</span>
            <span className="text-title-md font-bold text-on-surface">145 km</span>
          </div>
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Est. Duration</span>
            <span className="text-title-md font-bold text-primary">3h 25m</span>
          </div>
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Fuel Savings</span>
            <span className="text-title-md font-bold text-tertiary">12%</span>
          </div>
        </div>

        {/* Waypoints Timeline Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Optimized Waypoints</h3>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed/40 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">trip_origin</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-sm font-bold text-on-surface">Pickup: Mysore Farm Gate 2</h4>
                <p className="text-[12px] text-on-surface-variant">Farmer: Ramesh Kumar • Cargo: 500kg Tomato</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-sm font-bold text-on-surface">Waypoint: Mandya Expressway Bypass</h4>
                <p className="text-[12px] text-on-surface-variant">Smooth surface corridor • Toll: ₹180</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed/40 text-tertiary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-sm font-bold text-on-surface">Drop: KR Market Depot 4B, Bangalore</h4>
                <p className="text-[12px] text-on-surface-variant">Buyer: XYZ Traders • Quality Weighbridge Check</p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Trip CTA */}
        <div className="pt-2">
          <button
            onClick={handleStartTrip}
            className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Start Trip & Broadcast Live GPS</span>
            <span className="material-symbols-outlined text-[20px]">navigation</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
