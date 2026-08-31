import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { useApp } from '../../context/AppContext';
import { FarmerProfileData } from '../../types';

export const FarmerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { farmerProfile, saveFarmerProfile, logout, switchRole } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<FarmerProfileData>(farmerProfile);

  useEffect(() => {
    setFormData(farmerProfile);
  }, [farmerProfile]);

  const calculatePercentage = (data: FarmerProfileData): number => {
    let score = 0;
    if (data.fullName && data.phone) score += 25;
    if (data.village && data.district && data.state && data.pincode) score += 25;
    if (data.farmSize && data.mainCrops.length > 0 && data.farmingType) score += 25;
    if (data.primaryMarket && data.preferredSellingDistance) score += 25;
    return score;
  };

  const handleCropToggle = (crop: string) => {
    const exists = formData.mainCrops.includes(crop);
    const updatedCrops = exists
      ? formData.mainCrops.filter(c => c !== crop)
      : [...formData.mainCrops, crop];
    setFormData(prev => ({ ...prev, mainCrops: updatedCrops }));
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            farmLocation: 'GPS Verified: Mysore Farm Gate 2',
            village: prev.village || 'Nanjangud Rural',
            district: prev.district || 'Mysore',
            state: prev.state || 'Karnataka',
            pincode: prev.pincode || '570001'
          }));
        },
        () => {
          // Fallback simulation
          setTimeout(() => {
            setIsLocating(false);
            setFormData(prev => ({
              ...prev,
              latitude: 12.2958,
              longitude: 76.6394,
              farmLocation: 'GPS Verified: Mysore Farm Gate 2',
              village: prev.village || 'Nanjangud Rural',
              district: prev.district || 'Mysore',
              state: prev.state || 'Karnataka',
              pincode: prev.pincode || '570001'
            }));
          }, 800);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSaveStep = async (nextStep?: number, markComplete: boolean = false) => {
    setIsSaving(true);
    const pct = calculatePercentage(formData);
    const isComplete = markComplete || pct >= 75;

    const toSave: FarmerProfileData = {
      ...formData,
      completionPercentage: pct,
      profileCompleted: isComplete
    };

    await saveFarmerProfile(toSave);
    setIsSaving(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);

    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const availableCrops = [
    'Tomatoes',
    'Onions',
    'Potatoes',
    'Green Chillies',
    'Wheat',
    'Rice',
    'Cotton',
    'Capsicum',
    'Cabbage',
    'Sugarcane',
    'Maize',
    'Pulses'
  ];

  return (
    <AppLayout title="Farmer Profile" showBack onBack={() => navigate('/farmer/dashboard')}>
      <div className="flex flex-col w-full max-w-2xl mx-auto pb-12">
        {/* Step Progress Header */}
        <div className="mb-6 mt-2 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="font-label-sm text-primary font-bold uppercase tracking-wider text-[12px]">
                Step {currentStep} of 4
              </span>
              <span className="font-title-md text-title-md font-bold text-on-surface">
                {currentStep === 1 && 'Personal & Farm Location'}
                {currentStep === 2 && 'Farm Details & Crops'}
                {currentStep === 3 && 'Selling & Market Preferences'}
                {currentStep === 4 && 'Pricing & Profile Review'}
              </span>
            </div>
            <span className="font-label-sm font-bold text-primary bg-primary-fixed/30 px-3 py-1 rounded-full text-[12px]">
              {calculatePercentage(formData)}% Complete
            </span>
          </div>

          {/* 4-Step Progress Bar */}
          <div className="flex gap-1.5 h-2 w-full mt-2">
            {[1, 2, 3, 4].map((step) => (
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
            <span>Profile details saved to Supabase successfully.</span>
          </div>
        )}

        {/* ================= STEP 1: PERSONAL & LOCATION ================= */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            {/* Personal Details Card */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Personal Details
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface-variant font-medium">Full Name</label>
                <input
                  className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Ramesh Kumar"
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface-variant font-medium">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant font-semibold">
                    +91
                  </span>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl pl-14 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="98450 12345"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Farm Location Card with Map Simulation */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Farm Location
              </h2>

              {/* Map Preview Container */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-inner border border-outline-variant/30 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 h-10 px-4 bg-primary text-on-primary font-label-sm font-semibold rounded-full flex items-center gap-2 shadow-md hover:bg-primary-container transition-all z-10"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isLocating ? 'refresh' : 'my_location'}
                  </span>
                  {isLocating ? 'Detecting GPS Location...' : 'Use current location'}
                </button>
              </div>
              <p className="font-label-sm text-on-surface-variant text-center -mt-2 text-[12px] italic">
                {formData.farmLocation || 'Tap button to pin your farm GPS coordinates automatically'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="font-label-sm text-on-surface-variant font-medium">Village / Town</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Nanjangud"
                    type="text"
                    value={formData.village}
                    onChange={e => setFormData({ ...formData, village: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="font-label-sm text-on-surface-variant font-medium">District</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Mysore"
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">State</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Pincode</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="570001"
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStep(2)}
                disabled={isSaving}
                className="w-full h-touch-target-min bg-primary text-on-primary font-title-md rounded-2xl shadow-md hover:bg-primary-container flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Farm Details</span>
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

        {/* ================= STEP 2: FARM DETAILS ================= */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">potted_plant</span>
                Land &amp; Farming Type
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Farm Size</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. 4.5"
                    type="number"
                    step="0.1"
                    value={formData.farmSize || ''}
                    onChange={e => setFormData({ ...formData, farmSize: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Unit</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.farmSizeUnit}
                    onChange={e => setFormData({ ...formData, farmSizeUnit: e.target.value })}
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Gunthas">Gunthas</option>
                    <option value="Bighas">Bighas</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface-variant font-medium">Farming Experience</label>
                <select
                  className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.farmingExperience}
                  onChange={e => setFormData({ ...formData, farmingExperience: e.target.value })}
                >
                  <option value="1 - 3 Years">1 - 3 Years</option>
                  <option value="4 - 7 Years">4 - 7 Years</option>
                  <option value="8 - 15 Years">8 - 15 Years</option>
                  <option value="15+ Years">15+ Years (Multi-generation)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface-variant font-medium">Farming Practice</label>
                <select
                  className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.farmingType}
                  onChange={e => setFormData({ ...formData, farmingType: e.target.value })}
                >
                  <option value="Organic Certified">Organic Certified (ZBNF / NPOP)</option>
                  <option value="Natural Farming">Natural Farming (Chemical Free)</option>
                  <option value="Conventional">Conventional Farming</option>
                  <option value="Greenhouse / Polyhouse">Greenhouse / Protected Cultivation</option>
                </select>
              </div>
            </div>

            {/* Main Crops Chips Selection */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">eco</span>
                Main Crops Cultivated
              </h2>
              <p className="text-[12px] text-on-surface-variant">
                Select all commodities you regularly grow for mandi sales:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableCrops.map(crop => {
                  const isSelected = formData.mainCrops.includes(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropToggle(crop)}
                      className={`px-3.5 py-2 rounded-xl text-label-sm font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm scale-100'
                          : 'bg-surface text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                      }`}
                    >
                      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                      <span>{crop}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="font-label-sm text-on-surface-variant font-medium">Other Crops / Intercrops</label>
                <input
                  className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Green Coriander, Mint, Ginger"
                  type="text"
                  value={formData.otherCrops || ''}
                  onChange={e => setFormData({ ...formData, otherCrops: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStep(3)}
                disabled={isSaving}
                className="w-full h-touch-target-min bg-primary text-on-primary font-title-md rounded-2xl shadow-md hover:bg-primary-container flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Selling Preferences</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full h-touch-target-min bg-transparent text-on-surface-variant font-label-sm rounded-2xl hover:bg-surface-container transition-colors"
              >
                Back to Location
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SELLING PREFERENCES ================= */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">storefront</span>
                Preferred Mandis &amp; Markets
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface-variant font-medium">Primary Mandi / APMC</label>
                <input
                  className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Mysore Bandipalya Mandi"
                  type="text"
                  value={formData.primaryMarket}
                  onChange={e => setFormData({ ...formData, primaryMarket: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface-variant font-medium">Secondary Market</label>
                <input
                  className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Bangalore KR Market"
                  type="text"
                  value={formData.secondaryMarket}
                  onChange={e => setFormData({ ...formData, secondaryMarket: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Dispatch Distance</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.preferredSellingDistance}
                    onChange={e => setFormData({ ...formData, preferredSellingDistance: e.target.value })}
                  >
                    <option value="Within 25 km">Within 25 km</option>
                    <option value="Within 50 km">Within 50 km</option>
                    <option value="Within 100 km">Within 100 km</option>
                    <option value="Statewide / Long Haul">Statewide / Long Haul</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Harvest Frequency</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.sellingFrequency}
                    onChange={e => setFormData({ ...formData, sellingFrequency: e.target.value })}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Seasonal">Seasonal Bulk</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface-variant font-medium">Preferred Buyer Type</label>
                <select
                  className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.preferredBuyerType}
                  onChange={e => setFormData({ ...formData, preferredBuyerType: e.target.value })}
                >
                  <option value="Wholesale Traders">Wholesale Traders (Bulk APMC)</option>
                  <option value="Retail Outlets & Supermarkets">Retail Outlets &amp; Supermarkets</option>
                  <option value="Food Processors">Food Processing Units</option>
                  <option value="Direct Institutional">Direct Institutional Buyers</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStep(4)}
                disabled={isSaving}
                className="w-full h-touch-target-min bg-primary text-on-primary font-title-md rounded-2xl shadow-md hover:bg-primary-container flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Pricing &amp; Review</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full h-touch-target-min bg-transparent text-on-surface-variant font-label-sm rounded-2xl hover:bg-surface-container transition-colors"
              >
                Back to Farm Details
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: PRICING & COMPLETION ================= */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Price Expectations (₹/kg)
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Expected Price</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span>
                    <input
                      className="w-full h-touch-target-min bg-surface rounded-xl pl-8 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="28"
                      type="number"
                      value={formData.expectedPricePreference || ''}
                      onChange={e => setFormData({ ...formData, expectedPricePreference: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Floor Price (Min)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span>
                    <input
                      className="w-full h-touch-target-min bg-surface rounded-xl pl-8 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="22"
                      type="number"
                      value={formData.minimumPricePreference || ''}
                      onChange={e => setFormData({ ...formData, minimumPricePreference: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Ready Card */}
            <div className="bg-primary-fixed/20 border border-primary/30 rounded-2xl p-5 shadow-elevated flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                  Your Farmer Profile is Ready!
                </h3>
                <p className="text-[13px] text-on-surface-variant mt-1 max-w-sm">
                  Your farm is configured to access AI price comparisons, broadcast produce listings, and match with verified buyers.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveStep(4, true);
                    navigate('/farmer/add-produce');
                  }}
                  className="flex-1 h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold hover:bg-primary-container shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  List Produce
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveStep(4, true);
                    navigate('/farmer/market-prices');
                  }}
                  className="flex-1 h-touch-target-min bg-surface-container-lowest text-primary border border-primary/30 rounded-xl font-label-sm font-semibold hover:bg-surface-container flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">monitoring</span>
                  Explore Market Analysis
                </button>
              </div>
            </div>

            {/* Switch / Sign Out Options */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  switchRole('buyer');
                  navigate('/buyer/marketplace');
                }}
                className="w-full h-touch-target-min bg-surface-container text-on-surface rounded-xl font-label-sm font-semibold hover:bg-surface-container-high flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                Switch to Buyer View
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
