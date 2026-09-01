import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TOMATO_IMG, ONION_IMG, POTATO_IMG, WHEAT_IMG, APPLE_IMG } from '../../data/mockData';

export const AddProducePage: React.FC = () => {
  const navigate = useNavigate();
  const { addProduceListing, currentUser, mandiPrices, isProfileComplete } = useApp();

  const [cropName, setCropName] = useState('Tomato');
  const [variety, setVariety] = useState('Hybrid');
  const [category, setCategory] = useState<'Vegetables' | 'Fruits' | 'Grains' | 'Pulses'>('Vegetables');
  const [qualityGrade, setQualityGrade] = useState<'Grade A' | 'Grade B' | 'Organic Certified' | 'Premium'>('Grade A');
  const [quantityKg, setQuantityKg] = useState('500');
  const [minOrderKg, setMinOrderKg] = useState('100');
  const [pricePerKg, setPricePerKg] = useState('30');
  const [shelfLifeDays, setShelfLifeDays] = useState('8');
  const [selectedImage, setSelectedImage] = useState(TOMATO_IMG);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const presetCrops = [
    { label: 'Tomato', variety: 'Hybrid', category: 'Vegetables' as const, img: TOMATO_IMG },
    { label: 'Red Onion', variety: 'Nashik Big', category: 'Vegetables' as const, img: ONION_IMG },
    { label: 'Potato', variety: 'Jyoti', category: 'Vegetables' as const, img: POTATO_IMG },
    { label: 'Wheat', variety: 'Sharbati', category: 'Grains' as const, img: WHEAT_IMG },
    { label: 'Apple', variety: 'Shimla', category: 'Fruits' as const, img: APPLE_IMG }
  ];

  // Lookup real Government Mandi Reference for selected crop
  const govtRefMandi = useMemo(() => {
    if (!mandiPrices || mandiPrices.length === 0) return null;
    const cropKey = cropName.toLowerCase().split(' ')[0];
    return mandiPrices.find(m => m.cropName.toLowerCase().includes(cropKey)) || null;
  }, [mandiPrices, cropName]);

  const govtModalPrice = govtRefMandi ? govtRefMandi.modalPrice : null;
  const govtReportedDate = govtRefMandi ? govtRefMandi.lastUpdated?.replace('Reported ', '').trim() || '31 Aug 2026' : null;

  // Price comparison guidance against Government reference
  const enteredPriceNum = Number(pricePerKg);
  const priceGuidanceNote = useMemo(() => {
    if (!govtModalPrice || isNaN(enteredPriceNum) || enteredPriceNum <= 0) return null;
    const diff = Math.round((enteredPriceNum - govtModalPrice) * 100) / 100;
    if (diff === 0) {
      return { type: 'match', text: 'Matches the latest Government market reference rate.' };
    }
    if (diff < 0) {
      return { type: 'below', text: `Your price is ₹${Math.abs(diff).toFixed(2)}/kg below the Government reference (₹${govtModalPrice}/kg).` };
    }
    return { type: 'above', text: `Your price is ₹${diff.toFixed(2)}/kg above the Government reference (₹${govtModalPrice}/kg).` };
  }, [enteredPriceNum, govtModalPrice]);

  const handleSelectPreset = (preset: typeof presetCrops[0]) => {
    setCropName(preset.label);
    setVariety(preset.variety);
    setCategory(preset.category);
    setSelectedImage(preset.img);
    setValidationError(null);

    // If a govt price exists for this crop, default asking price near it
    const matchingGovt = mandiPrices.find(m => m.cropName.toLowerCase().includes(preset.label.toLowerCase().split(' ')[0]));
    if (matchingGovt) {
      setPricePerKg(String(matchingGovt.modalPrice));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isProfileComplete('farmer')) {
      setValidationError('Please complete your Farmer Profile before listing produce.');
      return;
    }

    if (!cropName.trim()) {
      setValidationError('Please select or enter a crop name.');
      return;
    }

    const qty = Number(quantityKg);
    if (isNaN(qty) || qty <= 0) {
      setValidationError('Enter a valid quantity (greater than 0 kg).');
      return;
    }

    const price = Number(pricePerKg);
    if (isNaN(price) || price <= 0) {
      setValidationError('Enter a valid selling price (greater than ₹0/kg).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addProduceListing({
        cropName,
        variety,
        category,
        qualityGrade,
        quantityKg: qty,
        minOrderQuantityKg: Number(minOrderKg) || Math.min(50, qty),
        pricePerKg: price,
        harvestDate: 'Today, Just Harvested',
        shelfLifeDays: Number(shelfLifeDays) || 7,
        imageUrl: selectedImage,
        description: `Freshly harvested ${cropName} (${variety}) from ${currentUser?.location || 'Farm'}. Quality Estimate: ${qualityGrade}.`
      });

      setIsSubmitting(false);
      setIsPublished(true);
    }, 400);
  };

  return (
    <AppLayout title="Add Produce" showBack onBack={() => navigate('/farmer/dashboard')}>
      <div className="flex flex-col w-full gap-5 pb-8">
        
        {/* Page Header */}
        <div className="pt-1">
          <h2 className="text-title-md font-title-md font-bold text-on-surface">Add Produce</h2>
          <p className="text-[13px] text-on-surface-variant">List your harvest for buyers</p>
        </div>

        {/* Success Confirmation Modal / Banner */}
        {isPublished ? (
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-2 border-primary/40 shadow-elevated text-center flex flex-col items-center gap-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div>
              <h3 className="text-title-md font-bold text-on-surface">Produce Listed Successfully</h3>
              <p className="text-body-md text-on-surface-variant mt-1">
                Your {quantityKg} kg of {cropName} @ ₹{pricePerKg}/kg is now live on the Marketplace.
              </p>
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-2 mt-3">
              <button
                onClick={() => navigate('/farmer/dashboard')}
                className="flex-1 h-touch-target-min bg-primary text-on-primary rounded-xl font-bold text-label-sm shadow-sm hover:bg-primary/90 transition-all"
              >
                View My Listings
              </button>
              <button
                onClick={() => {
                  setIsPublished(false);
                  setQuantityKg('');
                  setPricePerKg('');
                }}
                className="flex-1 h-touch-target-min bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold rounded-xl text-label-sm transition-all"
              >
                + List Another Produce
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Onboarding Incomplete Notice Banner */}
            {!isProfileComplete('farmer') && (
              <div className="p-4 bg-tertiary-fixed/20 border border-tertiary/30 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-[22px]">warning</span>
                  <div>
                    <p className="text-[13px] font-bold text-on-surface">Farmer Profile Incomplete</p>
                    <p className="text-[12px] text-on-surface-variant">Complete your farm details before listing produce.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/farmer/profile')}
                  className="px-3.5 py-1.5 bg-tertiary text-on-tertiary text-[12px] font-bold rounded-xl hover:bg-tertiary/90 transition-all shrink-0"
                >
                  Complete Profile
                </button>
              </div>
            )}

            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-3.5 bg-error-container/40 border border-error/30 text-on-error-container rounded-xl flex items-center gap-2 text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[20px] text-error">error</span>
                <span>{validationError}</span>
              </div>
            )}

            {/* 1. Choose Crop Presets */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
              <label className="font-label-sm text-label-sm font-bold text-on-surface">
                1. Choose Crop
              </label>

              {/* Crop Preset Chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {presetCrops.map(preset => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => handleSelectPreset(preset)}
                    className={`shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl border text-[13px] font-semibold flex items-center gap-2 transition-all ${
                      cropName.toLowerCase().startsWith(preset.label.toLowerCase())
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                    }`}
                  >
                    <img src={preset.img} alt={preset.label} className="w-5 h-5 rounded-full object-cover" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>

              {/* Crop Name & Variety Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-on-surface-variant">Crop Name</label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={e => setCropName(e.target.value)}
                    className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                    placeholder="e.g. Tomato"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-on-surface-variant">Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={e => setVariety(e.target.value)}
                    className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                    placeholder="e.g. Hybrid / Desi"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Crop Photograph & AI Quality Estimate */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm font-bold text-on-surface">
                  2. Crop Photograph
                </label>
                <span className="text-[11px] font-semibold text-tertiary bg-tertiary-fixed/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                  AI-assisted quality estimate: {qualityGrade}
                </span>
              </div>

              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-dashed border-primary/30 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt={cropName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-outline-variant/30 text-[11px] font-semibold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  Crop Photo Attached
                </div>
              </div>
            </div>

            {/* 3. Quantity */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
              <label className="font-label-sm text-label-sm font-bold text-on-surface">
                3. Enter Quantity
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-on-surface-variant">Available Quantity</label>
                  <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-2 border border-outline-variant/30 focus-within:border-primary">
                    <input
                      type="number"
                      min="1"
                      value={quantityKg}
                      onChange={e => setQuantityKg(e.target.value)}
                      className="flex-1 bg-transparent outline-none font-bold text-headline-lg-mobile text-on-surface"
                      placeholder="500"
                      required
                    />
                    <span className="text-label-sm font-semibold text-on-surface-variant">kg</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-on-surface-variant">Min Order Qty</label>
                  <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-2 border border-outline-variant/30 focus-within:border-primary">
                    <input
                      type="number"
                      min="1"
                      value={minOrderKg}
                      onChange={e => setMinOrderKg(e.target.value)}
                      className="flex-1 bg-transparent outline-none font-bold text-headline-lg-mobile text-on-surface"
                      placeholder="100"
                      required
                    />
                    <span className="text-label-sm font-semibold text-on-surface-variant">kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Selling Price & 5. Government Market Reference */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-4">
              <label className="font-label-sm text-label-sm font-bold text-on-surface">
                4. Your Desired Selling Price
              </label>

              <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-2 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                <span className="font-bold text-primary text-title-md">₹</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={pricePerKg}
                  onChange={e => setPricePerKg(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-bold text-headline-lg-mobile text-primary"
                  placeholder="30"
                  required
                />
                <span className="text-label-sm font-semibold text-on-surface-variant">per kg</span>
              </div>

              {/* 5. Government Market Reference Card */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f5238] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
                    Government Market Reference
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {govtReportedDate || 'Latest Report'}
                  </span>
                </div>

                {govtModalPrice ? (
                  <div className="flex items-baseline justify-between mt-2">
                    <div>
                      <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">
                        ₹{govtModalPrice}
                      </span>
                      <span className="text-label-sm font-normal text-on-surface-variant">/kg</span>
                      <span className="text-[12px] text-on-surface-variant block mt-0.5">
                        {govtRefMandi?.mandiName}, {govtRefMandi?.state}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded-md">
                      Source: data.gov.in
                    </span>
                  </div>
                ) : (
                  <p className="text-[12px] text-on-surface-variant mt-1.5">
                    Government market reference unavailable for this crop.
                  </p>
                )}
              </div>

              {/* AI Guidance (Clearly separated from Government data) */}
              <div className="flex items-center justify-between text-[12px] text-on-surface-variant px-1">
                <span className="flex items-center gap-1 text-tertiary font-semibold">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  AI demo estimate: ₹{govtModalPrice ? `${govtModalPrice - 2.5} – ₹${govtModalPrice + 1.0}` : '₹28–31'}/kg
                </span>
                <span className="text-[11px] text-on-surface-variant/80">AI Estimate</span>
              </div>

              {/* Price Guidance Feedback Note */}
              <div className="text-[12px] font-medium text-on-surface-variant px-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>
                  {priceGuidanceNote
                    ? `${priceGuidanceNote.text} Government price is only a reference. You choose your selling price.`
                    : 'Government price is only a reference. You choose your selling price.'}
                </span>
              </div>
            </div>

            {/* 6. Simple Summary Before Publish */}
            <div className="bg-primary-fixed/20 p-4 rounded-2xl border border-primary/20 flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Your Listing Summary
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-title-md font-bold text-on-surface">{cropName} ({variety})</h4>
                  <p className="text-[12px] text-on-surface-variant">{quantityKg || 0} kg available</p>
                </div>
                <div className="text-right">
                  <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-primary">
                    ₹{pricePerKg || 0}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">/kg</span>
                </div>
              </div>
            </div>

            {/* Publish Button (Min 48px touch target) */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[52px] bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>List Produce</span>
                    <span className="material-symbols-outlined text-[22px]">add_circle</span>
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
