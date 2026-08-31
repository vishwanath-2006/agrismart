import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';

export const PriceNegotiationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentNegotiation, sendCounterOffer, acceptDeal, setSelectedProduce, produceListings, mandiPrices } = useApp();

  const deal = currentNegotiation || (produceListings.length > 0 ? {
    id: `deal_${produceListings[0].id}`,
    produceId: produceListings[0].id,
    cropName: produceListings[0].cropName,
    produceImage: produceListings[0].imageUrl,
    farmerName: produceListings[0].farmerName,
    quantityKg: produceListings[0].quantityKg,
    originalPricePerKg: produceListings[0].pricePerKg,
    currentOfferPricePerKg: Math.round((produceListings[0].pricePerKg * 0.95) * 10) / 10,
    lastOfferedBy: 'buyer' as const,
    aiFairPriceMin: Math.round((produceListings[0].pricePerKg * 0.92) * 10) / 10,
    aiFairPriceMax: Math.round((produceListings[0].pricePerKg * 0.98) * 10) / 10,
    status: 'PENDING' as const,
    messages: [
      {
        sender: 'farmer' as const,
        text: `Listed ${produceListings[0].quantityKg}kg of ${produceListings[0].cropName} at ₹${produceListings[0].pricePerKg}/kg.`,
        timestamp: 'Today',
        offeredPrice: produceListings[0].pricePerKg
      },
      {
        sender: 'buyer' as const,
        text: `Proposing ₹${(produceListings[0].pricePerKg * 0.95).toFixed(1)}/kg for bulk procurement.`,
        timestamp: 'Just now',
        offeredPrice: Math.round((produceListings[0].pricePerKg * 0.95) * 10) / 10
      }
    ]
  } : null);

  const [counterPrice, setCounterPrice] = useState<number>(deal ? deal.currentOfferPricePerKg : 28);
  const [customMsg, setCustomMsg] = useState('');
  const [isAccepted, setIsAccepted] = useState(deal?.status === 'ACCEPTED');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Government mandi reference for the negotiated crop
  const govtRefMandi = useMemo(() => {
    if (!deal || !mandiPrices || mandiPrices.length === 0) return null;
    const cropKey = deal.cropName.toLowerCase().split(' ')[0];
    return mandiPrices.find(m => m.cropName.toLowerCase().includes(cropKey)) || null;
  }, [deal, mandiPrices]);

  const govtModalPrice = govtRefMandi ? govtRefMandi.modalPrice : null;

  if (!deal) {
    return (
      <AppLayout title="Negotiate Price" showBack onBack={() => navigate('/buyer/marketplace')}>
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 gap-4 mt-6">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">handshake</span>
          <div>
            <h3 className="text-title-md font-bold text-on-surface">No Active Negotiation</h3>
            <p className="text-body-md text-on-surface-variant mt-1">Please select a produce listing from the marketplace to negotiate.</p>
          </div>
          <button
            onClick={() => navigate('/buyer/marketplace')}
            className="h-touch-target-min px-6 bg-primary text-on-primary font-bold rounded-xl text-label-sm shadow-sm"
          >
            Go to Marketplace
          </button>
        </div>
      </AppLayout>
    );
  }

  const selectedProduceItem = produceListings.find(p => p.id === deal.produceId) || produceListings[0];
  const totalProduceCost = Math.round(deal.quantityKg * counterPrice);

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isNaN(counterPrice) || counterPrice <= 0) {
      setValidationError('Enter a valid offer price (greater than ₹0/kg).');
      return;
    }

    sendCounterOffer(
      deal.id,
      counterPrice,
      customMsg || `Proposing revised rate of ₹${counterPrice.toFixed(1)}/kg for ${deal.quantityKg}kg.`
    );
    setCustomMsg('');
    setFeedbackMsg('Offer sent to farmer successfully.');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleAcceptAndProceed = () => {
    setIsAccepted(true);
    acceptDeal(deal.id);
    if (selectedProduceItem) {
      setSelectedProduce(selectedProduceItem);
    }
    navigate('/buyer/transporter-matching');
  };

  return (
    <AppLayout title="Negotiate Price" showBack onBack={() => navigate('/buyer/marketplace')}>
      <div className="flex flex-col w-full gap-4 pb-8">
        
        {/* Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Negotiate Price</h2>
          <p className="text-[13px] text-on-surface-variant">Agree on a fair price with the farmer</p>
        </div>

        {/* Feedback / Toast Message */}
        {feedbackMsg && (
          <div className="p-3 bg-tertiary-container/60 border border-tertiary/40 text-on-tertiary-container rounded-xl flex items-center gap-2 text-label-sm font-semibold animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 1. Produce Summary & Farmer Asking Price Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <div className="flex items-start gap-3.5">
            <img
              src={deal.produceImage || selectedProduceItem?.imageUrl}
              alt={deal.cropName}
              className="w-16 h-16 rounded-xl object-cover border border-outline-variant/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded-full">
                  {isAccepted ? 'Deal Agreed' : 'Active Negotiation'}
                </span>
                <span className="text-[12px] text-on-surface-variant font-medium">
                  {deal.quantityKg} kg selected
                </span>
              </div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface truncate mt-0.5">
                {deal.cropName}
              </h3>
              <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                <span>Farmer: {deal.farmerName} • {selectedProduceItem?.farmerLocation || 'Mysore'}</span>
              </p>
            </div>
          </div>

          {/* Pricing Comparison Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-outline-variant/20">
            {/* Farmer Asking Price */}
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
              <span className="text-[11px] font-semibold text-on-surface-variant block">Farmer asking price</span>
              <span className="text-title-md font-bold text-on-surface">₹{deal.originalPricePerKg}</span>
              <span className="text-[11px] text-on-surface-variant font-normal">/kg</span>
            </div>

            {/* Government Market Reference */}
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20">
              <span className="text-[11px] font-semibold text-[#0f5238] block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                Govt reference
              </span>
              {govtModalPrice ? (
                <div>
                  <span className="text-title-md font-bold text-on-surface">₹{govtModalPrice}</span>
                  <span className="text-[11px] text-on-surface-variant font-normal">/kg</span>
                  <span className="text-[10px] text-on-surface-variant/80 block">Source: data.gov.in</span>
                </div>
              ) : (
                <span className="text-[11px] text-on-surface-variant italic block mt-1">Unavailable</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. AI Price Guidance Banner */}
        <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-2xl shadow-card flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary-fixed flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              AI Price Guidance (AI estimate • Not Government data)
            </span>
          </div>
          <p className="text-body-md leading-snug">
            Prototype estimated range: <span className="font-bold">₹{deal.aiFairPriceMin} – ₹{deal.aiFairPriceMax}/kg</span> for bulk procurement of this harvest grade.
          </p>
        </div>

        {/* 3. Negotiation Offer History */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h4 className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
            Negotiation History
          </h4>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {deal.messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl text-[13px] ${
                  msg.sender === 'buyer'
                    ? 'bg-primary-fixed/25 text-on-primary-fixed ml-4 border border-primary/20'
                    : msg.sender === 'farmer'
                    ? 'bg-surface-container-low text-on-surface mr-4 border border-outline-variant/20'
                    : 'bg-tertiary-container/30 text-on-surface text-center italic text-[12px]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant mb-1">
                  <span className="capitalize">{msg.sender === 'buyer' ? 'You (Buyer)' : msg.sender === 'farmer' ? `Farmer (${deal.farmerName})` : 'System'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-snug">{msg.text}</p>
                {msg.offeredPrice && (
                  <p className="font-bold text-primary text-[12px] mt-1">Offer: ₹{msg.offeredPrice}/kg</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Buyer Offer Controls */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-title-md font-bold text-on-surface">Your Offer</h4>
            <span className="text-[13px] font-bold text-primary">Produce Cost: ₹{totalProduceCost.toLocaleString()}</span>
          </div>

          {validationError && (
            <p className="text-[12px] font-semibold text-error">{validationError}</p>
          )}

          {/* Stepper / Price Input */}
          <div className="flex items-center justify-between gap-3 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setCounterPrice(prev => Math.max(1, Number((prev - 0.5).toFixed(1))))}
              className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary text-[22px] font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center"
              aria-label="Decrease price"
            >
              -
            </button>
            <div className="text-center flex-1">
              <span className="text-headline-lg font-headline-lg font-bold text-primary">
                ₹{counterPrice.toFixed(1)}
              </span>
              <span className="text-[12px] text-on-surface-variant block">per kg</span>
            </div>
            <button
              type="button"
              onClick={() => setCounterPrice(prev => Number((prev + 0.5).toFixed(1)))}
              className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary text-[22px] font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center"
              aria-label="Increase price"
            >
              +
            </button>
          </div>

          {/* Note to farmer & Send Offer */}
          <form onSubmit={handleSendCounter} className="flex gap-2">
            <input
              type="text"
              placeholder="Add note to farmer (optional)..."
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              className="flex-1 bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-[14px] text-on-surface outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 min-h-[48px] bg-secondary text-on-secondary rounded-xl font-label-sm font-semibold hover:bg-secondary/90 transition-all shrink-0 active:scale-95"
            >
              Send Offer
            </button>
          </form>
        </div>

        {/* 5. Summary & Accept Deal Section */}
        <div className="bg-primary-fixed/20 p-4 rounded-2xl border border-primary/20 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-bold text-primary uppercase tracking-wider">
              {isAccepted ? 'Deal Agreed' : 'Proposed Agreement'}
            </span>
            <span className="text-on-surface-variant font-medium">
              {deal.quantityKg} kg @ ₹{counterPrice.toFixed(1)}/kg
            </span>
          </div>

          <div className="flex items-baseline justify-between border-t border-primary/20 pt-2">
            <span className="text-body-md font-bold text-on-surface">Total Produce Cost</span>
            <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">
              ₹{totalProduceCost.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAcceptAndProceed}
            className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1"
          >
            <span>Accept Deal (₹{counterPrice.toFixed(1)}/kg) & Continue to Transport</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
