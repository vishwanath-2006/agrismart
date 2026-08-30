import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TransporterOption } from '../../types';

export const TransporterMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const { transporters, setSelectedTransporter, selectedTransporter, selectedProduce } = useApp();

  const handleChooseTransporter = (trans: TransporterOption) => {
    setSelectedTransporter(trans);
    navigate('/buyer/order-confirmation');
  };

  return (
    <AppLayout title="Transporter Matching" showBack onBack={() => navigate('/buyer/negotiation')}>
      <div className="flex flex-col w-full gap-4 pb-6">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between text-[12px] font-bold text-on-surface-variant px-1 mt-1">
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center">1</span>
            Produce Deal
          </span>
          <span className="text-primary flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center">2</span>
            Logistics Match
          </span>
          <span className="text-on-surface-variant/60 flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant text-[10px] flex items-center justify-center">3</span>
            Checkout
          </span>
        </div>

        {/* Transit Route Summary Card */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-fixed/30 px-2.5 py-0.5 rounded-full">
              Transit Route
            </span>
            <span className="text-[13px] font-bold text-on-surface">145 km • ~3.5 hrs</span>
          </div>

          <div className="space-y-2 text-[13px] pt-1">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">trip_origin</span>
              <div>
                <p className="font-semibold text-on-surface">Pickup: Mysore Farm Gate 2</p>
                <p className="text-[11px] text-on-surface-variant">Farmer: Ramesh Kumar (500kg {selectedProduce?.cropName || 'Produce'})</p>
              </div>
            </div>
            <div className="h-4 border-l-2 border-dashed border-outline-variant/50 ml-2" />
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">location_on</span>
              <div>
                <p className="font-semibold text-on-surface">Drop: KR Market Warehouse 4B</p>
                <p className="text-[11px] text-on-surface-variant">Buyer: XYZ Traders, Bangalore Central</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Logistics Match Highlight */}
        <div className="bg-primary-container text-on-primary-container p-4 rounded-2xl shadow-card relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1 text-tertiary-fixed">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <h3 className="font-label-sm text-label-sm font-bold uppercase tracking-wider">AI Optimal Fleet Match</h3>
          </div>
          <p className="text-body-md font-body-md opacity-95 leading-snug">
            <span className="font-bold">Marcus Vance</span> is ranked #1 for this route. Operating a temperature-controlled reefer truck with 4.96 ★ reliability.
          </p>
        </div>

        {/* Available Transporters List */}
        <div className="space-y-3.5 pt-1">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">Available Transporter Options</h3>

          {transporters.map(trans => {
            const isSelected = selectedTransporter?.id === trans.id;
            return (
              <div
                key={trans.id}
                className={`bg-surface-container-lowest rounded-2xl p-4 border transition-all shadow-card relative ${
                  trans.isAiBestMatch
                    ? 'border-primary/40 ring-1 ring-primary/20'
                    : 'border-outline-variant/30'
                }`}
              >
                {trans.isAiBestMatch && (
                  <div className="absolute top-3 right-3 bg-tertiary text-on-tertiary px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    Top Matched
                  </div>
                )}

                <div className="flex items-start gap-3.5 pr-14">
                  <img
                    src={trans.avatarUrl}
                    alt={trans.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-outline-variant/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-title-md text-title-md font-bold text-on-surface">{trans.name}</h4>
                    <p className="text-[13px] text-on-surface-variant">{trans.vehicleType}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] font-bold text-on-surface flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-secondary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {trans.rating}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">• {trans.tripsCount} trips</span>
                      {trans.isRefrigerated && (
                        <span className="text-[10px] font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
                          Cold Chain
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Time breakdown */}
                <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl mt-3 text-on-surface">
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-medium block">Transport Rate</span>
                    <span className="text-[13px] font-bold">₹{trans.ratePerKm}/km</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-medium block">Est. Transit</span>
                    <span className="text-[13px] font-bold">~{trans.transitTimeHrs} hrs</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-on-surface-variant font-medium block">Total Logistics</span>
                    <span className="text-title-md font-bold text-primary">₹{trans.totalCost}</span>
                  </div>
                </div>

                {/* Choose Transporter Button */}
                <button
                  onClick={() => handleChooseTransporter(trans)}
                  className="mt-3 w-full h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Select {trans.name.split(' ')[0]} & Proceed to Checkout</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};
