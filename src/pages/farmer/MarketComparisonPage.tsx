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
  const [viewMode, setViewMode] = useState<'market' | 'crop'>('market');
  const [markets, setMarkets] = useState<MarketComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const selectedCropName = selectedProduce?.cropName || 'Beans';
  const payloadQuantityKg = selectedProduce?.quantityKg || 600;

  const handleMarketChange = (marketId: string) => {
    const found = markets.find(m => m.id === marketId);
    if (found) {
      setSelectedMarket(found);
    }
  };

  const handleCropChange = (cropName: string) => {
    const foundListing = produceListings.find(p => p.cropName.toLowerCase().includes(cropName.toLowerCase()));
    if (foundListing) {
      setSelectedProduce(foundListing);
    } else {
      setSelectedProduce({
        id: `prod_${cropName.toLowerCase().replace(/\s+/g, '_')}`,
        farmerId: 'user_farmer_1',
        farmerName: 'Ramesh Kumar',
        farmerLocation: 'Mysore, Karnataka',
        farmerAvatar: '/logo.png',
        cropName: cropName,
        variety: 'Local Fresh',
        category: 'Vegetables',
        imageUrl: cropName.toLowerCase().includes('bean')
          ? 'https://images.unsplash.com/photo-1551893665-f843f600794e?auto=format&fit=crop&w=800&q=80'
          : (selectedProduce?.imageUrl || TOMATO_IMG),
        qualityGrade: 'Grade A',
        quantityKg: cropName.toLowerCase().includes('bean') ? 600 : 500,
        minOrderQuantityKg: 100,
        pricePerKg: 40,
        aiSuggestedPrice: 38.5,
        harvestDate: 'Today',
        shelfLifeDays: 7,
        status: 'Active',
        description: `Freshly harvested ${cropName}.`
      });
    }
  };

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

  // Sort markets by best net return
  const sortedMarkets = useMemo(() => {
    const list = [...filteredMarkets];
    return list.sort((a, b) => b.estNetReturnPerKg - a.estNetReturnPerKg);
  }, [filteredMarkets]);

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

        {/* Top Control Bar (The Pivot) */}
        <div className="flex justify-center w-full my-1">
          <div className="inline-flex p-1 bg-surface-container rounded-full border border-outline-variant/30 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('market')}
              className={`px-5 py-2 rounded-full font-title-md text-label-sm font-semibold transition-all duration-200 ${
                viewMode === 'market'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Market View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('crop')}
              className={`px-5 py-2 rounded-full font-title-md text-label-sm font-semibold transition-all duration-200 ${
                viewMode === 'crop'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Crop View
            </button>
          </div>
        </div>

        {/* Dynamic Context Selector */}
        {viewMode === 'market' ? (
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary-container/40 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[24px]">storefront</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Select Market
                </span>
                <select
                  value={selectedMarket?.id || (markets[0]?.id ?? '')}
                  onChange={e => handleMarketChange(e.target.value)}
                  className="w-full bg-transparent font-title-md font-bold text-on-surface outline-none cursor-pointer truncate"
                >
                  {markets.length > 0 ? (
                    markets.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.marketName} ({m.city}, {m.distanceKm} km)
                      </option>
                    ))
                  ) : (
                    <option value="default">Kanjirappally Market (Kottayam, Kerala - 40 km)</option>
                  )}
                </select>
                <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  <span>Farm Origin: Mysore, Karnataka</span>
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant shrink-0">expand_more</span>
          </div>
        ) : (
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm border border-outline-variant/20">
                <img
                  className="w-full h-full object-cover"
                  alt={selectedCropName}
                  src={
                    selectedCropName.toLowerCase().includes('bean')
                      ? 'https://images.unsplash.com/photo-1551893665-f843f600794e?auto=format&fit=crop&w=800&q=80'
                      : selectedProduce?.imageUrl || TOMATO_IMG
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Select Crop
                </span>
                <select
                  value={selectedCropName}
                  onChange={e => handleCropChange(e.target.value)}
                  className="w-full bg-transparent font-title-md font-bold text-on-surface outline-none cursor-pointer truncate"
                >
                  <option value="Beans">Beans (600 kg)</option>
                  <option value="Tomato (Hybrid)">Tomato (Hybrid) (500 kg)</option>
                  <option value="Red Onion">Red Onion (1200 kg)</option>
                  <option value="Potato Jyoti">Potato Jyoti (800 kg)</option>
                  <option value="Green Chilli">Green Chilli (300 kg)</option>
                  <option value="Cabbage">Cabbage (1000 kg)</option>
                </select>
                <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  <span>Farm Origin: Mysore, Karnataka</span>
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant shrink-0">expand_more</span>
          </div>
        )}

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
                      <span className="text-[11px] text-on-surface-variant font-medium block">Road Distance</span>
                      <span className="font-bold text-on-surface">{mkt.distanceKm} km</span>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">Benchmark est.</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                      Government reported • data.gov.in
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
