import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { OrderItem } from '../../types';

export const TransporterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, activeOrder, acceptTransportJob, setActiveOrder, transporterProfile, isProfileComplete } = useApp();
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Active in-transit or accepted delivery trip
  const ongoingOrder = activeOrder && activeOrder.status !== 'COMPLETED' ? activeOrder : null;

  // Available load requests (orders created or needing transport)
  const availableLoads = orders.filter(
    o => o.status === 'ORDER_PLACED' || (o.status === 'TRANSPORTER_ASSIGNED' && o.id !== ongoingOrder?.id)
  );

  const handleAcceptLoad = (order: OrderItem) => {
    setActiveOrder(order);
    if (!isProfileComplete('transporter')) {
      navigate('/transporter/profile', {
        state: {
          returnTo: '/transporter/route-optimization',
          actionNotice: 'Complete your fleet registration & tariff profile to accept and dispatch delivery loads.'
        }
      });
      return;
    }
    acceptTransportJob(order.id);
    navigate('/transporter/route-optimization');
  };

  return (
    <AppLayout
      title="Transporter Dashboard"
      rightAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-2 shadow-sm ${
              isOnDuty
                ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/30'
                : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnDuty ? 'bg-tertiary animate-pulse' : 'bg-outline'}`} />
            <span>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col w-full gap-5 pb-12">
        
        {/* Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Transporter Dashboard</h2>
          <p className="text-[13px] text-on-surface-variant">Manage your deliveries and available loads</p>
        </div>

        {/* Duty Status Feedback Banner */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-[13px] transition-all ${
          isOnDuty
            ? 'bg-primary-fixed/20 border-primary/30 text-on-surface'
            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${isOnDuty ? 'bg-primary animate-pulse' : 'bg-outline'}`} />
            <span className="font-semibold">
              {isOnDuty ? '● ON DUTY — Receiving nearby load requests' : '○ OFF DUTY — Turn on duty to receive loads'}
            </span>
          </div>
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className="text-[12px] font-bold text-primary hover:underline"
          >
            {isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
          </button>
        </div>

        {/* Fleet Profile Completion Banner if not 100% */}
        {transporterProfile && transporterProfile.completionPercentage < 100 && (
          <div
            onClick={() => navigate('/transporter/profile', {
              state: {
                returnTo: '/transporter/dashboard',
                actionNotice: 'Complete your fleet registration & tariff profile to accept delivery loads.'
              }
            })}
            className="p-3.5 bg-tertiary-fixed/20 border border-tertiary/30 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-tertiary-fixed/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm font-bold text-on-surface">
                  Fleet Profile is {transporterProfile.completionPercentage}% Complete
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Verify vehicle capacity &amp; corridors to receive automated dispatches.
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-tertiary text-[20px]">arrow_forward</span>
          </div>
        )}

        {/* 3 Clean KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <KPIStatCard
            label="Today's Earnings"
            value="₹3,400"
            trendText="Demo statistic"
            icon="account_balance_wallet"
            colorScheme="primary"
          />
          <KPIStatCard
            label="Active Delivery"
            value={ongoingOrder ? '1' : '0'}
            trendText={ongoingOrder ? 'In progress' : 'None'}
            icon="local_shipping"
            colorScheme="tertiary"
            onClick={() => ongoingOrder && navigate('/transporter/route-optimization')}
          />
          <KPIStatCard
            label="Available Loads"
            value={String(availableLoads.length)}
            trendText="Ready in queue"
            icon="inventory_2"
            colorScheme="secondary"
          />
        </div>

        {/* Active Delivery Section (If accepted) */}
        {ongoingOrder && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 border-2 border-primary/40 shadow-elevated flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-fixed/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active Delivery • Order #{ongoingOrder.orderNumber}
              </span>
              <span className="text-[12px] font-bold text-primary">₹{ongoingOrder.transportCost.toLocaleString()}</span>
            </div>

            <div className="flex items-start gap-3">
              <img
                src={ongoingOrder.produceImage}
                alt={ongoingOrder.cropName}
                className="w-14 h-14 rounded-xl object-cover border border-outline-variant/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-title-md text-title-md font-bold text-on-surface truncate">
                  {ongoingOrder.cropName} ({ongoingOrder.quantityKg} kg)
                </h4>
                <p className="text-[12px] text-on-surface-variant font-medium mt-0.5">
                  {ongoingOrder.farmer.location} → {ongoingOrder.buyer.warehouseAddress.split(',')[0]} (145 km)
                </p>
                <p className="text-[11px] text-tertiary font-semibold flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">near_me</span>
                  Status: Ready for route optimization
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20">
              <button
                onClick={() => navigate('/transporter/route-optimization')}
                className="h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
                Optimize Route
              </button>

              <button
                onClick={() => navigate('/transporter/live-tracking')}
                className="h-touch-target-min bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl font-label-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">navigation</span>
                Live GPS &amp; Nav
              </button>
            </div>
          </div>
        )}

        {/* Available Loads Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Available Loads</h3>
            <span className="text-[12px] text-on-surface-variant font-medium">
              {availableLoads.length} load{availableLoads.length === 1 ? '' : 's'} available
            </span>
          </div>

          {!isOnDuty ? (
            /* Off Duty State */
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/50">do_not_disturb_on</span>
              <h4 className="font-label-sm font-bold text-on-surface">You're currently off duty</h4>
              <p className="text-[12px] text-on-surface-variant max-w-xs">
                Turn on duty using the toggle above to start receiving available load requests.
              </p>
              <button
                onClick={() => setIsOnDuty(true)}
                className="mt-2 h-touch-target-min px-5 bg-primary text-on-primary font-bold rounded-xl text-label-sm shadow-sm"
              >
                Turn On Duty
              </button>
            </div>
          ) : availableLoads.length === 0 ? (
            /* Empty Queue State */
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/50">inventory_2</span>
              <h4 className="font-label-sm font-bold text-on-surface">No loads available</h4>
              <p className="text-[12px] text-on-surface-variant">New delivery requests will appear here when available.</p>
            </div>
          ) : (
            /* Load Cards List */
            availableLoads.map(load => (
              <div
                key={load.id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={load.produceImage}
                      alt={load.cropName}
                      className="w-13 h-13 rounded-xl object-cover border border-outline-variant/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-title-md text-title-md font-bold text-on-surface">
                        {load.cropName} ({load.quantityKg} kg)
                      </h4>
                      <p className="text-[12px] text-on-surface-variant mt-0.5">
                        Pickup: <span className="font-semibold text-on-surface">{load.farmer.location}</span>
                      </p>
                      <p className="text-[12px] text-on-surface-variant">
                        Delivery: <span className="font-semibold text-on-surface">{load.buyer.warehouseAddress.split(',')[0]}</span>
                      </p>
                    </div>
                  </div>

                  {/* Transport Fare */}
                  <div className="text-right shrink-0">
                    <span className="font-title-md text-title-md font-bold text-primary block">
                      ₹{load.transportCost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">Calculated estimate</span>
                  </div>
                </div>

                {/* Distance & Time details */}
                <div className="flex items-center justify-between bg-surface-container-low p-2.5 rounded-xl text-[12px] text-on-surface">
                  <span>Distance: <strong>{load.routeDetails.distanceKm} km</strong></span>
                  <span>Transit: <strong>~{load.routeDetails.durationStr}</strong></span>
                  <span className="text-[11px] font-semibold text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-md">
                    Ready for Pickup
                  </span>
                </div>

                {/* Accept Load Action */}
                <button
                  onClick={() => handleAcceptLoad(load)}
                  className="w-full min-h-[48px] bg-primary text-on-primary rounded-xl font-label-sm font-bold shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Accept Load &amp; Optimize Route</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};
