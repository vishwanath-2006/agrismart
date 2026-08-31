import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { LiveMapPreview } from '../../components/common/LiveMapPreview';

export const RouteOptimizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, startTrip, orders } = useApp();

  const order = activeOrder || orders[0];

  if (!order) {
    return (
      <AppLayout title="Route & Trip" showBack onBack={() => navigate('/transporter/dashboard')}>
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 gap-3 mt-6">
          <span className="material-symbols-outlined text-[44px] text-on-surface-variant/50">local_shipping</span>
          <h3 className="text-title-md font-bold text-on-surface">No active delivery found</h3>
          <p className="text-body-md text-on-surface-variant">Please accept a load from your dashboard first.</p>
          <button
            onClick={() => navigate('/transporter/dashboard')}
            className="mt-2 h-touch-target-min px-6 bg-primary text-on-primary font-bold rounded-xl text-label-sm shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleStartTrip = () => {
    startTrip(order.id);
    navigate('/transporter/live-tracking');
  };

  const pickupLocation = order.farmer?.location || 'Mysore Farm Gate';
  const deliveryLocation = order.buyer?.warehouseAddress ? order.buyer.warehouseAddress.split(',')[0] : 'Bangalore Central Depot';
  const distanceKm = order.routeDetails?.distanceKm || 145;
  const durationStr = order.routeDetails?.durationStr || '3h 30m';

  return (
    <AppLayout title="Route & Trip" showBack onBack={() => navigate('/transporter/dashboard')}>
      <div className="flex flex-col w-full gap-4 pb-12">
        
        {/* Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Route &amp; Trip</h2>
          <p className="text-[13px] text-on-surface-variant">Review your route before starting the trip</p>
        </div>

        {/* 1. Delivery Summary Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full">
              Delivery Details
            </span>
            <span className="text-[12px] font-bold text-primary">₹{order.transportCost.toLocaleString()} (Calculated)</span>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <img
              src={order.produceImage}
              alt={order.cropName}
              className="w-13 h-13 rounded-xl object-cover border border-outline-variant/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                {order.cropName} ({order.quantityKg} kg)
              </h3>
              <p className="text-[12px] text-on-surface-variant mt-0.5">
                From: <span className="font-semibold text-on-surface">{pickupLocation}</span>
              </p>
              <p className="text-[12px] text-on-surface-variant">
                To: <span className="font-semibold text-on-surface">{deliveryLocation}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Planned Route Map Overview */}
        <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-bold text-on-surface">Planned Route Overview</span>
            <span className="text-[11px] text-on-surface-variant">{distanceKm} km • ~{durationStr}</span>
          </div>

          <div className="rounded-xl overflow-hidden">
            <LiveMapPreview
              origin={`Pickup: ${pickupLocation}`}
              destination={`Drop: ${deliveryLocation}`}
              progressPercent={15}
              speedKmh={0}
              currentLocationDesc="Staged at Pickup Bay"
              isOptimizedRoute={true}
            />
          </div>
        </div>

        {/* 3. AI Route Recommendation Banner */}
        <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-2xl shadow-card flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary-fixed flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              Recommended Route
            </span>
            <span className="text-[10px] opacity-80">AI demo recommendation</span>
          </div>
          <p className="text-body-md leading-snug">
            Corridor via <span className="font-bold">NH-275 / Mandya Bypass</span> offers smooth multi-lane transit and estimated savings of ~1.8L fuel.
          </p>
        </div>

        {/* 4. Route Stats Bento Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Total Distance</span>
            <span className="text-title-md font-bold text-on-surface">{distanceKm} km</span>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Est. Duration</span>
            <span className="text-title-md font-bold text-primary">~{durationStr}</span>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Demo Savings</span>
            <span className="text-title-md font-bold text-tertiary">~1.8L</span>
          </div>
        </div>

        {/* 5. Waypoints Timeline Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Route Milestones</h3>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed/40 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">trip_origin</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-sm font-bold text-on-surface">1. Pickup — {pickupLocation}</h4>
                <p className="text-[12px] text-on-surface-variant">Farmer: {order.farmer?.name || 'Farmer'} • Cargo: {order.quantityKg}kg {order.cropName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-sm font-bold text-on-surface">2. Waypoint — Mandya Expressway Bypass</h4>
                <p className="text-[12px] text-on-surface-variant">Multi-lane expressway corridor</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed/40 text-tertiary flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-sm font-bold text-on-surface">3. Delivery — {deliveryLocation}</h4>
                <p className="text-[12px] text-on-surface-variant">Buyer: {order.buyer?.name || 'Buyer'} • Quality &amp; weighbridge check</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Start Trip Action & Location Notice */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleStartTrip}
            className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Start Trip &amp; Broadcast Live GPS</span>
            <span className="material-symbols-outlined text-[20px]">navigation</span>
          </button>
          <p className="text-[11px] text-center text-on-surface-variant">
            Your live GPS location will begin broadcasting to the buyer and farmer after you start the trip.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
