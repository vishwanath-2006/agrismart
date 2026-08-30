import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';

export const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProduce, selectedTransporter, createOrder, produceListings, transporters, currentNegotiation } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'escrow' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const produce = selectedProduce || produceListings[0];
  const transporter = selectedTransporter || transporters[0];

  // Use negotiated price if available for this produce, otherwise standard produce price
  const producePrice =
    currentNegotiation && currentNegotiation.produceId === produce.id
      ? currentNegotiation.currentOfferPricePerKg
      : produce.pricePerKg;

  const produceSubtotal = produce.quantityKg * producePrice;
  const transportCost = transporter.totalCost;
  const escrowFee = 250;
  const totalAmount = produceSubtotal + transportCost + escrowFee;

  const handlePayAndPlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder(produce, transporter, producePrice);
      setIsProcessing(false);
      navigate('/buyer/live-tracking');
    }, 600);
  };

  return (
    <AppLayout title="Order Confirmation" showBack onBack={() => navigate('/buyer/transporter-matching')}>
      <div className="flex flex-col w-full gap-4 pb-6">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between text-[12px] font-bold text-on-surface-variant px-1 mt-1">
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center">✓</span>
            Produce Deal
          </span>
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center">✓</span>
            Logistics Match
          </span>
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center">3</span>
            Checkout
          </span>
        </div>

        {/* Item Breakdown Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Order Summary</h3>

          {/* Produce Item Line */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
            <img
              src={produce.imageUrl}
              alt={produce.cropName}
              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-outline-variant/20"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-label-sm font-bold text-on-surface truncate">{produce.cropName}</h4>
              <p className="text-[12px] text-on-surface-variant">
                {produce.quantityKg} kg @ ₹{producePrice.toFixed(2)}/kg
              </p>
            </div>
            <span className="font-title-md text-body-md font-bold text-on-surface">
              ₹{produceSubtotal.toLocaleString()}
            </span>
          </div>

          {/* Transporter Line */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
            <img
              src={transporter.avatarUrl}
              alt={transporter.name}
              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-outline-variant/20"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-label-sm font-bold text-on-surface truncate">{transporter.name}</h4>
              <p className="text-[12px] text-on-surface-variant">
                {transporter.vehicleType} ({transporter.distanceKm}km)
              </p>
            </div>
            <span className="font-title-md text-body-md font-bold text-on-surface">
              ₹{transportCost.toLocaleString()}
            </span>
          </div>

          {/* Fee & Totals Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-outline-variant/20 text-[13px] text-on-surface-variant">
            <div className="flex justify-between">
              <span>Produce Subtotal</span>
              <span className="font-semibold text-on-surface">₹{produceSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport & Tolls</span>
              <span className="font-semibold text-on-surface">₹{transportCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Quality Escrow Protection</span>
              <span className="font-semibold text-on-surface">₹{escrowFee}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-title-md font-bold text-primary">
              <span>Total Payable</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Escrow Guarantee Banner */}
        <div className="bg-tertiary-container text-on-tertiary-container p-4 rounded-2xl shadow-card flex items-start gap-3">
          <span className="material-symbols-outlined text-tertiary-fixed text-[24px] shrink-0 mt-0.5">verified_user</span>
          <div>
            <h4 className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary-fixed">
              100% AgriEscrow Quality Protection
            </h4>
            <p className="text-[13px] leading-snug opacity-90 mt-0.5">
              Funds are held securely in escrow. Payment is automatically released to farmer & transporter only after physical weighbridge verification at your warehouse.
            </p>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Payment Method</h3>

          <div className="space-y-2">
            {[
              { id: 'upi', label: 'UPI / Google Pay / PhonePe', icon: 'account_balance_wallet', desc: 'Instant escrow funding' },
              { id: 'escrow', label: 'AgriSmart Direct Bank Escrow', icon: 'account_balance', desc: 'Corporate mandi settlement' },
              { id: 'netbanking', label: 'Net Banking / RTGS', icon: 'payments', desc: 'For invoice amounts above ₹50,000' }
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

        {/* Checkout CTA */}
        <div className="pt-2">
          <button
            onClick={handlePayAndPlaceOrder}
            disabled={isProcessing}
            className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Fund Escrow & Place Order (₹{totalAmount.toLocaleString()})</span>
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
