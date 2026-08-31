import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { stopOrderTracking } from '../../services/liveTrackingService';

export const DeliveryConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, orders, completeDelivery, currentRole } = useApp();
  const order = activeOrder || (orders.length > 0 ? orders[0] : null);

  const [otp, setOtp] = useState('8492');
  const [weighedKg, setWeighedKg] = useState(order ? String(order.quantityKg) : '500');
  const [qualityChecked, setQualityChecked] = useState(true);
  const [signedBy, setSignedBy] = useState('Sarah Jenkins (XYZ Traders)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(order?.status === 'COMPLETED');

  if (!order) {
    return (
      <AppLayout
        title="Confirm Delivery"
        showBack
        onBack={() => {
          if (currentRole === 'transporter') navigate('/transporter/dashboard');
          else navigate('/buyer/marketplace');
        }}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 gap-3 mt-6">
          <span className="material-symbols-outlined text-[44px] text-on-surface-variant/50">task_alt</span>
          <h3 className="text-title-md font-bold text-on-surface">No active delivery to confirm</h3>
          <p className="text-body-md text-on-surface-variant">There is no shipment currently pending confirmation.</p>
          <button
            onClick={() => {
              if (currentRole === 'transporter') navigate('/transporter/dashboard');
              else navigate('/buyer/marketplace');
            }}
            className="mt-2 h-touch-target-min px-6 bg-primary text-on-primary font-bold rounded-xl text-label-sm shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate 4-digit OTP
    if (!otp || otp.trim().length !== 4) {
      setErrorMessage('Please enter a valid 4-digit delivery verification OTP.');
      return;
    }

    // Check if demo OTP is matching (expected demo code is 8492)
    if (otp.trim() !== '8492' && otp.trim() !== '1234') {
      setErrorMessage('Incorrect OTP. Please check with the buyer and try again (Demo code: 8492).');
      return;
    }

    if (!qualityChecked) {
      setErrorMessage('Quality sign-off is required before confirming delivery.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        completeDelivery(order.id, {
          otp,
          weighedKg: Number(weighedKg) || order.quantityKg,
          qualityChecked,
          gradeConfirmed: 'Grade A Export Quality',
          signedBy
        });
        stopOrderTracking(order.id);
        setIsSubmitting(false);
        setIsCompleted(true);
      } catch (err: any) {
        console.error('Delivery completion error:', err);
        setIsSubmitting(false);
        setErrorMessage('Delivery confirmation failed. Please try again.');
      }
    }, 400);
  };

  return (
    <AppLayout
      title="Confirm Delivery"
      showBack
      onBack={() => {
        if (currentRole === 'transporter') navigate('/transporter/live-tracking');
        else navigate('/buyer/marketplace');
      }}
    >
      <div className="flex flex-col w-full gap-4 pb-12">
        
        {/* Header */}
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-title-md font-title-md font-bold text-on-surface">Confirm Delivery</h2>
            <span className="text-[12px] font-bold text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full">
              Order #{order.orderNumber}
            </span>
          </div>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            Complete the delivery after the buyer receives the produce
          </p>
        </div>

        {/* Success Modal / Screen */}
        {isCompleted ? (
          <div className="bg-surface-container-lowest p-6 rounded-3xl border-2 border-primary/40 shadow-elevated text-center flex flex-col items-center gap-4 mt-1 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>

            <div>
              <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">
                Delivery Completed (Simulated Settlement)
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                Order #{order.orderNumber} demo verification sign-off recorded.
              </p>
            </div>

            {/* Payout distribution summary */}
            <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-left space-y-2 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Farmer Payout ({order.farmer?.name || 'Farmer'})</span>
                <span className="font-bold text-primary">₹{order.produceSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Logistics Payout ({order.transporter?.name || 'Transporter'})</span>
                <span className="font-bold text-primary">₹{order.transportCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-[14px]">
                <span className="font-bold text-on-surface">Total Escrow Disbursed</span>
                <span className="font-bold text-primary">
                  ₹{(order.produceSubtotal + order.transportCost).toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-on-surface-variant/80 pt-1 text-right">
                Status: Prototype escrow settlement recorded (Simulated)
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                onClick={() => {
                  if (currentRole === 'transporter') navigate('/transporter/dashboard');
                  else if (currentRole === 'buyer') navigate('/buyer/marketplace');
                  else navigate('/farmer/dashboard');
                }}
                className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmDelivery} className="flex flex-col gap-4">
            
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 bg-error-container/40 border border-error/30 text-on-error-container rounded-xl flex items-center gap-2 text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[20px] text-error">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Cargo Order Info Card */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3.5">
              <img
                src={order.produceImage}
                alt={order.cropName}
                className="w-14 h-14 rounded-xl object-cover border border-outline-variant/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full">
                    Arrived at Drop
                  </span>
                  <span className="text-[12px] font-bold text-on-surface">Order #{order.orderNumber}</span>
                </div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface truncate mt-0.5">
                  {order.cropName} ({order.quantityKg} kg)
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  {order.farmer.location} → {order.buyer.warehouseAddress.split(',')[0]}
                </p>
              </div>
            </div>

            {/* 2. Numbered Receiver Verification Checklist */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-4">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Delivery Verification Checklist</h3>

              {/* Step 1: OTP Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label-sm font-bold text-on-surface">1. Delivery Verification OTP</label>
                  <span className="text-[11px] text-on-surface-variant font-medium">Demo OTP code: 8492</span>
                </div>
                <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                  <span className="material-symbols-outlined text-primary text-[20px]">pin</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 bg-transparent outline-none font-bold text-title-md tracking-widest text-primary"
                    required
                  />
                  {otp.trim() === '8492' && (
                    <span className="text-[11px] font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-1 rounded-lg">
                      Matched
                    </span>
                  )}
                </div>
              </div>

              {/* Step 2: Weighbridge Measured Weight */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label-sm font-bold text-on-surface">2. Measured Weighbridge Weight (kg)</label>
                  <span className="text-[11px] text-on-surface-variant">Expected: {order.quantityKg} kg</span>
                </div>
                <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                  <span className="material-symbols-outlined text-secondary text-[20px]">scale</span>
                  <input
                    type="number"
                    value={weighedKg}
                    onChange={e => setWeighedKg(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-bold text-title-md text-on-surface"
                    required
                  />
                  <span className="text-[12px] text-on-surface-variant font-medium">kg</span>
                </div>
              </div>

              {/* Step 3: Quality Checkbox */}
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface">3. Quality &amp; Produce Inspection</label>
                <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qualityChecked}
                    onChange={e => setQualityChecked(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary mt-0.5 shrink-0"
                  />
                  <div className="text-[13px]">
                    <span className="font-bold text-on-surface block">Grade A Sign-off (Demo inspection result)</span>
                    <span className="text-on-surface-variant text-[12px]">
                      Buyer verified physical condition, TSS quality, and cargo arrival integrity.
                    </span>
                  </div>
                </label>
              </div>

              {/* Step 4: Digital Receiver Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface">4. Receiver Name / Representative</label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={e => setSignedBy(e.target.value)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* 3. Escrow Settlement Summary Card */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md font-bold text-on-surface">Escrow Settlement (Simulated)</h3>
                <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">Demo settlement</span>
              </div>
              
              <div className="space-y-1.5 text-[13px] text-on-surface-variant">
                <div className="flex justify-between">
                  <span>To Farmer ({order.farmer?.name || 'Farmer'})</span>
                  <span className="font-semibold text-on-surface">₹{order.produceSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>To Transporter ({order.transporter?.name || 'Marcus Vance'})</span>
                  <span className="font-semibold text-on-surface">₹{order.transportCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-outline-variant/20 text-title-md font-bold text-primary">
                  <span>Total Escrow Release</span>
                  <span>₹{(order.produceSubtotal + order.transportCost).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-tight mt-1">
                Demo workflow: Simulated escrow settlement will record completion status without live banking gateway transactions.
              </p>
            </div>

            {/* 4. Submit Primary CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Confirmation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Delivery (Simulated Escrow Release)</span>
                    <span className="material-symbols-outlined text-[22px]">verified</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
};
