import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { useApp } from '../../context/AppContext';
import { BuyerProfileData } from '../../types';

export const BuyerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { buyerProfile, saveBuyerProfile, logout, switchRole } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Form State
  const [formData, setFormData] = useState<BuyerProfileData>(buyerProfile);

  useEffect(() => {
    setFormData(buyerProfile);
  }, [buyerProfile]);

  const calculatePercentage = (data: BuyerProfileData): number => {
    let score = 0;
    if (data.fullName && data.phone && data.businessName) score += 33;
    if (data.city && data.district && data.state && data.pincode) score += 33;
    if (data.preferredVegetables.length > 0 && data.buyingFrequency && data.preferredQuality) score += 34;
    return score;
  };

  const handleCommodityToggle = (item: string) => {
    const exists = formData.preferredVegetables.includes(item);
    const updated = exists
      ? formData.preferredVegetables.filter(c => c !== item)
      : [...formData.preferredVegetables, item];
    setFormData(prev => ({ ...prev, preferredVegetables: updated }));
  };

  const handleSaveStep = async (nextStep?: number, markComplete: boolean = false) => {
    setIsSaving(true);
    const pct = calculatePercentage(formData);
    const isComplete = markComplete || pct >= 75;

    const toSave: BuyerProfileData = {
      ...formData,
      completionPercentage: pct,
      profileCompleted: isComplete
    };

    await saveBuyerProfile(toSave);
    setIsSaving(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);

    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const availableVegetables = [
    'Tomatoes',
    'Potatoes',
    'Onions',
    'Green Chillies',
    'Capsicum',
    'Ginger',
    'Garlic',
    'Cabbage',
    'Cauliflower',
    'Carrots',
    'Beans',
    'Cucumber'
  ];

  return (
    <AppLayout title="Buyer Profile" showBack onBack={() => navigate('/buyer/marketplace')}>
      <div className="flex flex-col w-full max-w-2xl mx-auto pb-12">
        {/* Step Progress Header */}
        <div className="mb-6 mt-2 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-card">
          <div className="flex items-between justify-between mb-2">
            <div className="flex flex-col">
              <span className="font-label-sm text-primary font-bold uppercase tracking-wider text-[12px]">
                Step {currentStep} of 3
              </span>
              <span className="font-title-md text-title-md font-bold text-on-surface">
                {currentStep === 1 && 'Business & Contact Details'}
                {currentStep === 2 && 'Warehouse & Receiving Location'}
                {currentStep === 3 && 'Procurement Preferences & Review'}
              </span>
            </div>
            <span className="font-label-sm font-bold text-primary bg-primary-fixed/30 px-3 py-1 rounded-full text-[12px]">
              {calculatePercentage(formData)}% Complete
            </span>
          </div>

          {/* 3-Step Progress Bar */}
          <div className="flex gap-1.5 h-2 w-full mt-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`h-full rounded-full flex-1 cursor-pointer transition-all ${
                  currentStep >= step ? 'bg-primary' : 'bg-surface-variant'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Save Notice Toast */}
        {saveSuccessNotice && (
          <div className="mb-4 p-3 bg-primary-fixed/30 text-primary rounded-xl border border-primary/20 text-[13px] flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Buyer profile saved to Supabase successfully.</span>
          </div>
        )}

        {/* ================= STEP 1: BUSINESS & CONTACT ================= */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">storefront</span>
                Business Identification
              </h2>

              <div className="flex flex-col gap-1.5 relative">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="name">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">person</span>
                  <input
                    className="w-full bg-surface rounded-xl h-touch-target-min pl-11 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    id="name"
                    placeholder="e.g. Priya Sharma"
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="businessName">Business / Company Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">business</span>
                  <input
                    className="w-full bg-surface rounded-xl h-touch-target-min pl-11 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    id="businessName"
                    placeholder="e.g. XYZ Agri Trades Ltd."
                    type="text"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">call</span>
                  <input
                    className="w-full bg-surface rounded-xl h-touch-target-min pl-11 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    id="phone"
                    placeholder="e.g. 98765 43210"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">mail</span>
                  <input
                    className="w-full bg-surface rounded-xl h-touch-target-min pl-11 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    id="email"
                    placeholder="procurement@xyztraders.com"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="businessType">Business Type</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">category</span>
                  <select
                    className="w-full bg-surface rounded-xl h-touch-target-min pl-11 pr-10 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                    id="businessType"
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Retailer">Retailer / Supermarket</option>
                    <option value="Restaurant / HoReCa">Restaurant &amp; Hotel (HoReCa)</option>
                    <option value="Distributor">Distributor / Cold Chain</option>
                    <option value="Food Processor">Food Processing Unit</option>
                    <option value="Other">Other Institutional Buyer</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStep(2)}
                disabled={isSaving}
                className="w-full h-touch-target-min bg-primary text-on-primary font-title-md rounded-2xl shadow-md hover:bg-primary-container flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Receiving Location</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveStep()}
                className="w-full h-touch-target-min bg-transparent text-primary font-label-sm font-semibold rounded-2xl hover:bg-primary/5 transition-colors"
              >
                Save &amp; Continue Later
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: LOCATION & RECEIVING ================= */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">warehouse</span>
                Depot &amp; Warehouse Location
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium">Receiving Warehouse Address</label>
                <textarea
                  rows={2}
                  className="w-full bg-surface rounded-xl p-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Depot 4B, APMC Yard, Yeshwantpur"
                  value={formData.receivingAddress}
                  onChange={e => setFormData({ ...formData, receivingAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">City</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Bangalore"
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">District</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Bengaluru Urban"
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">State</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Pincode</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="560002"
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium">Preferred Delivery Window</label>
                <select
                  className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.preferredDeliveryWindow}
                  onChange={e => setFormData({ ...formData, preferredDeliveryWindow: e.target.value })}
                >
                  <option value="Early Morning (5 AM - 9 AM)">Early Morning (5 AM - 9 AM)</option>
                  <option value="Morning (9 AM - 1 PM)">Morning (9 AM - 1 PM)</option>
                  <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                  <option value="Night Unloading (8 PM - 12 AM)">Night Unloading (8 PM - 12 AM)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStep(3)}
                disabled={isSaving}
                className="w-full h-touch-target-min bg-primary text-on-primary font-title-md rounded-2xl shadow-md hover:bg-primary-container flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Procurement Preferences</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full h-touch-target-min bg-transparent text-on-surface-variant font-label-sm rounded-2xl hover:bg-surface-container transition-colors"
              >
                Back to Business Details
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: BUYING PREFERENCES & COMPLETION ================= */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shopping_basket</span>
                Preferred Commodities &amp; Volumes
              </h2>
              <p className="text-[12px] text-on-surface-variant">
                Select the commodities you procure regularly:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableVegetables.map(veg => {
                  const isSelected = formData.preferredVegetables.includes(veg);
                  return (
                    <button
                      key={veg}
                      type="button"
                      onClick={() => handleCommodityToggle(veg)}
                      className={`px-3.5 py-2 rounded-xl text-label-sm font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm scale-100'
                          : 'bg-surface text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                      }`}
                    >
                      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                      <span>{veg}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Typical Purchase Vol</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. 5 Tons"
                    type="text"
                    value={formData.typicalPurchaseQuantity}
                    onChange={e => setFormData({ ...formData, typicalPurchaseQuantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Min Order Quantity</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. 500 kg"
                    type="text"
                    value={formData.minimumOrderQuantity}
                    onChange={e => setFormData({ ...formData, minimumOrderQuantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Buying Frequency</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.buyingFrequency}
                    onChange={e => setFormData({ ...formData, buyingFrequency: e.target.value })}
                  >
                    <option value="Daily">Daily</option>
                    <option value="2-3 times a week">2-3 times a week</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Quality Grade</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.preferredQuality}
                    onChange={e => setFormData({ ...formData, preferredQuality: e.target.value })}
                  >
                    <option value="Grade A & Premium">Grade A &amp; Premium</option>
                    <option value="Organic Certified">Organic Certified</option>
                    <option value="Standard Commercial">Standard Commercial</option>
                    <option value="All Grades">All Grades Accepted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Ready Card */}
            <div className="bg-secondary-fixed/20 border border-secondary/30 rounded-2xl p-5 shadow-elevated flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
              </div>
              <div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                  Your Buyer Profile is Ready!
                </h3>
                <p className="text-[13px] text-on-surface-variant mt-1 max-w-sm">
                  You can now inspect verified farmer produce, initiate multi-round price negotiations, and fund secure escrow checkouts.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveStep(3, true);
                    navigate('/buyer/marketplace');
                  }}
                  className="flex-1 h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold hover:bg-primary-container shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  Start Buying
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveStep(3, true);
                    navigate('/farmer/market-prices');
                  }}
                  className="flex-1 h-touch-target-min bg-surface-container-lowest text-primary border border-primary/30 rounded-xl font-label-sm font-semibold hover:bg-surface-container flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">monitoring</span>
                  Explore Live Mandis
                </button>
              </div>
            </div>

            {/* Switch / Sign Out Options */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  switchRole('farmer');
                  navigate('/farmer/dashboard');
                }}
                className="w-full h-touch-target-min bg-surface-container text-on-surface rounded-xl font-label-sm font-semibold hover:bg-surface-container-high flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">agriculture</span>
                Switch to Farmer View
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="w-full h-touch-target-min bg-error-container/20 text-error rounded-xl font-label-sm font-semibold hover:bg-error-container/30 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
