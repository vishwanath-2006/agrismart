import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';
import { PriceSplineChart } from '../../components/common/PriceSplineChart';
import { FARMER_AVATAR } from '../../data/mockData';

export const FarmerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { produceListings, priceHistory, setSelectedProduce, farmerProfile, activeOrder } = useApp();

  return (
    <AppLayout title="Farmer Dashboard">
      <div className="flex flex-col w-full gap-5">
        {/* Greeting & Farmer Profile Banner */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile text-on-surface font-bold">
              Good morning, {farmerProfile?.fullName?.split(' ')[0] || 'Farmer'}
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-0.5">
              Here is your daily market snapshot.
            </p>
          </div>
          <div
            onClick={() => navigate('/farmer/profile')}
            className="h-12 w-12 rounded-full overflow-hidden shrink-0 shadow-sm border-2 border-primary/20 cursor-pointer active:scale-95 transition-transform"
          >
            <img
              className="w-full h-full object-cover"
              alt="Farmer Profile"
              src={FARMER_AVATAR}
            />
          </div>
        </div>

        {/* Gentle Profile Completion Banner if not 100% */}
        {farmerProfile && farmerProfile.completionPercentage < 100 && (
          <div
            onClick={() => navigate('/farmer/profile')}
            className="p-3.5 bg-primary-fixed/20 border border-primary/30 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-primary-fixed/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">agriculture</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm font-bold text-on-surface">
                  Farmer Profile is {farmerProfile.completionPercentage}% Complete
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Set farm location and crop preferences to unlock direct buyer dispatch.
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
          </div>
        )}

        {/* 4-Stat Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPIStatCard
            label="Active Listings"
            value={produceListings.filter(p => p.status === 'Active').length || 3}
            icon="inventory_2"
            colorScheme="primary"
            onClick={() => navigate('/farmer/add-produce')}
          />
          <KPIStatCard
            label="Pending Deals"
            value="2"
            icon="pending_actions"
            colorScheme="secondary"
            onClick={() => navigate('/buyer/negotiation')}
          />
          <KPIStatCard
            label="Tomato Avg"
            value="₹30"
            subValue="/kg"
            trendText="8%"
            isPositiveTrend={true}
            icon="currency_rupee"
            colorScheme="tertiary"
            onClick={() => navigate('/farmer/price-history')}
          />
          <KPIStatCard
            label="Hot Market"
            value="KR Market"
            icon="local_fire_department"
            colorScheme="highlight"
            onClick={() => navigate('/farmer/market-comparison')}
          />
        </div>

        {/* AI Recommendation Card */}
        <AIInsightBanner
          title="AI Market Insight"
          description="Tomato demand is expected to increase next week. KR Market is currently experiencing a supply shortage."
          badgeLabel="Recommended Price"
          badgeValue="₹28–31/kg"
          actionText="View Market Analytics"
          onAction={() => navigate('/farmer/market-comparison')}
        />

        {/* Market Insight Chart */}
        <div className="cursor-pointer" onClick={() => navigate('/farmer/price-history')}>
          <PriceSplineChart
            data={priceHistory.filter(p => !p.isForecast)}
            title="Tomato Price Trend"
            subtitle="Last 7 days (₹/kg) • Tap for detailed forecast"
          />
        </div>

        {/* Active Dispatch Live Tracking Card if shipment active */}
        {activeOrder && (
          <div
            onClick={() => navigate('/farmer/live-tracking')}
            className="bg-surface-container-lowest rounded-2xl p-4 border-2 border-primary/30 shadow-card flex items-center justify-between gap-3 cursor-pointer hover:border-primary transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">local_shipping</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h4 className="font-label-sm font-bold text-on-surface">
                    Active Dispatch • Order #{activeOrder.orderNumber}
                  </h4>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  {activeOrder.cropName} ({activeOrder.quantityKg}kg) • Live GPS Tracking
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
          </div>
        )}

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/farmer/add-produce')}
            className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3 hover:border-primary/40 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">add</span>
            </div>
            <div>
              <h4 className="font-label-sm text-label-sm font-bold text-on-surface">List Produce</h4>
              <p className="text-[12px] text-on-surface-variant">Post new harvest</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/farmer/market-comparison')}
            className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3 hover:border-primary/40 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">compare_arrows</span>
            </div>
            <div>
              <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Compare Mandis</h4>
              <p className="text-[12px] text-on-surface-variant">Find best returns</p>
            </div>
          </button>
        </div>

        {/* Active Produce Listings */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Your Current Produce</h3>
            <button
              onClick={() => navigate('/farmer/add-produce')}
              className="text-label-sm text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>+ Add New</span>
            </button>
          </div>

          <div className="space-y-3">
            {produceListings.slice(0, 3).map(produce => (
              <div
                key={produce.id}
                onClick={() => {
                  setSelectedProduce(produce);
                  navigate('/farmer/price-history');
                }}
                className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3.5 hover:border-primary/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                <img
                  alt={produce.cropName}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-outline-variant/20"
                  src={produce.imageUrl}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-label-sm text-body-md font-bold text-on-surface truncate">
                      {produce.cropName}
                    </h4>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        produce.status === 'Active'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : 'bg-secondary-fixed text-on-secondary-fixed'
                      }`}
                    >
                      {produce.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant mt-0.5">
                    {produce.quantityKg} kg • {produce.qualityGrade}
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-title-md text-title-md font-bold text-primary">
                      ₹{produce.pricePerKg}
                      <span className="text-[12px] font-normal text-on-surface-variant">/kg</span>
                    </span>
                    <span className="text-[12px] font-medium text-tertiary">
                      AI Rec: ₹{produce.aiSuggestedPrice.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
