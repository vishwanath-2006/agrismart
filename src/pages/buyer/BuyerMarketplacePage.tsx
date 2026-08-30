import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';
import { ProduceDetailsModal } from '../../components/common/ProduceDetailsModal';
import { ProduceListing } from '../../types';

export const BuyerMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { produceListings, setSelectedProduce, startNegotiationForProduce } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectProduce, setInspectProduce] = useState<ProduceListing | null>(null);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses'];

  const filteredProduce = produceListings.filter(prod => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      prod.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.farmerLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNegotiate = (produce: ProduceListing) => {
    setSelectedProduce(produce);
    startNegotiationForProduce(produce);
    navigate('/buyer/negotiation');
  };

  const handleBuyNow = (produce: ProduceListing) => {
    setSelectedProduce(produce);
    navigate('/buyer/transporter-matching');
  };

  return (
    <AppLayout title="Buyer Marketplace">
      <div className="flex flex-col w-full gap-4">
        {/* Search Bar */}
        <div className="relative flex items-center bg-surface-container-low rounded-2xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all mt-1">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search farm-fresh produce, farmers, mandis..."
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

        {/* Category Carousel */}
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

        {/* AI Best Value Match Banner */}
        <AIInsightBanner
          title="AI Best Procurement Match"
          description="High Grade Hybrid Tomatoes in Mysore are priced 7% below KR Market APMC benchmark for bulk wholesale procurement."
          badgeLabel="Fair Wholesale Price"
          badgeValue="₹28.50 – ₹30.00/kg"
          actionText="Inspect & Negotiate"
          onAction={() => {
            const tomato = produceListings.find(p => p.cropName.includes('Tomato')) || produceListings[0];
            handleNegotiate(tomato);
          }}
        />

        {/* Available Harvests Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Available Direct Harvests</h3>
            <p className="text-[12px] text-on-surface-variant">{filteredProduce.length} verified farm listings</p>
          </div>
        </div>

        {/* Produce Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {filteredProduce.map(produce => (
            <div
              key={produce.id}
              className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              {/* Card Image & Grade Badge (Click to open details) */}
              <div
                onClick={() => setInspectProduce(produce)}
                className="relative w-full h-44 bg-surface-container-low overflow-hidden cursor-pointer group"
              >
                <img
                  src={produce.imageUrl}
                  alt={produce.cropName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
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

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div onClick={() => setInspectProduce(produce)} className="cursor-pointer">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-title-md text-title-md font-bold text-on-surface leading-snug">
                      {produce.cropName}
                    </h4>
                    <span className="font-title-md text-title-md font-bold text-primary shrink-0">
                      ₹{produce.pricePerKg}
                      <span className="text-[12px] font-normal text-on-surface-variant">/kg</span>
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant font-medium mt-0.5">{produce.variety}</p>
                </div>

                {/* Farmer Info Bar */}
                <div className="flex items-center gap-2.5 p-2 bg-surface-container-low rounded-xl">
                  <img
                    src={produce.farmerAvatar}
                    alt={produce.farmerName}
                    className="w-8 h-8 rounded-full object-cover border border-outline-variant/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-on-surface truncate">{produce.farmerName}</p>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-0.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
                      {produce.farmerLocation}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-semibold text-on-surface block">{produce.quantityKg} kg</span>
                    <span className="text-[10px] text-on-surface-variant">Min: {produce.minOrderQuantityKg}kg</span>
                  </div>
                </div>

                {/* Card CTA Buttons: View Details, Negotiate, Buy Now */}
                <div className="flex items-center gap-2 pt-1 mt-auto">
                  <button
                    onClick={() => setInspectProduce(produce)}
                    className="h-touch-target-min px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm font-semibold transition-all flex items-center justify-center gap-1 active:scale-95"
                    title="View full specs"
                  >
                    <span className="material-symbols-outlined text-[18px]">info</span>
                  </button>

                  <button
                    onClick={() => handleNegotiate(produce)}
                    className="flex-1 h-touch-target-min rounded-xl bg-surface-container-high hover:bg-surface-container font-label-sm font-bold text-on-surface transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">handshake</span>
                    Negotiate
                  </button>

                  <button
                    onClick={() => handleBuyNow(produce)}
                    className="flex-1 h-touch-target-min rounded-xl bg-primary hover:bg-primary-container font-label-sm font-bold text-on-primary shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produce Inspection Modal */}
      <ProduceDetailsModal
        produce={inspectProduce}
        isOpen={inspectProduce !== null}
        onClose={() => setInspectProduce(null)}
        onNegotiate={handleNegotiate}
        onBuyNow={handleBuyNow}
      />
    </AppLayout>
  );
};
