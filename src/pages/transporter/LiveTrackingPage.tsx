import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { LiveMapPreview } from '../../components/common/LiveMapPreview';
import { useLiveTracking } from '../../hooks/useLiveTracking';

export const LiveTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, orders, currentRole } = useApp();
  const order = activeOrder || (orders.length > 0 ? orders[0] : null);

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
    orderId: order?.id || '',
    isDriver: isDriverRole,
    destinationCoords,
    originCoords
  });

  if (!order) {
    return (
      <AppLayout
        title="Live Delivery Tracking"
        showBack
        onBack={() => {
          if (currentRole === 'transporter') navigate('/transporter/dashboard');
          else if (currentRole === 'buyer') navigate('/buyer/marketplace');
          else navigate('/farmer/dashboard');
        }}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 gap-3 mt-6">
          <span className="material-symbols-outlined text-[44px] text-on-surface-variant/50">local_shipping</span>
          <h3 className="text-title-md font-bold text-on-surface">No active delivery</h3>
          <p className="text-body-md text-on-surface-variant">There is no shipment currently being tracked.</p>
          <button
            onClick={() => {
              if (currentRole === 'transporter') navigate('/transporter/dashboard');
              else if (currentRole === 'buyer') navigate('/buyer/marketplace');
              else navigate('/farmer/dashboard');
            }}
            className="mt-2 h-touch-target-min px-6 bg-primary text-on-primary font-bold rounded-xl text-label-sm shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  // Delivery status formatting
  const isTripStarted =
    order.status === 'IN_TRANSIT' ||
    order.status === 'ARRIVING' ||
    order.status === 'DELIVERED' ||
    order.status === 'PAYMENT_RELEASED' ||
    order.status === 'COMPLETED';

  const isGpsActive = gpsStatus === 'LIVE' && latitude !== null && longitude !== null;

  // 4-Step Delivery Progress State Mapping
  const progressSteps = [
    {
      id: 'pickup',
      title: 'Pickup Completed',
      desc: `Farm Gate • ${order.farmer.location}`,
      isDone: isTripStarted || order.status === 'PICKED_UP' || order.status === 'TRANSPORTER_ASSIGNED',
      isCurrent: order.status === 'ORDER_PLACED' || order.status === 'TRANSPORTER_ASSIGNED'
    },
    {
      id: 'transit',
      title: 'In Transit',
      desc: 'On the way via NH-275 corridor',
      isDone: order.status === 'ARRIVING' || order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' || order.status === 'COMPLETED',
      isCurrent: order.status === 'IN_TRANSIT' || order.status === 'PICKED_UP'
    },
    {
      id: 'arrived',
      title: 'Arrived at Warehouse',
      desc: `Depot • ${order.buyer.warehouseAddress.split(',')[0]}`,
      isDone: order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' || order.status === 'COMPLETED',
      isCurrent: order.status === 'ARRIVING'
    },
    {
      id: 'delivered',
      title: 'Delivered & Escrow Released',
      desc: 'Quality inspection verified',
      isDone: order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' || order.status === 'COMPLETED',
      isCurrent: false
    }
  ];

  return (
    <AppLayout
      title="Live Delivery Tracking"
      showBack
      onBack={() => {
        if (currentRole === 'transporter') navigate('/transporter/dashboard');
        else if (currentRole === 'buyer') navigate('/buyer/marketplace');
        else navigate('/farmer/dashboard');
      }}
    >
      <div className="flex flex-col w-full gap-4 pb-12">
        
        {/* 1. Header with Order Context */}
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-title-md font-title-md font-bold text-on-surface">Live Delivery Tracking</h2>
            <span className="text-[12px] font-bold text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full">
              Order #{order.orderNumber}
            </span>
          </div>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            {order.cropName} • {order.quantityKg} kg • {order.farmer.location} → {order.buyer.warehouseAddress.split(',')[0]}
          </p>
        </div>

        {/* 2. Prominent Live Status Card */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all ${
          isGpsActive
            ? 'bg-primary-fixed/20 border-primary/40 shadow-sm'
            : isTripStarted
            ? 'bg-surface-container-low border-outline-variant/30'
            : 'bg-surface-container-lowest border-outline-variant/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                isGpsActive
                  ? 'bg-primary animate-pulse'
                  : isTripStarted
                  ? 'bg-secondary animate-ping'
                  : 'bg-outline'
              }`} />
              <span className="font-bold text-body-md text-on-surface">
                {isGpsActive
                  ? '● LIVE — Driver Location Updating'
                  : isTripStarted
                  ? '○ Location Connecting / Staging'
                  : '○ Trip Not Started'}
              </span>
            </div>
            <span className="text-[11px] font-medium text-on-surface-variant">
              {isGpsActive && lastUpdated ? `Updated at ${lastUpdated}` : isTripStarted ? 'Waiting for GPS' : 'Staged at pickup'}
            </span>
          </div>

          <p className="text-[12px] text-on-surface-variant pl-5">
            {isGpsActive
              ? `Realtime GPS active from transporter device. Direct distance remaining: ~${distanceRemainingKm || 145} km.`
              : isTripStarted
              ? 'Waiting for the driver\'s next GPS update from the transit corridor.'
              : 'Live location will begin sharing when the transporter starts the trip.'}
          </p>
        </div>

        {/* Permission Denied Alert (If driver denied GPS) */}
        {gpsStatus === 'PERMISSION_DENIED' && (
          <div className="p-3.5 bg-error-container/30 text-error rounded-2xl border border-error/20 text-label-sm font-semibold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
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

        {/* 3. Real Leaflet Map */}
        <div className="rounded-2xl overflow-hidden shadow-card border border-outline-variant/30">
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
                ? `Driver GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
                : isTripStarted
                ? 'Waiting for driver GPS satellite lock...'
                : 'Vehicle staged at Farm Gate'
            }
            isOptimizedRoute={true}
          />
        </div>

        {/* 4. Telemetry Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">GPS Telemetry</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-primary text-[16px]">sensors</span>
              <span className="text-body-md font-bold text-primary">
                {isGpsActive ? 'Active' : isTripStarted ? 'Acquiring' : 'Standby'}
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant block">Driver GPS</span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Vehicle Speed</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">speed</span>
              <span className="text-body-md font-bold text-secondary">
                {speedKmh !== null && speedKmh !== undefined ? `${speedKmh} km/h` : '0 km/h'}
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant block">
              {speedKmh && speedKmh > 0 ? 'In Motion' : 'Stationary'}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 text-center">
            <span className="text-[11px] text-on-surface-variant font-medium block">Distance Left</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-tertiary text-[16px]">navigation</span>
              <span className="text-body-md font-bold text-on-surface">
                {distanceRemainingKm !== null && distanceRemainingKm !== undefined
                  ? `~${distanceRemainingKm} km`
                  : '~145 km'}
              </span>
            </div>
            <span className="text-[10px] text-tertiary font-semibold">Calculated</span>
          </div>
        </div>

        {/* 5. Driver & Vehicle Information Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={order.transporter?.avatarUrl || order.farmer.avatar}
              alt="Transporter"
              className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-label-sm font-bold text-on-surface">
                  {order.transporter?.name || 'Marcus Vance'}
                </h4>
                <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                  Demo profile
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                {order.transporter?.vehicleType || 'Tata 407 Reefer'} • {order.transporter?.vehiclePlate || 'KA-09-E-4421'}
              </p>
              <p className="text-[11px] text-primary font-semibold mt-0.5">
                Status: {isTripStarted ? 'On trip to delivery' : 'Assigned to order'}
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

        {/* 6. 4-Step Delivery Progress Timeline */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Delivery Progress</h3>
            <span className="text-[12px] font-bold text-primary">Order #{order.orderNumber}</span>
          </div>

          <div className="space-y-4 pt-2">
            {progressSteps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-3 relative">
                {/* Timeline connector line */}
                {idx < progressSteps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                      step.isDone ? 'bg-primary' : 'bg-outline-variant/40'
                    }`}
                  />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    step.isDone
                      ? 'bg-primary text-on-primary shadow-sm'
                      : step.isCurrent
                      ? 'bg-tertiary text-on-tertiary ring-4 ring-tertiary-fixed/40'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {step.isDone ? 'check' : step.isCurrent ? 'navigation' : 'radio_button_unchecked'}
                  </span>
                </div>

                <div className="flex-1 pb-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4
                      className={`text-[14px] font-bold ${
                        step.isDone || step.isCurrent ? 'text-on-surface' : 'text-on-surface-variant/70'
                      }`}
                    >
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Action Button */}
        <div className="pt-2">
          {isDriverRole ? (
            <button
              onClick={() => navigate('/transporter/delivery-confirmation')}
              className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
              className="w-full min-h-[50px] bg-surface-container text-on-surface rounded-2xl font-label-sm font-semibold hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
