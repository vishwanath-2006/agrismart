import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TransporterOption } from '../../types';

export const TransporterMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const { transporters, setSelectedTransporter, selectedTransporter, selectedProduce, currentNegotiation, buyerProfile } = useApp();

  const [activeTransporter, setActiveTransporter] = useState<TransporterOption>(
    selectedTransporter || (transporters.length > 0 ? (transporters.find(t => t.isAiBestMatch) || transporters[0]) : ({} as TransporterOption))
  );

  // Preserve authentic order context & negotiated price from Step 7
  const cropName = selectedProduce?.cropName || currentNegotiation?.cropName || 'Tomato (Hybrid)';
  const quantityKg = selectedProduce?.quantityKg || currentNegotiation?.quantityKg || 500;
  const producePrice =
    currentNegotiation && currentNegotiation.currentOfferPricePerKg
      ? currentNegotiation.currentOfferPricePerKg
      : selectedProduce?.pricePerKg || 30;

  const produceSubtotal = Math.round(quantityKg * producePrice);
  const pickupLocation = selectedProduce?.farmerLocation || 'Mysore Farm Gate';
  const deliveryLocation = buyerProfile?.city ? `${buyerProfile.city}, ${buyerProfile.state || 'Karnataka'}` : 'Bangalore Central';
  const routeDistanceKm = 145;

  const handleSelectTransporter = (trans: TransporterOption) => {
    setActiveTransporter(trans);
    setSelectedTransporter(trans);
  };

  const handleContinueToOrder = () => {
    if (activeTransporter && activeTransporter.id) {
      setSelectedTransporter(activeTransporter);
    }
    navigate('/buyer/order-confirmation');
  };

  const transportCost = activeTransporter?.totalCost || 1450;
  const escrowFee = 250;
  const estimatedTotal = produceSubtotal + transportCost + escrowFee;

  return (
    <AppLayout title="Choose Transporter" showBack onBack={() => navigate('/buyer/negotiation')}>
      <div className="flex flex-col w-full gap-4 pb-12">
        
        {/* Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Choose Transporter</h2>
          <p className="text-[13px] text-on-surface-variant">Select a transporter for your order</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between text-[12px] font-bold text-on-surface-variant px-1">
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">✓</span>
            Produce Deal
          </span>
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">2</span>
            Logistics Match
          </span>
          <span className="text-on-surface-variant/60 flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant text-[10px] flex items-center justify-center font-bold">3</span>
            Checkout
          </span>
        </div>

        {/* 1. Order & Route Summary Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full">
              Order &amp; Route Summary
            </span>
            <span className="text-[13px] font-bold text-on-surface">{routeDistanceKm} km • ~3.5 hrs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-[11px] text-on-surface-variant block">Produce</span>
              <span className="text-label-sm font-bold text-on-surface truncate block">{cropName}</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-[11px] text-on-surface-variant block">Quantity</span>
              <span className="text-label-sm font-bold text-on-surface block">{quantityKg} kg</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-[11px] text-on-surface-variant block">Pickup</span>
              <span className="text-label-sm font-bold text-on-surface truncate block">{pickupLocation}</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-[11px] text-on-surface-variant block">Delivery</span>
              <span className="text-label-sm font-bold text-on-surface truncate block">{deliveryLocation}</span>
            </div>
          </div>

          {/* Negotiated Price Summary Line */}
          <div className="flex items-center justify-between text-[12px] pt-2 border-t border-outline-variant/20">
            <span className="text-on-surface-variant">
              Agreed Produce Rate: <strong className="text-on-surface font-bold">₹{producePrice}/kg</strong>
            </span>
            <span className="font-bold text-primary">Produce Subtotal: ₹{produceSubtotal.toLocaleString()}</span>
          </div>
        </div>

        {/* 2. AI Recommendation Banner */}
        <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-2xl shadow-card flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary-fixed flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              Recommended for this order
            </span>
            <span className="text-[10px] opacity-80">AI demo recommendation</span>
          </div>
          <p className="text-body-md leading-snug">
            Best match based on route ({routeDistanceKm} km), vehicle capacity (Reefer truck) and estimated cost.
          </p>
        </div>

        {/* 3. Empty State Check */}
        {transporters.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/60 mb-2">local_shipping</span>
            <h4 className="font-label-sm font-bold text-on-surface">No transporters available</h4>
            <p className="text-[12px] text-on-surface-variant mt-1">Please try again or check the route later.</p>
          </div>
        ) : (
          /* Available Transporters List */
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Available Transporters</h3>
              <span className="text-[11px] text-on-surface-variant">Demo transporter profiles</span>
            </div>

            {transporters.map(trans => {
              const isSelected = activeTransporter?.id === trans.id;
              const perKgCost = (trans.totalCost / quantityKg).toFixed(2);

              return (
                <div
                  key={trans.id}
                  onClick={() => handleSelectTransporter(trans)}
                  className={`bg-surface-container-lowest rounded-2xl p-4 border transition-all shadow-card cursor-pointer relative ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 shadow-md'
                      : 'border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  {/* Top Matched Badge */}
                  {trans.isAiBestMatch && (
                    <div className="absolute top-3 right-3 bg-tertiary text-on-tertiary px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>Top Match</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3.5 pr-14">
                    <img
                      src={trans.avatarUrl}
                      alt={trans.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-outline-variant/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-title-md text-title-md font-bold text-on-surface">{trans.name}</h4>
                        <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant font-medium">{trans.vehicleType}</p>
                      
                      {/* Rating & Trips (Transparent Demo Profile Stats) */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-on-surface-variant">
                        <span className="font-bold text-on-surface flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-secondary text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {trans.rating}
                        </span>
                        <span>• {trans.tripsCount} trips</span>
                        {trans.isRefrigerated && (
                          <span className="font-semibold text-tertiary bg-tertiary-fixed/30 px-1.5 py-0.5 rounded">
                            Cold Chain
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Calculated Logistics Estimate */}
                  <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl mt-3 text-on-surface">
                    <div>
                      <span className="text-[11px] text-on-surface-variant font-medium block">Rate</span>
                      <span className="text-[13px] font-bold">₹{trans.ratePerKm}/km</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant font-medium block">Est. Time</span>
                      <span className="text-[13px] font-bold">~{trans.transitTimeHrs} hrs</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                        Calculated Estimate
                      </span>
                      <span className="text-title-md font-bold text-primary">₹{trans.totalCost}</span>
                      <span className="text-[10px] text-on-surface-variant block">₹{perKgCost}/kg</span>
                    </div>
                  </div>

                  {/* Select Transporter Button */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTransporter(trans);
                      }}
                      className={`flex-1 h-touch-target-min rounded-xl font-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>{isSelected ? 'Selected' : 'Select Transporter'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Total Cost Preview & Continue to Order CTA */}
        {activeTransporter && activeTransporter.id && (
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-elevated flex flex-col gap-3 mt-2">
            <h4 className="font-label-sm font-bold text-on-surface uppercase tracking-wider">
              Total Order Cost Preview
            </h4>

            <div className="space-y-1.5 text-[13px] text-on-surface-variant border-b border-outline-variant/20 pb-3">
              <div className="flex justify-between">
                <span>Produce Cost ({quantityKg} kg @ ₹{producePrice}/kg)</span>
                <span className="font-semibold text-on-surface">₹{produceSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport ({activeTransporter.name})</span>
                <span className="font-semibold text-on-surface">₹{transportCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Protection Fee</span>
                <span className="font-semibold text-on-surface">₹{escrowFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <span className="font-bold text-on-surface text-body-md">Estimated Total</span>
              <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">
                ₹{estimatedTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleContinueToOrder}
              className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1"
            >
              <span>Continue to Order Confirmation</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
