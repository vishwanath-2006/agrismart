import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';
import { PriceSplineChart } from '../../components/common/PriceSplineChart';

export const FarmerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { produceListings, priceHistory, setSelectedProduce, farmerProfile, activeOrder, mandiPrices, marketComparisons } = useApp();

  const tomatoMandi = mandiPrices.find(m => m.cropName.toLowerCase().includes('tomato')) || mandiPrices[0];
  const tomatoPriceNum = tomatoMandi ? tomatoMandi.modalPrice : 31;
  const tomatoPrice = `₹${tomatoPriceNum}`;

  // Real best market from market comparisons (top net return)
  const bestMarket = marketComparisons && marketComparisons.length > 0 ? marketComparisons[0] : null;
  const bestMarketName = bestMarket ? bestMarket.marketName : (tomatoMandi?.mandiName || 'KR Market, Bangalore');
  const bestMarketMandiPrice = bestMarket ? `₹${bestMarket.currentPricePerKg.toFixed(2)}` : '₹31.00';
  const bestMarketNetReturn = bestMarket ? `₹${bestMarket.estNetReturnPerKg.toFixed(2)}` : '₹28.10';

  // Format arrival date
  const reportedDate = tomatoMandi?.lastUpdated?.replace('Reported ', '').trim() || '31 Aug 2026';

  return (
    <AppLayout title="Farmer Dashboard">
      <div className="flex flex-col w-full gap-5 pb-8">
        
        {/* Active Dispatch Live Tracking Card (Moved to top) */}
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

        {/* 1. Primary Highlight Cards: Latest Mandi Price & Best Market */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Latest Mandi Price Card */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full">
                  Latest Mandi Price
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {reportedDate}
                </span>
              </div>
              <h3 className="text-title-md font-bold text-on-surface mt-2 flex items-center gap-1.5">
                <span>🍅 Tomato</span>
                <span className="text-[12px] font-normal text-on-surface-variant">({tomatoMandi?.mandiName || 'KR Market'})</span>
              </h3>
              <div className="my-2.5 flex items-baseline gap-1">
                <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">
                  {tomatoPrice}
                </span>
                <span className="text-label-sm font-normal text-on-surface-variant">/kg</span>
              </div>
              <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                <span>Government reported (Source: data.gov.in)</span>
              </p>
            </div>

            <button
              onClick={() => navigate('/farmer/market-prices')}
              className="mt-4 w-full h-touch-target-min bg-surface-container-low hover:bg-surface-container text-primary font-semibold rounded-xl text-label-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <span>View All Prices</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Best Market Card */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-primary/30 shadow-card flex flex-col justify-between ring-1 ring-primary/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#0f5238] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Best Market
                </span>
                <span className="text-[11px] font-bold text-primary">
                  Top Earning
                </span>
              </div>

              <h3 className="text-title-md font-bold text-on-surface mt-2">
                {bestMarketName}
              </h3>

              <div className="grid grid-cols-2 gap-2 my-2.5 p-2.5 bg-primary-fixed/20 rounded-xl">
                <div>
                  <span className="text-[11px] text-on-surface-variant font-medium block">Mandi price</span>
                  <span className="font-bold text-on-surface text-[15px]">{bestMarketMandiPrice}/kg</span>
                  <span className="text-[10px] text-on-surface-variant block">Govt reported</span>
                </div>
                <div>
                  <span className="text-[11px] text-primary font-bold block">After transport</span>
                  <span className="font-bold text-primary text-[15px]">{bestMarketNetReturn}/kg</span>
                  <span className="text-[10px] text-primary/80 block">Estimated earning</span>
                </div>
              </div>

              <p className="text-[12px] text-on-surface-variant">
                Estimated earnings after accounting for transport distance from your farm.
              </p>
            </div>

            <button
              onClick={() => navigate('/farmer/market-comparison')}
              className="mt-4 w-full h-touch-target-min bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-label-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Compare Markets</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* 2. Quick Actions Bar (Min 48px Touch Targets) */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => navigate('/farmer/market-prices')}
            className="p-3.5 min-h-[56px] bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card flex flex-col items-center justify-center gap-1 hover:border-primary/40 active:scale-[0.98] transition-all text-center"
          >
            <span className="material-symbols-outlined text-[24px] text-primary">storefront</span>
            <span className="font-label-sm text-[12px] font-bold text-on-surface">Check Prices</span>
          </button>

          <button
            onClick={() => navigate('/farmer/market-comparison')}
            className="p-3.5 min-h-[56px] bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card flex flex-col items-center justify-center gap-1 hover:border-primary/40 active:scale-[0.98] transition-all text-center"
          >
            <span className="material-symbols-outlined text-[24px] text-secondary">compare_arrows</span>
            <span className="font-label-sm text-[12px] font-bold text-on-surface">Compare Markets</span>
          </button>

          <button
            onClick={() => navigate('/farmer/add-produce')}
            className="p-3.5 min-h-[56px] bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card flex flex-col items-center justify-center gap-1 hover:border-primary/40 active:scale-[0.98] transition-all text-center"
          >
            <span className="material-symbols-outlined text-[24px] text-tertiary">add_circle</span>
            <span className="font-label-sm text-[12px] font-bold text-on-surface">List Produce</span>
          </button>
        </div>

        {/* AI Insight (Clearly labeled as estimate/forecast) */}
        <AIInsightBanner
          title="AI Market Insight (AI estimate • Not Government data)"
          description="Hybrid Tomato demand across southern APMC mandis is projected to remain steady. Best selling opportunity identified at KR Market."
          badgeLabel="Estimated Rate"
          badgeValue="₹28–31/kg"
          actionText="Compare Mandis"
          onAction={() => navigate('/farmer/market-comparison')}
        />

        {/* Real Price History Chart Preview */}
        <div className="cursor-pointer" onClick={() => navigate('/farmer/price-history')}>
          <PriceSplineChart
            data={priceHistory.filter(p => !p.isForecast)}
            title="Tomato Price History"
            subtitle="Government reported data (Source: data.gov.in) • Tap for detailed forecast"
          />
        </div>


        {/* Your Produce Listings */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Your Produce</h3>
            <button
              onClick={() => navigate('/farmer/add-produce')}
              className="text-label-sm text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>+ Add Produce</span>
            </button>
          </div>

          {produceListings && produceListings.length > 0 ? (
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
                        AI Rec: ₹{produce.aiSuggestedPrice.toFixed(1)}/kg
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant/60 mb-2">inventory_2</span>
              <p className="font-label-sm font-semibold text-on-surface">You haven't listed any produce yet.</p>
              <button
                onClick={() => navigate('/farmer/add-produce')}
                className="mt-3 px-4 py-2 bg-primary text-on-primary rounded-xl text-label-sm font-semibold shadow-sm"
              >
                Add Produce
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
