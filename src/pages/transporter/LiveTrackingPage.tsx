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
        title="Live Dispatch Tracking"
        showBack
        onBack={() => {
          if (currentRole === 'transporter') navigate('/transporter/dashboard');
          else if (currentRole === 'buyer') navigate('/buyer/marketplace');
          else navigate('/farmer/dashboard');
        }}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 gap-3 mt-6">
          <span className="material-symbols-outlined text-[44px] text-on-surface-variant/50">local_shipping</span>
          <h3 className="text-title-md font-bold text-on-surface">No active dispatch</h3>
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

  // Status Badge Metadata
  const getDeliveryStatusMeta = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED':
        return { label: 'Order Placed', badgeClass: 'bg-surface-container text-on-surface-variant border-outline-variant/40' };
      case 'TRANSPORTER_ASSIGNED':
        return { label: 'Transporter Assigned', badgeClass: 'bg-secondary-fixed text-on-secondary-fixed border-secondary/30' };
      case 'PICKED_UP':
        return { label: 'Out for Delivery', badgeClass: 'bg-primary-fixed text-on-primary-fixed border-primary/30' };
      case 'IN_TRANSIT':
        return { label: 'In Transit', badgeClass: 'bg-primary text-on-primary border-primary' };
      case 'ARRIVING':
        return { label: 'Arriving Soon', badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/30' };
      case 'DELIVERED':
        return { label: 'Delivered', badgeClass: 'bg-primary-fixed text-on-primary-fixed border-primary/30' };
      case 'PAYMENT_RELEASED':
      case 'COMPLETED':
        return { label: 'Completed', badgeClass: 'bg-primary-fixed text-on-primary-fixed border-primary/30' };
      default:
        return { label: 'In Transit', badgeClass: 'bg-primary text-on-primary border-primary' };
    }
  };

  const statusMeta = getDeliveryStatusMeta(order.status);

  // Distance Metrics
  const totalRouteDistanceKm = order.routeDetails?.distanceKm || 145;
  const effectiveRemainingKm = distanceRemainingKm !== null && distanceRemainingKm !== undefined ? distanceRemainingKm : 145;
  const distanceCoveredKm = Math.max(0, Math.min(totalRouteDistanceKm, totalRouteDistanceKm - effectiveRemainingKm));

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

  // Crates calculation (assuming standard 20kg crates)
  const totalCrates = Math.ceil(order.quantityKg / 20);

  return (
    <AppLayout
      title="Live Dispatch Tracking"
      showBack
      maxWidthClass="max-w-6xl lg:max-w-7xl w-full"
      onBack={() => {
        if (currentRole === 'transporter') navigate('/transporter/dashboard');
        else if (currentRole === 'buyer') navigate('/buyer/marketplace');
        else navigate('/farmer/dashboard');
      }}
    >
      <div className="flex flex-col w-full gap-2.5 pb-2">
        
        {/* 1. Header with Highlighted Produce Badges & Order Reference */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-0.5">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">Live Delivery Tracking</h1>
            
            {/* Highlighted Produce Details */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs">
              {/* Crop */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                🌱 {order.cropName} {order.variety ? `(${order.variety.split(' ')[0]})` : '(Hybrid)'}
              </span>

              {/* Net Weight */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 font-medium border border-gray-200">
                ⚖️ {order.quantityKg ? `${order.quantityKg.toLocaleString()} kg` : '500 kg'}
              </span>

              {/* Price / Total Value */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-semibold border border-amber-200">
                💰 ₹{(order.totalAmount || order.produceSubtotal || 18500).toLocaleString()} <span className="text-[11px] text-amber-700 font-normal ml-1">(₹{order.agreedPricePerKg || 37}/kg)</span>
              </span>

              {/* Route / Destination */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-medium border border-blue-200">
                📍 {order.farmer.location.split(',')[0]} <span className="mx-1 text-blue-400">→</span> {order.buyer.warehouseAddress.split(',')[0]}
              </span>
            </div>
          </div>

          {/* Retained Order Badge */}
          <div className="self-start md:self-auto">
            <span className="px-3 py-1 text-xs font-bold tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
              Order #{order.orderNumber}
            </span>
          </div>
        </div>

        {/* 2. Compact Live Telemetry Status Banner */}
        <div className={`px-3.5 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-xs shadow-subtle ${
          isGpsActive
            ? 'bg-primary-fixed/20 border-primary/40'
            : isTripStarted
            ? 'bg-surface-container-low border-outline-variant/30'
            : 'bg-surface-container-lowest border-outline-variant/30'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isGpsActive
                ? 'bg-primary animate-pulse'
                : isTripStarted
                ? 'bg-secondary animate-ping'
                : 'bg-outline'
            }`} />
            <span className="font-bold text-on-surface truncate">
              {isGpsActive
                ? '● LIVE — Real-Time Telemetry Active'
                : isTripStarted
                ? '○ Acquiring Vehicle GPS'
                : '○ Staged at Farm Origin'}
            </span>
            <span className="text-on-surface-variant hidden md:inline">• Direct distance remaining: ~{effectiveRemainingKm} km</span>
          </div>
          <span className="text-[11px] text-on-surface-variant shrink-0 font-medium">
            {isGpsActive && lastUpdated ? `Updated at ${lastUpdated}` : 'GPS Ready'}
          </span>
        </div>

        {/* Location Permission Alert */}
        {gpsStatus === 'PERMISSION_DENIED' && (
          <div className="p-2.5 bg-error-container/30 text-error rounded-xl border border-error/20 text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[18px]">location_disabled</span>
              <span className="truncate">{errorMessage || 'Location permission required for live telemetry.'}</span>
            </div>
            {isDriverRole && (
              <button
                type="button"
                onClick={startDriverTracking}
                className="px-2.5 py-0.5 bg-error text-on-error rounded-lg text-xs font-bold shrink-0 hover:bg-error/90"
              >
                Enable GPS
              </button>
            )}
          </div>
        )}

        {/* 3. Main 2-Column Desktop / Single-Column Mobile Compressed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start">
          
          {/* Left Column (7 cols): Map + 3 Telemetry Metrics */}
          <div className="lg:col-span-7 flex flex-col gap-2.5">
            
            {/* Live Leaflet Map Container */}
            <div className="rounded-xl overflow-hidden shadow-card border border-outline-variant/30 bg-surface-container-lowest">
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
                distanceRemainingKm={effectiveRemainingKm}
                heightClass="h-[220px] sm:h-[250px] lg:h-[270px]"
                currentLocationDesc={
                  latitude && longitude
                    ? `GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
                    : isTripStarted
                    ? 'Acquiring satellite lock...'
                    : 'Staged at Farm Gate'
                }
                isOptimizedRoute={true}
              />
            </div>

            {/* 3 Highlighted Telemetry Metric Cards */}
            <div className="grid grid-cols-3 gap-2">
              
              {/* Metric 1: Current Vehicle Speed */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30 shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Vehicle Speed
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">speed</span>
                </div>
                <div className="my-1">
                  <div className="text-xl lg:text-2xl font-bold leading-tight text-on-surface">
                    {speedKmh !== null && speedKmh !== undefined ? `${speedKmh}` : '0'}
                    <span className="text-xs font-medium text-on-surface-variant ml-0.5">km/h</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${speedKmh && speedKmh > 0 ? 'bg-primary animate-pulse' : 'bg-outline'}`} />
                  <span className="text-[10px] font-semibold text-on-surface-variant truncate">
                    {speedKmh && speedKmh > 0 ? 'In Motion' : 'Stationary'}
                  </span>
                </div>
              </div>

              {/* Metric 2: Distance Remaining & Covered */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30 shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Remaining
                  </span>
                  <span className="material-symbols-outlined text-primary text-[16px]">navigation</span>
                </div>
                <div className="my-1">
                  <div className="text-xl lg:text-2xl font-bold leading-tight text-primary">
                    ~{effectiveRemainingKm}
                    <span className="text-xs font-medium text-on-surface-variant ml-0.5">km</span>
                  </div>
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium truncate">
                  <span className="font-bold text-on-surface">{distanceCoveredKm} km</span> covered of {totalRouteDistanceKm} km
                </div>
              </div>

              {/* Metric 3: GPS Telemetry Status */}
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30 shadow-subtle flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    GPS Signal
                  </span>
                  <span className="material-symbols-outlined text-tertiary text-[16px]">sensors</span>
                </div>
                <div className="my-1">
                  <div className="text-base lg:text-lg font-bold leading-tight text-on-surface truncate">
                    {isGpsActive ? 'Signal Locked' : isTripStarted ? 'Connecting' : 'Standby'}
                  </div>
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium truncate">
                  {accuracy ? `±${accuracy}m precision` : 'Active Satellite Lock'}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (5 cols): Produce Details Card, Delivery Progress & Action Button */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            
            {/* Produce Delivery Details Card */}
            <div className="bg-surface-container-lowest p-3 lg:p-3.5 rounded-xl border border-outline-variant/30 shadow-card flex flex-col gap-2">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface">
                    Produce Delivery Details
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                  {statusMeta.label}
                </span>
              </div>

              {/* Produce Details Grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                
                {/* Produce & Variety */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                    Produce
                  </span>
                  <p className="font-bold text-on-surface truncate mt-0.5">
                    {order.cropName} {order.variety ? `— ${order.variety}` : ''}
                  </p>
                </div>

                {/* Total Quantity / Weight */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                    Weight / Crates
                  </span>
                  <p className="font-bold text-on-surface truncate mt-0.5">
                    {order.quantityKg.toLocaleString()} kg <span className="text-[11px] font-normal text-on-surface-variant">({totalCrates} crates)</span>
                  </p>
                </div>

                {/* Dispatch Origin */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                    Farm Origin
                  </span>
                  <p className="font-bold text-on-surface truncate mt-0.5">
                    {order.farmer.location}
                  </p>
                </div>

                {/* Destination */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                    Target Mandi / Depot
                  </span>
                  <p className="font-bold text-on-surface truncate mt-0.5">
                    {order.buyer.warehouseAddress.split(',')[0]}
                  </p>
                </div>

                {/* ETA */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                    Estimated ETA
                  </span>
                  <p className="font-bold text-on-surface truncate mt-0.5">
                    {order.estimatedDeliveryTime || 'Today, 03:45 PM'}
                  </p>
                </div>

                {/* Trip Status */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                    Trip Status
                  </span>
                  <p className="font-bold text-primary truncate mt-0.5">
                    {statusMeta.label}
                  </p>
                </div>

              </div>

            </div>

            {/* 4-Step Delivery Progress Tracker */}
            <div className="bg-surface-container-lowest p-3 lg:p-3.5 rounded-xl border border-outline-variant/30 shadow-card flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20">
                <h3 className="text-sm font-bold text-on-surface">Delivery Progress</h3>
                <span className="text-[11px] font-bold text-primary">Live Tracking</span>
              </div>

              {/* Horizontal Stepper Timeline */}
              <div className="relative flex items-center justify-between px-2 pt-2 pb-1">
                {/* Connecting Background Line */}
                <div className="absolute top-[17px] left-6 right-6 h-[2px] bg-outline-variant/30 z-0" />
                {/* Active Progress Line */}
                <div className="absolute top-[17px] left-6 w-1/3 h-[2px] bg-primary z-0" />

                {progressSteps.map((step, idx) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center text-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        step.isDone
                          ? 'bg-primary text-on-primary shadow-xs'
                          : step.isCurrent
                          ? 'bg-surface-container-lowest border-2 border-primary text-primary ring-2 ring-primary/20'
                          : 'bg-surface-container border border-outline-variant/40 text-on-surface-variant'
                      }`}
                    >
                      {step.isDone ? (
                        <span className="material-symbols-outlined text-[13px]">check</span>
                      ) : step.isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 leading-tight font-semibold max-w-[70px] ${
                        step.isDone || step.isCurrent ? 'text-on-surface' : 'text-on-surface-variant/70'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div>
              {isDriverRole ? (
                <button
                  onClick={() => navigate('/transporter/delivery-confirmation')}
                  className="w-full h-10 lg:h-11 bg-primary text-on-primary rounded-xl font-bold text-xs lg:text-sm shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Arrived at Warehouse • Confirm Delivery</span>
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (currentRole === 'buyer') navigate('/buyer/marketplace');
                    else navigate('/farmer/dashboard');
                  }}
                  className="w-full h-9 lg:h-10 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl font-semibold text-xs hover:bg-surface-container-low active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-subtle"
                >
                  <span className="material-symbols-outlined text-[16px]">space_dashboard</span>
                  <span>Back to Dashboard</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </AppLayout>
  );
};

