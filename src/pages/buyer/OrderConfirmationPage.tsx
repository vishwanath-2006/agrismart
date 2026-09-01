import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';

export const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProduce, selectedTransporter, createOrder, produceListings, transporters, currentNegotiation, buyerProfile, mandiPrices, isProfileComplete } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'escrow' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const produce = selectedProduce || produceListings[0];
  const transporter = selectedTransporter || transporters[0];

  // Preserved negotiated agreed price from Step 7 (never reverts to original asking price)
  const producePrice =
    currentNegotiation && currentNegotiation.currentOfferPricePerKg
      ? currentNegotiation.currentOfferPricePerKg
      : produce ? produce.pricePerKg : 30;

  const quantityKg = produce ? produce.quantityKg : (currentNegotiation?.quantityKg || 500);
  const produceSubtotal = Math.round(quantityKg * producePrice);
  const transportCost = transporter ? transporter.totalCost : 1450;
  const escrowFee = 250;
  const totalAmount = produceSubtotal + transportCost + escrowFee;

  // Secondary Government reference lookup (information only)
  const govtRefMandi = useMemo(() => {
    if (!produce || !mandiPrices || mandiPrices.length === 0) return null;
    const cropKey = produce.cropName.toLowerCase().split(' ')[0];
    return mandiPrices.find(m => m.cropName.toLowerCase().includes(cropKey)) || null;
  }, [produce, mandiPrices]);

  const govtModalPrice = govtRefMandi ? govtRefMandi.modalPrice : null;

  const handlePayAndPlaceOrder = () => {
    if (!isProfileComplete('buyer')) {
      setErrorMessage('Please complete your Buyer Profile & Delivery Address before placing an order.');
      return;
    }

    if (!produce) {
      setErrorMessage('Please select a produce item from the marketplace.');
      return;
    }
    if (!transporter) {
      setErrorMessage('Please select a transporter for this order.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        createOrder(produce, transporter, producePrice);
        setIsProcessing(false);
        navigate('/buyer/live-tracking');
      } catch (err: any) {
        console.error('Order creation notice:', err);
        setIsProcessing(false);
        setErrorMessage('Unable to place order. Please try again.');
      }
    }, 500);
  };

  return (
    <AppLayout title="Confirm Order" showBack onBack={() => navigate('/buyer/transporter-matching')}>
      <div className="flex flex-col w-full gap-4 pb-12">
        
        {/* Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Confirm Order</h2>
          <p className="text-[13px] text-on-surface-variant">Review your order before payment</p>
        </div>

        {/* Onboarding Incomplete Warning Banner */}
        {!isProfileComplete('buyer') && (
          <div className="p-4 bg-tertiary-fixed/20 border border-tertiary/30 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary text-[22px]">warning</span>
              <div>
                <p className="text-[13px] font-bold text-on-surface">Buyer Profile Incomplete</p>
                <p className="text-[12px] text-on-surface-variant">Complete your business identity & delivery address to place orders.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/buyer/profile')}
              className="px-3.5 py-1.5 bg-tertiary text-on-tertiary text-[12px] font-bold rounded-xl hover:bg-tertiary/90 transition-all shrink-0"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-error-container/40 border border-error/30 text-on-error-container rounded-xl flex items-center gap-2 text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[20px] text-error">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress Stepper */}
        <div className="flex items-center justify-between text-[12px] font-bold text-on-surface-variant px-1">
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">✓</span>
            Produce Deal
          </span>
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">✓</span>
            Logistics Match
          </span>
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">3</span>
            Checkout
          </span>
        </div>

        {/* 1. Order Summary Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3.5">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Order Summary</h3>

          {/* Produce Item Line */}
          <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl">
            <img
              src={produce?.imageUrl}
              alt={produce?.cropName || 'Produce'}
              className="w-13 h-13 rounded-lg object-cover shrink-0 border border-outline-variant/20"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-label-sm font-bold text-on-surface truncate">{produce?.cropName || 'Fresh Produce'}</h4>
              <p className="text-[12px] text-on-surface-variant">
                Farmer: {produce?.farmerName || 'Local Farmer'} • {produce?.farmerLocation || 'Mysore'}
              </p>
              <p className="text-[12px] text-primary font-bold mt-0.5">
                {quantityKg} kg @ ₹{producePrice.toFixed(2)}/kg (Agreed price)
              </p>
            </div>
            <span className="font-title-md text-body-md font-bold text-on-surface">
              ₹{produceSubtotal.toLocaleString()}
            </span>
          </div>

          {/* Transporter Line */}
          <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl">
            <img
              src={transporter?.avatarUrl}
              alt={transporter?.name || 'Transporter'}
              className="w-13 h-13 rounded-lg object-cover shrink-0 border border-outline-variant/20"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-label-sm font-bold text-on-surface truncate">{transporter?.name || 'Assigned Fleet'}</h4>
              <p className="text-[12px] text-on-surface-variant">
                {transporter?.vehicleType || 'Reefer Truck'} • 145 km
              </p>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                Delivery: {buyerProfile?.receivingAddress || buyerProfile?.businessLocation || 'Bangalore Central Warehouse'}
              </p>
            </div>
            <div className="text-right">
              <span className="font-title-md text-body-md font-bold text-on-surface">
                ₹{transportCost.toLocaleString()}
              </span>
              <span className="text-[10px] text-on-surface-variant block">Calculated estimate</span>
            </div>
          </div>

          {/* Secondary Govt Reference Pill */}
          {govtModalPrice && (
            <div className="flex items-center justify-between text-[11px] px-1 text-on-surface-variant">
              <span className="flex items-center gap-1 font-medium text-[#0f5238]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                Govt reference: ₹{govtModalPrice}/kg
              </span>
              <span className="text-[10px] text-on-surface-variant/80">Source: data.gov.in (Reference only)</span>
            </div>
          )}

          {/* Fee & Totals Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-outline-variant/20 text-[13px] text-on-surface-variant">
            <div className="flex justify-between">
              <span>Produce Subtotal ({quantityKg} kg @ ₹{producePrice.toFixed(2)}/kg)</span>
              <span className="font-semibold text-on-surface">₹{produceSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport ({transporter?.name || 'Logistics'})</span>
              <span className="font-semibold text-on-surface">₹{transportCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>AgriEscrow Protection Fee</span>
              <span className="font-semibold text-on-surface">₹{escrowFee}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-title-md font-bold text-primary">
              <span>Total Payable</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 2. Escrow Protection Banner */}
        <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-2xl shadow-card flex items-start gap-3">
          <span className="material-symbols-outlined text-tertiary-fixed text-[24px] shrink-0 mt-0.5">verified_user</span>
          <div>
            <h4 className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary-fixed">
              AgriEscrow Protection (Simulated Escrow • Prototype Flow)
            </h4>
            <p className="text-[13px] leading-snug opacity-90 mt-0.5">
              Demonstration workflow: Payment authorization is held in simulated escrow and released upon delivery inspection signoff.
            </p>
          </div>
        </div>

        {/* 3. Payment Method Selector */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Payment Method (Prototype Selector)</h3>

          <div className="space-y-2">
            {[
              { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', icon: 'account_balance_wallet', desc: 'Instant escrow authorization simulation' },
              { id: 'escrow', label: 'AgriSmart Direct Bank Escrow', icon: 'account_balance', desc: 'Secure wholesale trade settlement simulation' },
              { id: 'netbanking', label: 'Net Banking / RTGS', icon: 'payments', desc: 'For invoice amounts above ₹50,000 simulation' }
            ].map(method => (
              <label
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? 'border-primary bg-primary-fixed/20 shadow-sm'
                    : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-primary text-[22px]">{method.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-label-sm font-bold text-on-surface">{method.label}</p>
                  <p className="text-[11px] text-on-surface-variant">{method.desc}</p>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id as any)}
                  className="accent-primary w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* 4. Checkout CTA Button */}
        <div className="pt-2">
          <button
            onClick={handlePayAndPlaceOrder}
            disabled={isProcessing}
            className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Placing order...</span>
              </>
            ) : (
              <>
                <span>Authorize Simulated Escrow (₹{totalAmount.toLocaleString()})</span>
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
