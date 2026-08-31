import React, { useState } from 'react';
import { ProduceListing } from '../../types';

interface ProduceDetailsModalProps {
  produce: ProduceListing | null;
  govtModalPrice?: number | null;
  govtMandiName?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNegotiate: (produce: ProduceListing) => void;
  onBuyNow: (produce: ProduceListing) => void;
}

export const ProduceDetailsModal: React.FC<ProduceDetailsModalProps> = ({
  produce,
  govtModalPrice,
  govtMandiName,
  isOpen,
  onClose,
  onNegotiate,
  onBuyNow
}) => {
  if (!isOpen || !produce) return null;

  const [orderQty, setOrderQty] = useState<number>(produce.minOrderQuantityKg || 50);
  const [qtyError, setQtyError] = useState<string | null>(null);

  const handleQtyChange = (val: number) => {
    setOrderQty(val);
    if (isNaN(val) || val <= 0) {
      setQtyError('Enter a quantity greater than 0 kg');
    } else if (val < produce.minOrderQuantityKg) {
      setQtyError(`Minimum order is ${produce.minOrderQuantityKg} kg`);
    } else if (val > produce.quantityKg) {
      setQtyError(`Maximum available is ${produce.quantityKg} kg`);
    } else {
      setQtyError(null);
    }
  };

  const isQtyValid = !qtyError && orderQty >= (produce.minOrderQuantityKg || 1) && orderQty <= produce.quantityKg;
  const totalAmount = Math.round(orderQty * produce.pricePerKg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden shadow-elevated border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image with close button */}
        <div className="relative w-full h-52 bg-surface-container-low overflow-hidden shrink-0">
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

              {/* Farmer Asking Price */}
              <div className="text-right">
                <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">
                  ₹{produce.pricePerKg}
                </span>
                <span className="text-[11px] text-on-surface-variant font-semibold block">Farmer asking / kg</span>
              </div>
            </div>
          </div>

          {/* Government Market Reference (Secondary) */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between text-[12px]">
            <div>
              <span className="font-bold text-[#0f5238] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                Government Market Reference
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {govtMandiName ? `${govtMandiName} • Source: data.gov.in` : 'Official APMC AGMARKNET dataset'}
              </span>
            </div>
            <div className="text-right">
              {govtModalPrice ? (
                <span className="font-bold text-on-surface text-[14px]">₹{govtModalPrice}/kg</span>
              ) : (
                <span className="text-on-surface-variant italic text-[11px]">Unavailable</span>
              )}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-surface-container-low p-2.5 rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant font-medium block">Available</span>
              <span className="text-body-md font-bold text-on-surface">{produce.quantityKg} kg</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant font-medium block">Min Order</span>
              <span className="text-body-md font-bold text-on-surface">{produce.minOrderQuantityKg} kg</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-2xl border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant font-medium block">Shelf Life</span>
              <span className="text-body-md font-bold text-tertiary">~{produce.shelfLifeDays} days</span>
            </div>
          </div>

          {/* Farmer & Location Info Card */}
          <div className="flex items-center gap-3.5 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <img
              src={produce.farmerAvatar}
              alt={produce.farmerName}
              className="w-11 h-11 rounded-full object-cover border border-outline-variant/30 shrink-0"
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

          {/* Quantity Selector */}
          <div className="p-3.5 bg-primary-fixed/20 rounded-2xl border border-primary/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-primary uppercase tracking-wider">
                Select Purchase Quantity
              </label>
              <span className="text-[12px] font-bold text-on-surface">
                Total: ₹{totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-surface-container-lowest rounded-xl h-11 px-3 border border-outline-variant/30 focus-within:border-primary">
                <input
                  type="number"
                  min={produce.minOrderQuantityKg || 1}
                  max={produce.quantityKg}
                  value={orderQty}
                  onChange={e => handleQtyChange(Number(e.target.value))}
                  className="flex-1 bg-transparent outline-none font-bold text-body-md text-on-surface"
                />
                <span className="text-[12px] font-semibold text-on-surface-variant">kg</span>
              </div>

              {/* Quick Preset Buttons */}
              <button
                type="button"
                onClick={() => handleQtyChange(produce.minOrderQuantityKg || 50)}
                className="px-2.5 py-2 bg-surface-container-lowest hover:bg-surface-container text-[11px] font-semibold text-on-surface rounded-xl border border-outline-variant/30"
              >
                Min ({produce.minOrderQuantityKg}kg)
              </button>
              <button
                type="button"
                onClick={() => handleQtyChange(produce.quantityKg)}
                className="px-2.5 py-2 bg-surface-container-lowest hover:bg-surface-container text-[11px] font-semibold text-on-surface rounded-xl border border-outline-variant/30"
              >
                All ({produce.quantityKg}kg)
              </button>
            </div>

            {qtyError && (
              <p className="text-[11px] font-semibold text-error">{qtyError}</p>
            )}
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
            <span>Negotiate</span>
          </button>

          <button
            disabled={!isQtyValid}
            onClick={() => {
              onClose();
              onBuyNow(produce);
            }}
            className={`h-touch-target-min rounded-2xl font-label-sm font-bold text-on-primary shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              isQtyValid ? 'bg-primary hover:bg-primary/90' : 'bg-primary/50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
