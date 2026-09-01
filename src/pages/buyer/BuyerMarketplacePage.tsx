import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProduceDetailsModal } from '../../components/common/ProduceDetailsModal';
import { ProduceListing } from '../../types';

export const BuyerMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { produceListings, setSelectedProduce, startNegotiationForProduce, buyerProfile, activeOrder, mandiPrices } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectProduce, setInspectProduce] = useState<ProduceListing | null>(null);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses'];

  // Case-insensitive search filtering across cropName, variety, farmerName, and location
  const filteredProduce = useMemo(() => {
    return produceListings.filter(prod => {
      const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();

      const matchCrop = prod.cropName?.toLowerCase().includes(term);
      const matchVariety = prod.variety?.toLowerCase().includes(term);
      const matchFarmer = prod.farmerName?.toLowerCase().includes(term);
      const matchLocation = prod.farmerLocation?.toLowerCase().includes(term);

      return matchCrop || matchVariety || matchFarmer || matchLocation;
    });
  }, [produceListings, selectedCategory, searchTerm]);

  // Helper to lookup Government reference price for a given crop
  const getGovtReference = (cropName: string) => {
    if (!mandiPrices || mandiPrices.length === 0) return null;
    const cropKey = cropName.toLowerCase().split(' ')[0];
    return mandiPrices.find(m => m.cropName.toLowerCase().includes(cropKey)) || null;
  };

  const handleNegotiate = (produce: ProduceListing) => {
    setSelectedProduce(produce);
    startNegotiationForProduce(produce);
    navigate('/buyer/negotiation');
  };

  const handleBuyNow = (produce: ProduceListing) => {
    setSelectedProduce(produce);
    navigate('/buyer/transporter-matching');
  };

  // Currently inspected crop's Government reference
  const currentInspectedGovt = inspectProduce ? getGovtReference(inspectProduce.cropName) : null;

  return (
    <AppLayout title="Marketplace">
      <div className="flex flex-col w-full gap-4 pb-8">
        
        {/* Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Marketplace</h2>
          <p className="text-[13px] text-on-surface-variant">Find fresh produce directly from farmers</p>
        </div>

        {/* Gentle Buyer Profile Completion Banner if not 100% */}
        {buyerProfile && buyerProfile.completionPercentage < 100 && (
          <div
            onClick={() => navigate('/buyer/profile')}
            className="p-3.5 bg-secondary-fixed/20 border border-secondary/30 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-secondary-fixed/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm font-bold text-on-surface">
                  Buyer Profile is {buyerProfile.completionPercentage}% Complete
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Set warehouse location &amp; procurement preferences for escrow trades.
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-[20px]">arrow_forward</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative flex items-center bg-surface-container-low rounded-2xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search produce..."
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

        {/* Active Dispatch Live Tracking Banner if shipment active */}
        {activeOrder && (
          <div
            onClick={() => navigate('/buyer/live-tracking')}
            className="bg-surface-container-lowest rounded-2xl p-4 border-2 border-secondary/30 shadow-card flex items-center justify-between gap-3 cursor-pointer hover:border-secondary transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">local_shipping</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <h4 className="font-label-sm font-bold text-on-surface">
                    Incoming Delivery • Order #{activeOrder.orderNumber}
                  </h4>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  {activeOrder.cropName} ({activeOrder.quantityKg}kg) • Live Transporter GPS Tracking
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-[20px]">arrow_forward</span>
          </div>
        )}

        {/* Available Produce Header */}
        <div className="flex items-center justify-between pt-1">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Available Produce</h3>
          <span className="text-[12px] text-on-surface-variant font-medium">
            {filteredProduce.length} listing{filteredProduce.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Empty State */}
        {filteredProduce.length === 0 && (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/60 mb-2">search_off</span>
            <h4 className="font-label-sm font-bold text-on-surface">No produce found.</h4>
            <p className="text-[12px] text-on-surface-variant mt-1">Try another crop or category.</p>
          </div>
        )}

        {/* Produce Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProduce.map(produce => {
            const govtRef = getGovtReference(produce.cropName);

            return (
              <div
                key={produce.id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                {/* Card Image with Quality Grade */}
                <div
                  onClick={() => setInspectProduce(produce)}
                  className="relative w-full h-44 bg-surface-container-low overflow-hidden cursor-pointer group"
                >
                  <img
                    src={produce.imageUrl}
                    alt={produce.cropName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Photo Count Indicator for Feed */}
                  {(produce.imageUrls && produce.imageUrls.length > 1) && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 pointer-events-none shadow-sm">
                      <span className="material-symbols-outlined text-[12px]">photo_library</span>
                      {produce.imageUrls.length}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-primary border border-outline-variant/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    {produce.qualityGrade}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-white">
                    {produce.harvestDate}
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-surface/90 text-primary font-bold text-[12px] px-3 py-1.5 rounded-full shadow-sm">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  
                  {/* Produce Name & Asking Price */}
                  <div onClick={() => setInspectProduce(produce)} className="cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-title-md text-title-md font-bold text-on-surface leading-snug">
                          {produce.cropName}
                        </h4>
                        <p className="text-[13px] text-on-surface-variant font-medium mt-0.5">
                          {produce.variety} • {produce.category}
                        </p>
                      </div>

                      {/* Prominent Farmer Asking Price */}
                      <div className="text-right shrink-0">
                        <div className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary leading-none">
                          ₹{produce.pricePerKg}
                          <span className="text-[12px] font-normal text-on-surface-variant">/kg</span>
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant block mt-0.5">
                          Farmer asking price
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Farmer & Location Info Bar */}
                  <div className="flex items-center gap-2.5 p-2 bg-surface-container-low rounded-xl text-[12px]">
                    <img
                      src={produce.farmerAvatar}
                      alt={produce.farmerName}
                      className="w-8 h-8 rounded-full object-cover border border-outline-variant/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface truncate">{produce.farmerName}</p>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-0.5 truncate">
                        <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
                        <span>{produce.farmerLocation}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-on-surface block">{produce.quantityKg} kg available</span>
                      <span className="text-[10px] text-on-surface-variant">Min order: {produce.minOrderQuantityKg} kg</span>
                    </div>
                  </div>

                  {/* Secondary Government Reference */}
                  <div className="flex items-center justify-between text-[11px] px-1 text-on-surface-variant">
                    <span className="flex items-center gap-1 font-medium text-[#0f5238]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                      Govt Ref: {govtRef ? `₹${govtRef.modalPrice}/kg` : 'Unavailable'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/80">Source: data.gov.in</span>
                  </div>

                  {/* Card Action Buttons: View Details, Negotiate, Buy Now */}
                  <div className="flex items-center gap-2 pt-1 mt-auto">
                    <button
                      onClick={() => setInspectProduce(produce)}
                      className="h-touch-target-min px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm font-semibold transition-all flex items-center justify-center gap-1 active:scale-95"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[18px]">info</span>
                    </button>

                    <button
                      onClick={() => handleNegotiate(produce)}
                      className="flex-1 h-touch-target-min rounded-xl bg-surface-container-high hover:bg-surface-container font-label-sm font-bold text-on-surface transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">handshake</span>
                      <span>Negotiate</span>
                    </button>

                    <button
                      onClick={() => handleBuyNow(produce)}
                      className="flex-1 h-touch-target-min rounded-xl bg-primary hover:bg-primary/90 font-label-sm font-bold text-on-primary shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Produce Details Modal */}
      <ProduceDetailsModal
        produce={inspectProduce}
        govtModalPrice={currentInspectedGovt?.modalPrice}
        govtMandiName={currentInspectedGovt?.mandiName}
        isOpen={inspectProduce !== null}
        onClose={() => setInspectProduce(null)}
        onNegotiate={handleNegotiate}
        onBuyNow={handleBuyNow}
      />
    </AppLayout>
  );
};
