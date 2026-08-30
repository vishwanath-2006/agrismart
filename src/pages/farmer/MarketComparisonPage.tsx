import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TOMATO_IMG } from '../../data/mockData';
import { MarketComparisonItem } from '../../types';

export const MarketComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { marketComparisons, setSelectedMarket, selectedMarket } = useApp();
  const [activeFilter, setActiveFilter] = useState<'net' | 'price' | 'distance'>('net');

  const sortedMarkets = [...marketComparisons].sort((a, b) => {
    if (activeFilter === 'price') return b.currentPricePerKg - a.currentPricePerKg;
    if (activeFilter === 'distance') return a.distanceKm - b.distanceKm;
    return b.estNetReturnPerKg - a.estNetReturnPerKg;
  });

  const handleSelectMarket = (mkt: MarketComparisonItem) => {
    setSelectedMarket(mkt);
    navigate('/farmer/market-prices');
  };

  return (
    <AppLayout title="Market Comparison" showBack onBack={() => navigate('/farmer/dashboard')}>
      <div className="flex flex-col w-full gap-4">
        {/* AI Recommendation Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-primary-container text-on-primary-container shadow-elevated p-5 mt-2">
          <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">psychology</span>
          </div>
          <div className="relative z-10 flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">auto_awesome</span>
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-tertiary-fixed">
                AI Recommendation
              </h2>
            </div>
            <div>
              <h3 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-primary">
                Best Market: KR Market (Bangalore)
              </h3>
              <p className="text-body-md font-body-md mt-1 opacity-90 leading-snug">
                Higher net revenue expected (+₹2.8/kg) even after accounting for transport costs (145km distance).
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedMarket(marketComparisons[0]);
                navigate('/farmer/price-history');
              }}
              className="mt-2 w-full h-touch-target-min bg-primary text-on-primary rounded-xl flex items-center justify-center gap-2 font-label-sm font-semibold shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <span>View Route & Price Forecast</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Selected Crop Context Bar */}
        <div className="flex items-center gap-3.5 py-1 px-1 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-card">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-outline-variant/20">
            <img
              className="w-full h-full object-cover"
              alt="Tomato Hybrid"
              src={TOMATO_IMG}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-title-md font-title-md font-bold text-on-surface truncate">
              Tomato (Hybrid)
            </h1>
            <p className="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
              <span>Origin: Your Farm, Mysore</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/add-produce')}
            className="text-[12px] font-semibold text-primary bg-primary-fixed/30 px-3 py-1.5 rounded-full hover:bg-primary-fixed/50 transition-colors"
          >
            Change Crop
          </button>
        </div>

        {/* Sorting/Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveFilter('net')}
            className={`shrink-0 h-[40px] px-4 rounded-full text-label-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'net'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            Best Net Return
          </button>
          <button
            onClick={() => setActiveFilter('price')}
            className={`shrink-0 h-[40px] px-4 rounded-full text-label-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'price'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
            Highest Price
          </button>
          <button
            onClick={() => setActiveFilter('distance')}
            className={`shrink-0 h-[40px] px-4 rounded-full text-label-sm font-semibold flex items-center gap-1.5 transition-all ${
              activeFilter === 'distance'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">near_me</span>
            Nearest Distance
          </button>
        </div>

        {/* Comparison Market Cards List */}
        <div className="space-y-3.5 mt-1">
          {sortedMarkets.map(mkt => {
            const isSelected = selectedMarket?.id === mkt.id;
            return (
              <div
                key={mkt.id}
                className={`bg-surface-container-lowest rounded-2xl p-4 border transition-all shadow-card relative ${
                  mkt.isAiRecommended
                    ? 'border-primary/40 ring-1 ring-primary/20'
                    : 'border-outline-variant/30'
                }`}
              >
                {mkt.isAiRecommended && (
                  <div className="absolute top-3 right-3 bg-tertiary text-on-tertiary px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Top Pick
                  </div>
                )}

                <div className="pr-16">
                  <h4 className="font-title-md text-title-md font-bold text-on-surface">{mkt.marketName}</h4>
                  <p className="text-[13px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">route</span>
                    {mkt.distanceKm} km away • ~{mkt.transitTimeHrs}h transit
                  </p>
                </div>

                {/* Financial Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-surface-container-low rounded-xl text-center">
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-medium block">Mandi Price</span>
                    <span className="text-body-md font-bold text-on-surface">₹{mkt.currentPricePerKg}/kg</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-medium block">Transport Est.</span>
                    <span className="text-body-md font-bold text-secondary">₹{mkt.transportCostPerKg}/kg</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-medium block">Est. Net Profit</span>
                    <span className="text-body-md font-bold text-primary">₹{mkt.estNetReturnPerKg}/kg</span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectMarket(mkt)}
                    className="flex-1 h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Choose Market & View Mandi Rates</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};
