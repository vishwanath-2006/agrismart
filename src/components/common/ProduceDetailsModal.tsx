import React from 'react';
import { ProduceListing } from '../../types';

interface ProduceDetailsModalProps {
  produce: ProduceListing | null;
  isOpen: boolean;
  onClose: () => void;
  onNegotiate: (produce: ProduceListing) => void;
  onBuyNow: (produce: ProduceListing) => void;
}

export const ProduceDetailsModal: React.FC<ProduceDetailsModalProps> = ({
  produce,
  isOpen,
  onClose,
  onNegotiate,
  onBuyNow
}) => {
  if (!isOpen || !produce) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-elevated border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image with close button */}
        <div className="relative w-full h-56 bg-surface-container-low overflow-hidden shrink-0">
          <img
            src={produce.imageUrl}
            alt={produce.cropName}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold text-primary border border-outline-variant/30 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            {produce.qualityGrade}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-medium text-white">
            Harvested: {produce.harvestDate}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-on-surface">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">
                  {produce.cropName}
                </h2>
                <p className="text-[14px] text-on-surface-variant font-medium mt-0.5">
                  Variety: {produce.variety} • {produce.category}
                </p>
              </div>
              <div className="text-right">
                <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">
                  ₹{produce.pricePerKg}
                </span>
                <span className="text-[12px] text-on-surface-variant block">per kg</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {produce.description && (
            <div className="p-3 bg-surface-container-low rounded-2xl text-[13px] leading-relaxed text-on-surface-variant border border-outline-variant/20">
              {produce.description}
            </div>
          )}

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant font-medium block">Available</span>
              <span className="text-body-md font-bold text-on-surface">{produce.quantityKg} kg</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant font-medium block">Min Order</span>
              <span className="text-body-md font-bold text-on-surface">{produce.minOrderQuantityKg} kg</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant font-medium block">Shelf Life</span>
              <span className="text-body-md font-bold text-tertiary">~{produce.shelfLifeDays} days</span>
            </div>
          </div>

          {/* Farmer & Location Info Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <img
              src={produce.farmerAvatar}
              alt={produce.farmerName}
              className="w-12 h-12 rounded-full object-cover border border-outline-variant/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="font-label-sm font-bold text-on-surface truncate">{produce.farmerName}</h4>
                <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
              </div>
              <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                {produce.farmerLocation}
              </p>
            </div>
          </div>

          {/* AI Pricing Guidance Pill */}
          <div className="bg-tertiary-container/40 p-3 rounded-2xl border border-tertiary/20 flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-1.5 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span className="font-semibold">AI Benchmark Guide</span>
            </div>
            <span className="font-bold text-primary">₹{(produce.pricePerKg * 0.95).toFixed(1)} – ₹{produce.pricePerKg}/kg</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest grid grid-cols-2 gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onNegotiate(produce);
            }}
            className="h-touch-target-min rounded-2xl bg-surface-container-high hover:bg-surface-container font-label-sm font-bold text-on-surface transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">handshake</span>
            Negotiate Rate
          </button>

          <button
            onClick={() => {
              onClose();
              onBuyNow(produce);
            }}
            className="h-touch-target-min rounded-2xl bg-primary hover:bg-primary-container font-label-sm font-bold text-on-primary shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            Buy Direct
          </button>
        </div>
      </div>
    </div>
  );
};
