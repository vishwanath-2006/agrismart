import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';

export const PriceNegotiationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentNegotiation, sendCounterOffer, acceptDeal, setSelectedProduce, produceListings } = useApp();

  const deal = currentNegotiation || {
    id: 'deal_neg_101',
    produceId: 'prod_tomato_1',
    cropName: 'Tomato (Hybrid)',
    produceImage: produceListings[0]?.imageUrl,
    farmerName: 'Ramesh Kumar',
    quantityKg: 500,
    originalPricePerKg: 30.0,
    currentOfferPricePerKg: 28.5,
    lastOfferedBy: 'buyer' as const,
    aiFairPriceMin: 27.5,
    aiFairPriceMax: 29.5,
    status: 'PENDING' as const,
    messages: [
      { sender: 'farmer' as const, text: 'Listed 500kg of freshly harvested Grade A Hybrid Tomato at ₹30/kg.', timestamp: '08:30 AM', offeredPrice: 30.0 },
      { sender: 'buyer' as const, text: 'Proposing ₹28.50/kg for immediate bulk dispatch.', timestamp: '09:15 AM', offeredPrice: 28.5 }
    ]
  };

  const [counterPrice, setCounterPrice] = useState<number>(deal.currentOfferPricePerKg || 28.5);
  const [customMsg, setCustomMsg] = useState('');
  const [isAccepted, setIsAccepted] = useState(deal.status === 'ACCEPTED');

  const totalCalculated = (deal.quantityKg * counterPrice).toLocaleString();

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    sendCounterOffer(
      deal.id,
      counterPrice,
      customMsg || `Proposing revised price of ₹${counterPrice.toFixed(1)}/kg for ${deal.quantityKg}kg.`
    );
    setCustomMsg('');
  };

  const handleAcceptAndProceed = () => {
    setIsAccepted(true);
    acceptDeal(deal.id);
    const relatedProduce = produceListings.find(p => p.id === deal.produceId) || produceListings[0];
    setSelectedProduce(relatedProduce);

    setTimeout(() => {
      navigate('/buyer/transporter-matching');
    }, 400);
  };

  return (
    <AppLayout title="Price Negotiation" showBack onBack={() => navigate('/buyer/marketplace')}>
      <div className="flex flex-col w-full gap-4 pb-6">
        {/* Deal Context Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3.5 mt-1">
          <img
            src={deal.produceImage}
            alt={deal.cropName}
            className="w-16 h-16 rounded-xl object-cover border border-outline-variant/20 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/30 px-2 py-0.5 rounded-full">
                Active Deal
              </span>
              <span className="text-[12px] text-on-surface-variant font-medium">Qty: {deal.quantityKg} kg</span>
            </div>
            <h2 className="font-title-md text-title-md font-bold text-on-surface truncate mt-0.5">
              {deal.cropName}
            </h2>
            <p className="text-[13px] text-on-surface-variant">Seller: {deal.farmerName}</p>
          </div>
        </div>

        {/* AI Fair Value Guidance Meter */}
        <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-2xl shadow-card relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">auto_awesome</span>
            <h3 className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary-fixed">
              AI Fair-Value Equilibrium
            </h3>
          </div>
          <p className="text-body-md font-body-md opacity-90 leading-snug">
            Equilibrium range is <span className="font-bold">₹{deal.aiFairPriceMin} – ₹{deal.aiFairPriceMax}/kg</span> based on Mandi supply rates. Offers in this zone have an 88% acceptance rate.
          </p>
          <div className="mt-3 flex items-center justify-between bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-[12px]">
            <span>Listed: ₹{deal.originalPricePerKg}/kg</span>
            <span className="font-bold text-tertiary-fixed">Active Offer: ₹{counterPrice.toFixed(1)}/kg</span>
          </div>
        </div>

        {/* Negotiation Message History */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Offer History & Discussion</h3>

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
                  <span className="capitalize">{msg.sender}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-snug">{msg.text}</p>
                {msg.offeredPrice && (
                  <p className="font-bold text-primary text-[12px] mt-1">Proposed: ₹{msg.offeredPrice}/kg</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Counter Offer Controls */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Propose Counter Rate</h3>
            <span className="text-[13px] font-bold text-primary">Total: ₹{totalCalculated}</span>
          </div>

          {/* Stepper / Range */}
          <div className="flex items-center justify-between gap-3 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setCounterPrice(prev => Math.max(20, Number((prev - 0.5).toFixed(1))))}
              className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary text-[22px] font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center"
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
            >
              +
            </button>
          </div>

          {/* Counter message input */}
          <form onSubmit={handleSendCounter} className="flex gap-2">
            <input
              type="text"
              placeholder="Add optional note to farmer..."
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              className="flex-1 bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-[14px] text-on-surface outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 bg-secondary text-on-secondary rounded-xl font-label-sm font-semibold hover:bg-secondary-container hover:text-on-secondary-container transition-all shrink-0"
            >
              Send Offer
            </button>
          </form>
        </div>

        {/* Final Deal Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleAcceptAndProceed}
            className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Accept Deal (₹{counterPrice.toFixed(1)}/kg) & Select Transporter</span>
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
