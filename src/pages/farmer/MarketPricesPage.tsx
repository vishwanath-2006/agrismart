import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { formatArrivalDate } from '../../services/mandiPriceService';

export const MarketPricesPage: React.FC = () => {
  const navigate = useNavigate();
  const { mandiPrices, selectedMarket, setSelectedProduce, produceListings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses'];

  // Map crops to categories for accurate category filtering
  const getCropCategory = (cropName: string): string => {
    const lower = cropName.toLowerCase();
    if (lower.includes('tomato') || lower.includes('onion') || lower.includes('potato') || lower.includes('chilli')) {
      return 'Vegetables';
    }
    if (lower.includes('apple') || lower.includes('mango') || lower.includes('banana') || lower.includes('orange')) {
      return 'Fruits';
    }
    if (lower.includes('wheat') || lower.includes('rice') || lower.includes('maize') || lower.includes('paddy')) {
      return 'Grains';
    }
    if (lower.includes('gram') || lower.includes('dal') || lower.includes('pulse') || lower.includes('tur')) {
      return 'Pulses';
    }
    return 'Vegetables';
  };

  const filteredPrices = mandiPrices.filter(item => {
    const itemCategory = getCropCategory(item.cropName);
    const matchesCategory = selectedCategory === 'All' || itemCategory === selectedCategory;
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mandiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectMandi = (item: typeof mandiPrices[0]) => {
    const matchedProduce = produceListings.find(p => p.cropName.toLowerCase().includes(item.cropName.toLowerCase().split(' ')[0])) || produceListings[0];
    setSelectedProduce(matchedProduce);
    navigate('/farmer/price-history');
  };

  return (
    <AppLayout title="Market Prices" showBack onBack={() => navigate('/farmer/market-comparison')}>
      <div className="flex flex-col w-full gap-4">
        {/* Market Context Banner if selected */}
        {selectedMarket && (
          <div className="bg-primary-container text-on-primary-container p-3.5 rounded-2xl flex items-center justify-between shadow-sm mt-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">storefront</span>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-tertiary-fixed font-bold">Selected Mandi</p>
                <p className="text-body-md font-bold leading-tight">{selectedMarket.marketName}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/farmer/price-history')}
              className="text-[12px] bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full font-semibold transition-all"
            >
              View Forecast
            </button>
          </div>
        )}

        {/* Search Input Bar */}
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

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 h-[38px] px-4 rounded-full text-label-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Latest Reported Mandi Rates Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h3 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-1.5">
              <span>Latest Reported Mandi Rates</span>
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium">Official Government data.gov.in dataset</p>
          </div>
          <span className="text-[12px] text-on-surface-variant font-medium">
            {filteredPrices.length} commodities
          </span>
        </div>

        {/* Mandi Cards List */}
        <div className="space-y-3 pb-6">
          {filteredPrices.length > 0 ? (
            filteredPrices.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectMandi(item)}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card hover:border-primary/40 active:scale-[0.99] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Commodity & Mandi Location */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-title-md text-title-md font-bold text-on-surface truncate">{item.cropName}</h4>
                      <span className="text-[10px] font-bold text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full shrink-0">
                        {getCropCategory(item.cropName)}
                      </span>
                    </div>
                    <p className="text-[13px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                      <span>{item.mandiName}, {item.state}</span>
                    </p>
                  </div>

                  {/* Right: Modal Price & Min/Max Range */}
                  <div className="text-right shrink-0">
                    <div className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary leading-none">
                      ₹{item.modalPrice}
                      <span className="text-label-sm font-normal text-on-surface-variant">/kg</span>
                    </div>
                    <div className="text-[12px] font-semibold text-on-surface-variant mt-1">
                      ₹{item.minPrice} – ₹{item.maxPrice}<span className="text-[11px] font-normal">/kg</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Government reported status & View Details */}
                <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f5238] bg-[#0f5238]/10 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                      Government reported
                    </span>
                    <span className="text-[12px] text-on-surface-variant font-medium">
                      {item.lastUpdated}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[12px] font-semibold text-primary group-hover:underline">
                    <span>View History</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant/60 mb-2">search_off</span>
              <p className="font-label-sm font-semibold text-on-surface">No mandi rates match your filter</p>
              <p className="text-[12px]">Try clearing search or picking a different commodity category.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
