import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';
import { OrderItem } from '../../types';

export const TransporterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, activeOrder, acceptTransportJob, setActiveOrder, transporterProfile } = useApp();
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Active in-transit or pending delivery trip
  const ongoingOrder = activeOrder && activeOrder.status !== 'COMPLETED' ? activeOrder : null;

  // Available load requests (orders created or needing transport)
  const availableLoads = orders.filter(
    o => o.status === 'ORDER_PLACED' || (o.status === 'TRANSPORTER_ASSIGNED' && o.id !== ongoingOrder?.id)
  );

  const handleAcceptLoad = (order: OrderItem) => {
    setActiveOrder(order);
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
            className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5 ${
              isOnDuty
                ? 'bg-tertiary-fixed text-on-tertiary-fixed shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-tertiary animate-pulse' : 'bg-outline'}`} />
            {isOnDuty ? 'On Duty' : 'Off Duty'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col w-full gap-5 pb-6">
        {/* Gentle Transporter Profile Completion Banner if not 100% */}
        {transporterProfile && transporterProfile.completionPercentage < 100 && (
          <div
            onClick={() => navigate('/transporter/profile')}
            className="p-3.5 bg-tertiary-fixed/20 border border-tertiary/30 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-tertiary-fixed/30 transition-all shadow-sm mt-1"
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
                  Verify vehicle capacity &amp; service corridor to receive automated dispatch jobs.
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-tertiary text-[20px]">arrow_forward</span>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
          <KPIStatCard
            label="Today's Earnings"
            value="₹3,400"
            icon="account_balance_wallet"
            colorScheme="primary"
          />
          <KPIStatCard
            label="Active Trips"
            value={ongoingOrder ? '1' : '0'}
            icon="local_shipping"
            colorScheme="tertiary"
            onClick={() => ongoingOrder && navigate('/transporter/live-tracking')}
          />
          <KPIStatCard
            label="Reliability"
            value="4.96"
            trendText="Top 2%"
            isPositiveTrend={true}
            icon="star"
            colorScheme="secondary"
          />
          <KPIStatCard
            label="Vehicle"
            value="Tata 407"
            icon="directions_car"
            colorScheme="highlight"
            onClick={() => navigate('/transporter/profile')}
          />
        </div>

        {/* AI Route Dispatch Insight */}
        <AIInsightBanner
          title="AI Route Advisory"
          description="SH-17 Mysore-Bangalore Expressway shows optimal traffic flow. Taking the Mandya bypass will save 22 mins and 1.8L diesel."
          badgeLabel="Optimal Route"
          badgeValue="SH-17 Expressway (145km)"
          actionText="Inspect Optimized Route"
          onAction={() => navigate('/transporter/route-optimization')}
          variant="primary"
          icon="alt_route"
        />

        {/* Ongoing Shipment Card */}
        {ongoingOrder && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 border-2 border-primary/30 shadow-elevated flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active Trip in Transit
              </span>
              <span className="text-[12px] font-bold text-on-surface">Order #{ongoingOrder.orderNumber}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={ongoingOrder.produceImage}
                alt={ongoingOrder.cropName}
                className="w-14 h-14 rounded-xl object-cover border border-outline-variant/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-title-md text-title-md font-bold text-on-surface truncate">
                  {ongoingOrder.cropName} ({ongoingOrder.quantityKg} kg)
                </h4>
                <p className="text-[13px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">near_me</span>
                  {ongoingOrder.currentLocation?.description || 'Approaching Ramanagara'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20">
              <button
                onClick={() => navigate('/transporter/live-tracking')}
                className="h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">navigation</span>
                Live GPS & Nav
              </button>

              <button
                onClick={() => navigate('/transporter/delivery-confirmation')}
                className="h-touch-target-min bg-surface-container-high text-on-surface rounded-xl font-label-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                Confirm Delivery
              </button>
            </div>
          </div>
        )}

        {/* Available Load Requests Nearby */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Available Load Requests</h3>
            <span className="text-[12px] text-primary font-semibold">
              {availableLoads.length} active shipments near corridor
            </span>
          </div>

          {availableLoads.length > 0 ? (
            availableLoads.map(load => (
              <div
                key={load.id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={load.produceImage}
                      alt={load.cropName}
                      className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-label-sm text-body-md font-bold text-on-surface">
                        {load.quantityKg}kg {load.cropName}
                      </h4>
                      <p className="text-[12px] text-on-surface-variant">
                        {load.farmer.location} → {load.buyer.warehouseAddress.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <span className="font-title-md text-title-md font-bold text-primary">
                    ₹{load.transportCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-surface-container-low p-2.5 rounded-xl text-[12px] text-on-surface">
                  <span>Distance: {load.routeDetails.distanceKm}km</span>
                  <span>Transit: ~{load.routeDetails.durationStr}</span>
                  <span className="font-semibold text-tertiary">
                    {load.status === 'ORDER_PLACED' ? 'Ready for Pickup' : 'Assigned to Fleet'}
                  </span>
                </div>

                <button
                  onClick={() => handleAcceptLoad(load)}
                  className="w-full h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Accept Load & Optimize Route</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            ))
          ) : (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant/60 mb-2">
                local_shipping
              </span>
              <p className="font-label-sm font-semibold text-on-surface">No pending loads right now</p>
              <p className="text-[12px]">All incoming agricultural orders have been accepted or delivered.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
