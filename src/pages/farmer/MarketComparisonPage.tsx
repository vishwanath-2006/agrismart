import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TOMATO_IMG } from '../../data/mockData';
import { MarketComparisonItem } from '../../types';
import { fetchMarketComparisonsFromSupabase } from '../../services/mandiPriceService';

export const MarketComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMarket, setSelectedMarket, selectedProduce, setSelectedProduce, produceListings } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'best_return' | 'highest_price' | 'nearest'>('best_return');
  const [markets, setMarkets] = useState<MarketComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const selectedCropName = selectedProduce?.cropName || 'Tomato';
  const payloadQuantityKg = selectedProduce?.quantityKg || 500;

  // Fetch real market comparisons from public.market_prices
  useEffect(() => {
    let isMounted = true;
    const loadMarkets = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const data = await fetchMarketComparisonsFromSupabase(selectedCropName);
        if (isMounted) {
          setMarkets(data);
          if (data.length > 0 && (!selectedMarket || !data.some(m => m.id === selectedMarket.id))) {
            setSelectedMarket(data[0]);
          }
        }
      } catch (err) {
        console.warn('Error loading market comparisons:', err);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMarkets();
    return () => {
      isMounted = false;
    };
  }, [selectedCropName]);

  // Real-time search filter matching commodity, variety, market, district, and state
  const filteredMarkets = useMemo(() => {
    if (!searchTerm.trim()) return markets;
    const term = searchTerm.toLowerCase().trim();

    return markets.filter(m => {
      const matchMarket = m.marketName?.toLowerCase().includes(term);
      const matchCity = m.city?.toLowerCase().includes(term);
      const matchState = m.state?.toLowerCase().includes(term);
      const matchCommodity = m.commodity?.toLowerCase().includes(term);
      const matchVariety = m.variety?.toLowerCase().includes(term);
      return matchMarket || matchCity || matchState || matchCommodity || matchVariety;
    });
  }, [markets, searchTerm]);

  // Sort markets according to selected strategy
  const sortedMarkets = useMemo(() => {
    const list = [...filteredMarkets];
    if (sortOption === 'highest_price') {
      return list.sort((a, b) => b.currentPricePerKg - a.currentPricePerKg);
    }
    if (sortOption === 'nearest') {
      return list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    // Default: Best Return
    return list.sort((a, b) => b.estNetReturnPerKg - a.estNetReturnPerKg);
  }, [filteredMarkets, sortOption]);

  const bestMarketId = useMemo(() => {
    if (markets.length === 0) return null;
    const top = [...markets].sort((a, b) => b.estNetReturnPerKg - a.estNetReturnPerKg)[0];
    return top?.id || null;
  }, [markets]);

  const handleSelectMarket = (mkt: MarketComparisonItem) => {
    setSelectedMarket(mkt);
    navigate('/farmer/price-history');
  };

  return (
    <AppLayout title="Market Comparison" showBack onBack={() => navigate('/farmer/dashboard')}>
      <div className="flex flex-col w-full gap-4 pb-8">
        
        {/* Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Market Comparison</h2>
          <p className="text-[13px] text-on-surface-variant">Find the market where you may earn the most after transport.</p>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center bg-surface-container-low rounded-2xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search crop or market..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none font-body-md text-on-surface placeholder:text-outline-variant"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Selected Crop & Quantity Bar */}
        <div className="flex items-center gap-3.5 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-outline-variant/20">
            <img
              className="w-full h-full object-cover"
              alt={selectedCropName}
              src={selectedProduce?.imageUrl || TOMATO_IMG}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-title-md font-title-md font-bold text-on-surface truncate">
                {selectedCropName}
              </h3>
              <span className="text-[11px] font-bold text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full shrink-0">
                {payloadQuantityKg} kg
              </span>
            </div>
            <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
              <span>Farm Origin: Mysore, Karnataka</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/market-prices')}
            className="text-[12px] font-semibold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 px-3 py-1.5 rounded-full transition-colors shrink-0"
          >
            Change Crop
          </button>
        </div>

        {/* Sorting Controls */}
        <div className="flex bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30">
          <button
            onClick={() => setSortOption('best_return')}
            className={`flex-1 py-2 rounded-xl text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              sortOption === 'best_return'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            <span>Best return</span>
          </button>

          <button
            onClick={() => setSortOption('highest_price')}
            className={`flex-1 py-2 rounded-xl text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              sortOption === 'highest_price'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">currency_rupee</span>
            <span>Highest price</span>
          </button>

          <button
            onClick={() => setSortOption('nearest')}
            className={`flex-1 py-2 rounded-xl text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              sortOption === 'nearest'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">near_me</span>
            <span>Nearest</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
            <p className="font-label-sm font-semibold text-on-surface">Loading real APMC market rates...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && hasError && (
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-error/30 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] text-error mb-2">error</span>
            <p className="font-label-sm font-bold text-on-surface">Unable to load market prices.</p>
            <p className="text-[12px] mt-1">Please check your network connection or try refreshing.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && sortedMarkets.length === 0 && (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/60 mb-2">search_off</span>
            <h3 className="font-label-sm font-bold text-on-surface">No matching markets found.</h3>
            <p className="text-[12px] text-on-surface-variant mt-1">Try another crop or market.</p>
          </div>
        )}

        {/* Market Results List */}
        {!isLoading && !hasError && sortedMarkets.length > 0 && (
          <div className="space-y-3.5">
            {sortedMarkets.map(mkt => {
              const isBestReturn = mkt.id === bestMarketId;

              return (
                <div
                  key={mkt.id}
                  className={`bg-surface-container-lowest rounded-2xl p-4 border transition-all shadow-card relative ${
                    isBestReturn
                      ? 'border-primary ring-1 ring-primary/30'
                      : 'border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  {/* Top Badge for Best Return */}
                  {isBestReturn && (
                    <div className="absolute top-3.5 right-3.5 bg-[#0f5238] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      BEST RETURN
                    </div>
                  )}

                  {/* Market Name & Location */}
                  <div className="pr-24">
                    <h3 className="font-title-md text-title-md font-bold text-on-surface leading-snug">
                      {mkt.marketName}
                    </h3>
                    <p className="text-[13px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                      <span>{mkt.city}, {mkt.state || 'Karnataka'}</span>
                    </p>
                  </div>

                  {/* Primary Financial Metric: Estimated Return */}
                  <div className="my-3 p-3.5 bg-primary-fixed/20 rounded-xl border border-primary/20 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                        Your estimated earning
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium">After transport deduction</span>
                    </div>
                    <div className="text-right">
                      <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">
                        ₹{mkt.estNetReturnPerKg.toFixed(2)}
                      </span>
                      <span className="text-label-sm font-normal text-on-surface-variant">/kg</span>
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-surface-container-low rounded-xl text-center text-[12px]">
                    <div>
                      <span className="text-[11px] text-on-surface-variant font-medium block">Mandi price</span>
                      <span className="font-bold text-on-surface">₹{mkt.currentPricePerKg.toFixed(2)}/kg</span>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">Govt reported</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-on-surface-variant font-medium block">Transport</span>
                      <span className="font-bold text-secondary">-₹{mkt.transportCostPerKg.toFixed(2)}/kg</span>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">Calculated</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-on-surface-variant font-medium block">Distance</span>
                      <span className="font-bold text-on-surface">{mkt.distanceKm} km</span>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">~{mkt.transitTimeHrs}h</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                      Source: data.gov.in
                    </span>

                    <button
                      onClick={() => handleSelectMarket(mkt)}
                      className="text-label-sm font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View History</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
