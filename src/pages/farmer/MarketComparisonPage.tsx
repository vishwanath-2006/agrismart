import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TOMATO_IMG } from '../../data/mockData';
import { MarketComparisonItem } from '../../types';
import { fetchMarketComparisonsFromSupabase } from '../../services/mandiPriceService';
import DepthCarousel, { DepthCarouselItem } from '../../components/common/DepthCarousel';

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

  const MARKET_IMAGES = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=800&q=80'
  ];

  const CROP_LIST_DATA = [
    { name: 'Beans', qty: 600, img: 'https://images.unsplash.com/photo-1551893665-f843f600794e?auto=format&fit=crop&w=800&q=80', estRate: '₹40.00/kg', variety: 'Local Fresh Grade A' },
    { name: 'Tomato (Hybrid)', qty: 500, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', estRate: '₹30.00/kg', variety: 'Abhinav 3140' },
    { name: 'Red Onion', qty: 1200, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80', estRate: '₹22.00/kg', variety: 'Nashik Red 55' },
    { name: 'Potato Jyoti', qty: 800, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80', estRate: '₹18.00/kg', variety: 'Kufri Jyoti Premium' },
    { name: 'Green Chilli', qty: 300, img: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80', estRate: '₹45.00/kg', variety: 'G4 Hot' },
    { name: 'Cabbage', qty: 1000, img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80', estRate: '₹15.00/kg', variety: 'Golden Acre' }
  ];

  const bestMarketId = useMemo(() => {
    if (markets.length === 0) return null;
    const top = [...markets].sort((a, b) => b.estNetReturnPerKg - a.estNetReturnPerKg)[0];
    return top?.id || null;
  }, [markets]);

  const marketCarouselItems: DepthCarouselItem[] = useMemo(() => {
    return sortedMarkets.map((mkt, idx) => ({
      image: MARKET_IMAGES[idx % MARKET_IMAGES.length],
      alt: mkt.marketName,
      title: mkt.marketName,
      subtitle: `${mkt.city}, ${mkt.state || 'Karnataka'} • ${mkt.distanceKm} km`,
      badge: mkt.id === bestMarketId ? 'BEST RETURN' : `Net: ₹${mkt.estNetReturnPerKg.toFixed(2)}/kg`,
      tag: `Mandi: ₹${mkt.currentPricePerKg.toFixed(2)}/kg`,
      price: 'Click to view crops →',
      data: mkt
    }));
  }, [sortedMarkets, bestMarketId]);

  const cropCarouselItems: DepthCarouselItem[] = useMemo(() => {
    const dist = selectedMarket?.distanceKm || 40;
    return CROP_LIST_DATA.map(crop => {
      const baseMandi = crop.name.includes('Bean')
        ? 78
        : crop.name.includes('Tomato')
        ? 42
        : crop.name.includes('Onion')
        ? 60
        : crop.name.includes('Potato')
        ? 51
        : 65;
      const transportDeduction = Math.round(((dist * 10) / crop.qty) * 100) / 100;
      const netEst = Math.round((baseMandi - transportDeduction) * 100) / 100;

      return {
        image: crop.img,
        alt: crop.name,
        title: crop.name,
        subtitle: `${crop.variety} • ${crop.qty} kg load`,
        badge: crop.name === selectedCropName ? 'SELECTED CROP' : undefined,
        tag: `Mandi: ₹${baseMandi.toFixed(2)}/kg`,
        price: `Net: ₹${netEst.toFixed(2)}/kg`,
        data: crop
      };
    });
  }, [selectedCropName, selectedMarket]);

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

        {/* DepthCarousel 3D Stage from React Bits */}
        {!isLoading && !hasError && (
          <div className="w-full relative overflow-hidden rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-card py-5 my-2">
            <div className="px-5 pb-2 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {viewMode === 'crop' && (
                  <button
                    type="button"
                    onClick={() => setViewMode('market')}
                    className="flex items-center gap-1 text-primary hover:bg-primary-fixed/30 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[12px] font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Markets</span>
                  </button>
                )}
                <span className="text-label-sm font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {viewMode === 'market' ? 'storefront' : 'eco'}
                  </span>
                  <span>
                    {viewMode === 'market'
                      ? '3D Market Corridors (Click card to view crops)'
                      : `Available Crops at ${selectedMarket?.marketName || 'Selected Market'}`}
                  </span>
                </span>
              </div>
              <span className="text-[11px] text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {viewMode === 'market' ? 'Click Card to Drill Down' : 'Drag / Click to Select'}
              </span>
            </div>

            <div style={{ height: '400px', position: 'relative' }}>
              <DepthCarousel
                items={viewMode === 'market' ? marketCarouselItems : cropCarouselItems}
                cardWidth={280}
                cardHeight={350}
                radius={20}
                depth={200}
                spread={85}
                tilt={20}
                tiltDirection="right"
                perspective={1300}
                visibleCards={4}
                falloff={0.2}
                blur={4}
                autoplay={false}
                loop={true}
                showControls={true}
                showIndicators={true}
                onChange={(idx, item) => {
                  if (viewMode === 'market' && item?.data) {
                    setSelectedMarket(item.data);
                  } else if (viewMode === 'crop' && item?.data) {
                    handleCropChange(item.data.name);
                  }
                }}
                onItemClick={(idx, item) => {
                  if (viewMode === 'market' && item?.data) {
                    handleSelectMarket(item.data);
                  } else if (viewMode === 'crop' && item?.data) {
                    handleCropChange(item.data.name);
                  }
                }}
              />
            </div>
          </div>
        )}

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

      </div>
    </AppLayout>
  );
};
