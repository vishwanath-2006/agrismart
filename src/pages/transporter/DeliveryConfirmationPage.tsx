import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';

export const DeliveryConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrder, orders, completeDelivery, currentRole } = useApp();
  const order = activeOrder || orders[0];

  const [otp, setOtp] = useState('8492');
  const [weighedKg, setWeighedKg] = useState('502');
  const [qualityChecked, setQualityChecked] = useState(true);
  const [signedBy, setSignedBy] = useState('Sarah Jenkins (XYZ Traders)');
  const [isCompleted, setIsCompleted] = useState(order.status === 'COMPLETED');

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    completeDelivery(order.id, {
      otp,
      weighedKg: Number(weighedKg) || 500,
      qualityChecked,
      gradeConfirmed: 'Grade A Export Quality',
      signedBy
    });
    setIsCompleted(true);
  };

  return (
    <AppLayout
      title="Delivery Confirmation"
      showBack
      onBack={() => {
        if (currentRole === 'transporter') navigate('/transporter/live-tracking');
        else navigate('/buyer/marketplace');
      }}
    >
      <div className="flex flex-col w-full gap-4 pb-8">
        {/* Success Modal / State */}
        {isCompleted ? (
          <div className="bg-surface-container-lowest p-6 rounded-3xl border-2 border-tertiary shadow-elevated text-center flex flex-col items-center gap-4 mt-2 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-lg shadow-tertiary/30">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>

            <div>
              <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">
                Delivery Completed & Escrow Released!
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                Order #{order.orderNumber} has been verified and settled.
              </p>
            </div>

            {/* Payout distribution summary */}
            <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-left space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Farmer Payout (Ramesh Kumar)</span>
                <span className="font-bold text-primary">₹{order.produceSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Logistics Payout (Marcus Vance)</span>
                <span className="font-bold text-primary">₹{order.transportCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-[14px]">
                <span className="font-bold text-on-surface">Total Escrow Disbursed</span>
                <span className="font-bold text-tertiary">
                  ₹{(order.produceSubtotal + order.transportCost).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                onClick={() => {
                  if (currentRole === 'transporter') navigate('/transporter/dashboard');
                  else if (currentRole === 'buyer') navigate('/buyer/marketplace');
                  else navigate('/farmer/dashboard');
                }}
                className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all"
              >
                Return to Dashboard
              </button>

              <button
                onClick={() => alert(`Invoice & Weighbridge Certificate downloaded for Order #${order.orderNumber}`)}
                className="w-full h-touch-target-min bg-surface-container-high hover:bg-surface-container text-on-surface rounded-2xl font-label-sm font-semibold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download Mandi Weighment Slip
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmDelivery} className="flex flex-col gap-4 mt-1">
            {/* Cargo Order Info */}
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
                  {order.cropName}
                </h3>
                <p className="text-[12px] text-on-surface-variant">Expected: {order.quantityKg} kg • {order.buyer.warehouseAddress}</p>
              </div>
            </div>

            {/* Inspection & OTP Checklist */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-4">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Receiver Verification</h3>

              {/* OTP Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-medium text-on-surface">Delivery Verification OTP</label>
                <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                  <span className="material-symbols-outlined text-primary text-[20px]">pin</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-bold text-title-md tracking-widest text-primary"
                    required
                  />
                  <span className="text-[11px] font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-1 rounded-lg">
                    Matched
                  </span>
                </div>
              </div>

              {/* Weighbridge Measured Weight */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-medium text-on-surface">Measured Weighbridge Weight (kg)</label>
                <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                  <span className="material-symbols-outlined text-secondary text-[20px]">scale</span>
                  <input
                    type="number"
                    value={weighedKg}
                    onChange={e => setWeighedKg(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-bold text-title-md text-on-surface"
                    required
                  />
                  <span className="text-[12px] text-on-surface-variant font-medium">kg (+2kg tolerance)</span>
                </div>
              </div>

              {/* Quality Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qualityChecked}
                  onChange={e => setQualityChecked(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary mt-0.5 shrink-0"
                />
                <div className="text-[13px]">
                  <span className="font-bold text-on-surface block">Quality & Grade A Sign-off</span>
                  <span className="text-on-surface-variant text-[12px]">
                    Buyer verified firmness, TSS sugar content, and absence of transport damage.
                  </span>
                </div>
              </label>

              {/* Digital Receiver Signature */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-medium text-on-surface">Receiver Name / Signature</label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={e => setSignedBy(e.target.value)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Escrow Payout Breakdown */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-2.5">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Automatic Escrow Release</h3>
              
              <div className="space-y-1.5 text-[13px] text-on-surface-variant">
                <div className="flex justify-between">
                  <span>To Farmer (Ramesh Kumar)</span>
                  <span className="font-semibold text-on-surface">₹{order.produceSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>To Transporter (Marcus Vance)</span>
                  <span className="font-semibold text-on-surface">₹{order.transportCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-outline-variant/20 text-title-md font-bold text-primary">
                  <span>Disbursed from Escrow</span>
                  <span>₹{(order.produceSubtotal + order.transportCost).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm Delivery & Release Payment</span>
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
};
