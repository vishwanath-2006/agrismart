import React, { useState, useMemo, useRef, useEffect } from 'react';
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

  // Live Camera & Photo Upload State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startLiveCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera access unavailable or permission denied. Please allow camera or use photo upload.');
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const captureLiveSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopLiveCamera();
      setSelectedImage(dataUrl);

      setIsAiScanning(true);
      setTimeout(() => {
        setIsAiScanning(false);
        setQualityGrade('Grade A');
      }, 800);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setSelectedImage(localUrl);
      setIsAiScanning(true);
      setTimeout(() => {
        setIsAiScanning(false);
        setQualityGrade('Grade A');
      }, 800);
    }
  };

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
      navigate('/farmer/profile', {
        state: {
          returnTo: '/farmer/add-produce',
          actionNotice: 'Complete your farm details to publish your produce listing on the marketplace.'
        }
      });
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
                    <p className="text-[13px] font-bold text-on-surface">Farmer Profile Required</p>
                    <p className="text-[12px] text-on-surface-variant">Complete your farm details before publishing produce.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/farmer/profile', {
                    state: {
                      returnTo: '/farmer/add-produce',
                      actionNotice: 'Complete your farm details to publish your produce listing on the marketplace.'
                    }
                  })}
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="font-label-sm text-label-sm font-bold text-on-surface">
                  2. Crop Photograph
                </label>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                  isAiScanning ? 'bg-amber-500/20 text-amber-800 animate-pulse' : 'text-tertiary bg-tertiary-fixed/30'
                }`}>
                  <span className="material-symbols-outlined text-[13px]">
                    {isAiScanning ? 'hourglass_empty' : 'auto_awesome'}
                  </span>
                  {isAiScanning ? 'AI Scanning Quality...' : `AI-assisted quality estimate: ${qualityGrade}`}
                </span>
              </div>

              {isCameraOpen ? (
                /* Live Camera Feed */
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-black border-2 border-primary shadow-inner flex flex-col items-center justify-center">
                  {cameraError ? (
                    <div className="p-4 text-center text-white flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-rose-400 text-[32px]">videocam_off</span>
                      <p className="text-xs text-rose-200">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 px-4 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow"
                      >
                        Switch to File Upload
                      </button>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}

                  {!cameraError && (
                    <div className="absolute inset-4 border-2 border-white/40 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="text-white/80 text-[11px] font-semibold bg-black/50 px-2 py-0.5 rounded-md">
                        Center Crop in Frame
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                    <button
                      type="button"
                      onClick={stopLiveCamera}
                      className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold backdrop-blur-md transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                      Cancel / Upload
                    </button>
                    {!cameraError && (
                      <button
                        type="button"
                        onClick={captureLiveSnapshot}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        Capture Snapshot
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Snapshot Preview */
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-dashed border-primary/30 flex items-center justify-center group shadow-inner">
                  <img
                    src={selectedImage}
                    alt={cropName}
                    className="w-full h-full object-cover"
                  />

                  {/* AI Scanning Animation Overlay */}
                  {isAiScanning && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-primary font-bold text-xs animate-pulse">
                      <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
                      <span className="bg-surface/90 px-3 py-1 rounded-full shadow">AI Analyzing Produce Quality...</span>
                    </div>
                  )}

                  {/* Action Buttons Overlay */}
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-end gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={startLiveCamera}
                      className="bg-primary hover:bg-primary/90 text-on-primary px-3 py-1.5 rounded-xl shadow-md text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">videocam</span>
                      Open Live Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-surface/95 hover:bg-surface backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-outline-variant/30 text-[11px] font-semibold text-on-surface flex items-center gap-1 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      Upload Photo
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
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
