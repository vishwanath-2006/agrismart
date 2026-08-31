import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { LiveMapPreview } from '../../components/common/LiveMapPreview';
import { useLiveTracking } from '../../hooks/useLiveTracking';

export const LiveTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, orders, currentRole } = useApp();
  const order = activeOrder || orders[0];

  const isDriverRole = currentRole === 'transporter';

  // Origin Farm and Destination Warehouse coordinates (Mysore & Bangalore APMC depot)
  const originCoords = { lat: 12.2958, lng: 76.6394 };
  const destinationCoords = { lat: 12.9654, lng: 77.5786 };

  const {
    latitude,
    longitude,
    accuracy,
    speedKmh,
    gpsStatus,
    errorMessage,
    lastUpdated,
    distanceRemainingKm,
    startDriverTracking
  } = useLiveTracking({
    orderId: order.id,
    isDriver: isDriverRole,
    destinationCoords,
    originCoords
  });

  return (
    <AppLayout
      title={
        isDriverRole
          ? 'Live Dispatch Telemetry'
          : currentRole === 'buyer'
          ? 'Buyer Live Shipment Tracking'
          : 'Farmer Live Dispatch Tracking'
      }
      showBack
      onBack={() => {
        if (currentRole === 'transporter') navigate('/transporter/dashboard');
        else if (currentRole === 'buyer') navigate('/buyer/marketplace');
        else navigate('/farmer/dashboard');
      }}
    >
      <div className="flex flex-col w-full gap-4 pb-6">
        {/* Permission Denied / Error Alert Banner */}
        {gpsStatus === 'PERMISSION_DENIED' && (
          <div className="p-3.5 bg-error-container/30 text-error rounded-2xl border border-error/20 text-label-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">location_disabled</span>
              <span>{errorMessage || 'Location permission is required for live tracking.'}</span>
            </div>
            {isDriverRole && (
              <button
                type="button"
                onClick={startDriverTracking}
                className="px-3 py-1 bg-error text-on-error rounded-xl text-[12px] font-bold shrink-0 hover:bg-error/90"
              >
                Enable GPS
              </button>
            )}
          </div>
        )}

        {/* Real Live Leaflet Map */}
        <div className="mt-1">
          <LiveMapPreview
            origin={order.farmer.location}
            destination={order.buyer.warehouseAddress}
            driverLat={latitude}
            driverLng={longitude}
            originLat={originCoords.lat}
            originLng={originCoords.lng}
            destLat={destinationCoords.lat}
            destLng={destinationCoords.lng}
            speedKmh={speedKmh}
            accuracy={accuracy}
            lastUpdated={lastUpdated}
            gpsStatus={gpsStatus}
            distanceRemainingKm={distanceRemainingKm}
            currentLocationDesc={
              latitude && longitude
                ? `Live GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
                : 'Connecting to Realtime GPS Broadcast...'
            }
            isOptimizedRoute={true}
          />
        </div>

        {/* Real Telemetry Bar */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Reefer Temp</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-primary text-[16px]">device_thermostat</span>
              <span className="text-body-md font-bold text-primary">17.8°C</span>
            </div>
            <span className="text-[10px] text-tertiary font-semibold">Sensor Active</span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Current Speed</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">speed</span>
              <span className="text-body-md font-bold text-secondary">
                {speedKmh !== null && speedKmh !== undefined ? `${speedKmh} km/h` : 'Unavailable'}
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant">
              {speedKmh !== null && speedKmh > 0 ? 'In Motion' : 'Stationary / Idle'}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-card text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Distance Left</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-tertiary text-[16px]">navigation</span>
              <span className="text-body-md font-bold text-on-surface">
                {distanceRemainingKm !== null && distanceRemainingKm !== undefined
                  ? `~${distanceRemainingKm} km`
                  : 'Calculating'}
              </span>
            </div>
            <span className="text-[10px] text-tertiary font-semibold">Direct Line</span>
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
                {order.transporter?.name || 'Driver Logistics'}
              </h4>
              <p className="text-[12px] text-on-surface-variant">
                {order.transporter?.vehicleType || '4-Wheeler Tempo Reefer'} ({order.transporter?.vehiclePlate || 'KA-09-E-4421'})
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
              onClick={() => alert(`Messaging dispatch for Order #${order.orderNumber}`)}
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

        {/* Action Button: Driver Arrived Confirmation (only for transporter) or Dashboard link for Buyer/Farmer */}
        <div className="pt-2">
          {isDriverRole ? (
            <button
              onClick={() => navigate('/transporter/delivery-confirmation')}
              className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Arrived at Warehouse • Confirm Delivery</span>
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentRole === 'buyer') navigate('/buyer/marketplace');
                else navigate('/farmer/dashboard');
              }}
              className="w-full h-touch-target-min bg-surface-container text-on-surface rounded-2xl font-label-sm font-semibold hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
