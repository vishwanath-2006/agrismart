import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { LiveMapPreview } from '../../components/common/LiveMapPreview';

export const LiveTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, orders, currentRole } = useApp();
  const order = activeOrder || orders[0];

  const [progress, setProgress] = useState(65);
  const [speed, setSpeed] = useState(48);

  // Deterministic live GPS progression simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + 1;
      });
      setSpeed(prev => Math.floor(45 + Math.random() * 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout
      title="Live Shipment Tracking"
      showBack
      onBack={() => {
        if (currentRole === 'transporter') navigate('/transporter/dashboard');
        else if (currentRole === 'buyer') navigate('/buyer/marketplace');
        else navigate('/farmer/dashboard');
      }}
    >
      <div className="flex flex-col w-full gap-4 pb-6">
        {/* Live Vector Map with moving truck */}
        <div className="mt-1">
          <LiveMapPreview
            origin={order.farmer.location}
            destination={order.buyer.warehouseAddress}
            progressPercent={progress}
            speedKmh={speed}
            currentLocationDesc="SH-17 near Ramanagara Checkpoint"
            isOptimizedRoute={true}
          />
        </div>

        {/* Cold-Chain Telemetry Bar */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Reefer Temp</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-primary text-[16px]">device_thermostat</span>
              <span className="text-body-md font-bold text-primary">17.8°C</span>
            </div>
            <span className="text-[10px] text-tertiary font-semibold">Optimal</span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Current Speed</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">speed</span>
              <span className="text-body-md font-bold text-secondary">{speed} km/h</span>
            </div>
            <span className="text-[10px] text-on-surface-variant">Smooth Flow</span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Est. Arrival</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-tertiary text-[16px]">schedule</span>
              <span className="text-body-md font-bold text-on-surface">3:45 PM</span>
            </div>
            <span className="text-[10px] text-tertiary font-semibold">On Time</span>
          </div>
        </div>

        {/* Driver & Cargo Info Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={order.transporter?.avatarUrl || order.farmer.avatar}
              alt="Transporter"
              className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0"
            />
            <div>
              <h4 className="font-label-sm font-bold text-on-surface">
                {order.transporter?.name || 'Marcus Vance'}
              </h4>
              <p className="text-[12px] text-on-surface-variant">
                {order.transporter?.vehicleType || 'Tata 407 Cold Chain'} ({order.transporter?.vehiclePlate || 'KA-09-E-4421'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Calling driver at ${order.transporter?.phone || '+91 97411 98765'}`)}
              className="w-10 h-10 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center hover:bg-primary-fixed/50 transition-colors"
              aria-label="Call driver"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </button>
            <button
              onClick={() => alert('Message dispatch: "Driver ETA on track at 3:45 PM"')}
              className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
              aria-label="Message driver"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </button>
          </div>
        </div>

        {/* Shipment Milestones Timeline */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Shipment Timeline</h3>
            <span className="text-[12px] font-bold text-primary">Order #{order.orderNumber}</span>
          </div>

          <div className="space-y-4 pt-2">
            {order.trackingSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                {/* Timeline connector line */}
                {idx < order.trackingSteps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                      step.isCompleted ? 'bg-primary' : 'bg-outline-variant/40'
                    }`}
                  />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    step.isCompleted
                      ? 'bg-primary text-on-primary shadow-sm'
                      : step.isCurrent
                      ? 'bg-tertiary text-on-tertiary ring-4 ring-tertiary-fixed/40'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {step.isCompleted ? 'check' : step.isCurrent ? 'navigation' : 'radio_button_unchecked'}
                  </span>
                </div>

                <div className="flex-1 pb-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4
                      className={`text-[14px] font-bold ${
                        step.isCompleted || step.isCurrent ? 'text-on-surface' : 'text-on-surface-variant/70'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <span className="text-[11px] font-medium text-on-surface-variant">{step.timestamp}</span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: Confirm Delivery */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/transporter/delivery-confirmation')}
            className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Arrived at Warehouse • Confirm Delivery</span>
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
