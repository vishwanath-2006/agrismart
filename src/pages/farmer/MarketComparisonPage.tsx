import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TOMATO_IMG } from '../../data/mockData';
import { MarketComparisonItem, PriceHistoryPoint } from '../../types';
import { fetchMarketComparisonsFromSupabase, fetchPriceHistoryFromSupabase, generateAiForecastPoints } from '../../services/mandiPriceService';
import AccordionGallery, { AccordionGalleryItem } from '../../components/common/AccordionGallery';
import ContextDropdown, { DropdownOption } from '../../components/common/ContextDropdown';
import { PriceSplineChart } from '../../components/common/PriceSplineChart';

export function formatCleanLabel(name: string): string {
  return name.replace(/\s*\(\d+\s*kg\)/gi, '').trim();
}

export const MarketComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMarket, setSelectedMarket, selectedProduce, setSelectedProduce, produceListings, priceHistory, setPriceHistory } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'market' | 'crop'>('market');
  const [markets, setMarkets] = useState<MarketComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [graphTimeframe, setGraphTimeframe] = useState<'7D' | '1M' | 'Forecast'>('Forecast');

  const selectedCropName = selectedProduce?.cropName || 'Tomato (Hybrid)';

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

  // Load price history graph points for selected crop & benchmark market
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const history = await fetchPriceHistoryFromSupabase(selectedCropName, selectedMarket?.marketName);
        if (isMounted && history.length > 0) {
          setPriceHistory(history);
        }
      } catch (err) {
        console.warn('Error loading chart history:', err);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedCropName, selectedMarket?.marketName, setPriceHistory]);

  // Prepare chart points
  const realHistoricalPoints = useMemo(
    () => priceHistory.filter(p => !p.isForecast),
    [priceHistory]
  );
  const latestHistorical = realHistoricalPoints[realHistoricalPoints.length - 1];
  const currentBenchmarkPrice = selectedMarket?.currentPricePerKg || (latestHistorical ? latestHistorical.price : 40.0);

  const displayChartData: PriceHistoryPoint[] = useMemo(() => {
    if (realHistoricalPoints.length === 0) {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      return [
        { date: 'Day -4', price: currentBenchmarkPrice - 2.5, isForecast: false, timestamp: now - 4 * day },
        { date: 'Day -3', price: currentBenchmarkPrice - 1.0, isForecast: false, timestamp: now - 3 * day },
        { date: 'Day -2', price: currentBenchmarkPrice + 1.2, isForecast: false, timestamp: now - 2 * day },
        { date: 'Yesterday', price: currentBenchmarkPrice - 0.5, isForecast: false, timestamp: now - 1 * day },
        { date: 'Today (Live)', price: currentBenchmarkPrice, isForecast: false, timestamp: now },
        { date: 'Tomorrow (AI)', price: currentBenchmarkPrice + 1.8, isForecast: true, timestamp: now + 1 * day },
        { date: '+2 Days (AI)', price: currentBenchmarkPrice + 2.5, isForecast: true, timestamp: now + 2 * day },
      ];
    }

    if (graphTimeframe === 'Forecast') {
      const forecastPoints = generateAiForecastPoints(currentBenchmarkPrice, latestHistorical?.date);
      return [...realHistoricalPoints, ...forecastPoints];
    }

    return realHistoricalPoints;
  }, [realHistoricalPoints, currentBenchmarkPrice, graphTimeframe, latestHistorical]);

  // Real-time search filter
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
    { name: 'Tomato (Hybrid)', qty: 500, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', estRate: '₹30.00/kg', variety: 'Abhinav 3140' },
    { name: 'Beans', qty: 600, img: 'https://images.unsplash.com/photo-1551893665-f843f600794e?auto=format&fit=crop&w=800&q=80', estRate: '₹40.00/kg', variety: 'Local Fresh Grade A' },
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

  const marketAccordionItems: AccordionGalleryItem[] = useMemo(() => {
    return sortedMarkets.map((mkt, idx) => ({
      image: MARKET_IMAGES[idx % MARKET_IMAGES.length],
      alt: mkt.marketName,
      label: mkt.marketName,
      sublabel: `Net: ₹${mkt.estNetReturnPerKg.toFixed(2)}/kg • Mandi: ₹${mkt.currentPricePerKg.toFixed(2)}/kg • ${mkt.distanceKm} km`,
      badge: mkt.id === bestMarketId ? 'BEST RETURN' : undefined,
      tag: `Mandi: ₹${mkt.currentPricePerKg.toFixed(2)}/kg`,
      price: `Net: ₹${mkt.estNetReturnPerKg.toFixed(2)}/kg`,
      data: mkt
    }));
  }, [sortedMarkets, bestMarketId]);

  const cropAccordionItems: AccordionGalleryItem[] = useMemo(() => {
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
        label: crop.name,
        sublabel: `${crop.variety} • ${crop.qty} kg load • Net: ₹${netEst.toFixed(2)}/kg (Mandi ₹${baseMandi}/kg)`,
        badge: crop.name === selectedCropName ? 'SELECTED CROP' : undefined,
        tag: `Mandi: ₹${baseMandi.toFixed(2)}/kg`,
        price: `Net: ₹${netEst.toFixed(2)}/kg`,
        data: crop
      };
    });
  }, [selectedCropName, selectedMarket]);

  const filteredCropAccordionItems = useMemo(() => {
    if (!searchTerm.trim()) return cropAccordionItems;
    const term = searchTerm.toLowerCase().trim();
    return cropAccordionItems.filter(
      item =>
        item.label?.toLowerCase().includes(term) ||
        item.sublabel?.toLowerCase().includes(term) ||
        item.tag?.toLowerCase().includes(term)
    );
  }, [cropAccordionItems, searchTerm]);

  const cropDropdownOptions: DropdownOption[] = useMemo(() => {
    return CROP_LIST_DATA.map(c => ({
      id: c.name,
      label: formatCleanLabel(c.name),
      sublabel: c.variety,
      imageUrl: c.img
    }));
  }, []);

  const marketDropdownOptions: DropdownOption[] = useMemo(() => {
    if (markets.length === 0) {
      return [
        {
          id: 'default',
          label: 'Kanjirappally Market',
          sublabel: 'Kottayam, Kerala • 40 km',
          imageUrl: MARKET_IMAGES[0]
        }
      ];
    }
    return markets.map((m, idx) => ({
      id: m.id,
      label: m.marketName,
      sublabel: `${m.city}, ${m.state || 'Karnataka'} • ${m.distanceKm} km`,
      imageUrl: MARKET_IMAGES[idx % MARKET_IMAGES.length]
    }));
  }, [markets]);

  const handleSelectMarket = (mkt: MarketComparisonItem) => {
    setSelectedMarket(mkt);
  };

  const handleSelectCrop = (crop: any) => {
    handleCropChange(crop.name);
  };

  return (
    <AppLayout title="Market Comparison" showBack onBack={() => navigate('/farmer/dashboard')}>
      <div className="flex flex-col w-full gap-4 pb-8">
        
        {/* 1. Header */}
        <div className="pt-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">Market Comparison</h1>
          <p className="text-[13px] text-on-surface-variant">Find the market where you earn the most after transport.</p>
        </div>

        {/* 2. Top Control Bar (Market View / Crop View) */}
        <div className="flex justify-center w-full my-0.5">
          <div className="inline-flex p-1 bg-surface-container rounded-full border border-outline-variant/30 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setViewMode('market');
                setSearchTerm('');
              }}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                viewMode === 'market'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Market View
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('crop');
                setSearchTerm('');
              }}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                viewMode === 'crop'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Crop View
            </button>
          </div>
        </div>

        {/* 3. Context Selector Dropdown */}
        {viewMode === 'market' ? (
          <ContextDropdown
            categoryLabel="Select Crop (Compare across Markets)"
            options={cropDropdownOptions}
            selectedId={selectedCropName}
            onSelect={opt => handleCropChange(opt.id)}
            subtext="Farm Origin: Mysore, Karnataka"
            subtextIcon="location_on"
          />
        ) : (
          <ContextDropdown
            categoryLabel="Select Market (View Traded Inventory)"
            options={marketDropdownOptions}
            selectedId={selectedMarket?.id || (markets[0]?.id ?? 'default')}
            onSelect={opt => handleMarketChange(opt.id)}
            subtext={`Corridor: ${selectedMarket?.distanceKm || 40} km from farm`}
            subtextIcon="near_me"
          />
        )}

        {/* 4. Search Bar */}
        <div className="relative flex items-center bg-surface-container-low rounded-2xl h-11 px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder={
              viewMode === 'market'
                ? `Search market corridors for ${selectedCropName}...`
                : `Search crops traded at ${selectedMarket?.marketName || 'this market'}...`
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-outline-variant"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* 5. AccordionGallery Visual Stage */}
        {!isLoading && !hasError && (
          <div className="w-full relative overflow-hidden rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card py-4 my-1">
            <div className="px-4 pb-2.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {viewMode === 'crop' && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('market');
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-1 text-primary hover:bg-primary-fixed/30 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Market View</span>
                  </button>
                )}
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {viewMode === 'market' ? 'storefront' : 'eco'}
                  </span>
                  <span>
                    {viewMode === 'market'
                      ? `Market Corridors (Comparing markets for ${selectedCropName})`
                      : `Available Crops at ${selectedMarket?.marketName || 'Selected Market'}`}
                  </span>
                </span>
              </div>
              <span className="text-[11px] text-primary font-semibold bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                {viewMode === 'market' ? 'Hover/Click Card to Inspect' : 'Hover/Click to Select'}
              </span>
            </div>

            <div className="px-4">
              <AccordionGallery
                items={viewMode === 'market' ? marketAccordionItems : filteredCropAccordionItems}
                defaultIndex={0}
                expandRatio={0.48}
                height={280}
                gap={10}
                radius={16}
                accentColor="#0f5238"
                overlayColor="#041a10"
                textColor="#ffffff"
                trigger="hover"
                grayscale={true}
                showLabels={true}
                duration={0.6}
                tilt={6}
                parallax={0.4}
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
                    handleSelectCrop(item.data);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* 6. Comparison Table Section */}
        {!isLoading && !hasError && sortedMarkets.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">table_chart</span>
                </div>
                <div>
                  <h3 className="text-sm lg:text-base font-bold text-on-surface">Market Price & Net Return Breakdown</h3>
                  <p className="text-[11px] text-on-surface-variant">Real-time APMC Mandi rates minus transport logistics costs</p>
                </div>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium hidden sm:inline">
                {sortedMarkets.length} markets analyzed
              </span>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/50 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Market / Location</th>
                    <th className="py-2.5 px-3 text-center">Distance</th>
                    <th className="py-2.5 px-3 text-right">Mandi Price</th>
                    <th className="py-2.5 px-3 text-right">Transport Cost</th>
                    <th className="py-2.5 px-3 text-right">Est. Net Earning</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {sortedMarkets.map(mkt => {
                    const isSelected = selectedMarket?.id === mkt.id;
                    const isBest = mkt.id === bestMarketId;
                    return (
                      <tr
                        key={mkt.id}
                        onClick={() => setSelectedMarket(mkt)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary-fixed/20 font-semibold'
                            : 'hover:bg-surface-container-low/60'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {isBest && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0f5238] text-white">
                                BEST
                              </span>
                            )}
                            <div>
                              <p className="font-bold text-on-surface">{mkt.marketName}</p>
                              <p className="text-[10px] text-on-surface-variant">{mkt.city}, {mkt.state || 'Karnataka'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-on-surface font-medium">
                          {mkt.distanceKm} km
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-on-surface">
                          ₹{mkt.currentPricePerKg.toFixed(2)}/kg
                        </td>
                        <td className="py-3 px-3 text-right text-secondary font-medium">
                          -₹{mkt.transportCostPerKg.toFixed(2)}/kg
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-sm font-bold text-primary">
                            ₹{mkt.estNetReturnPerKg.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-normal">/kg</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMarket(mkt);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-primary text-on-primary shadow-xs'
                                : 'bg-surface-container-low hover:bg-surface-container text-primary border border-outline-variant/30'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Embedded Price History & Forecasting Graph */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/40 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">show_chart</span>
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-bold text-on-surface">
                  Price History & AI Trend Forecast: {selectedCropName}
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  {selectedMarket ? `${selectedMarket.marketName} (${selectedMarket.city})` : 'Benchmark Mandi'} • Source: data.gov.in
                </p>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setGraphTimeframe('7D')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  graphTimeframe === '7D'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setGraphTimeframe('1M')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  graphTimeframe === '1M'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                1 Month
              </button>
              <button
                type="button"
                onClick={() => setGraphTimeframe('Forecast')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  graphTimeframe === 'Forecast'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                AI Forecast
              </button>
            </div>
          </div>

          {/* Spline Chart */}
          <PriceSplineChart
            data={displayChartData}
            title={`${selectedCropName} Price Trend (${selectedMarket?.marketName || 'Benchmark Mandi'})`}
            subtitle="Government daily APMC mandi observations with predictive trend curve"
            cropName={selectedCropName}
            showForecast={graphTimeframe === 'Forecast'}
          />
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
            <p className="text-xs font-semibold text-on-surface">Loading APMC market data & price trends...</p>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default MarketComparisonPage;