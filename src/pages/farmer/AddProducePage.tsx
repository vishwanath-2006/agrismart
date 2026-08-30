import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { TOMATO_IMG, ONION_IMG, POTATO_IMG, WHEAT_IMG, APPLE_IMG } from '../../data/mockData';

export const AddProducePage: React.FC = () => {
  const navigate = useNavigate();
  const { addProduceListing, currentUser } = useApp();

  const [cropName, setCropName] = useState('Tomato (Hybrid)');
  const [variety, setVariety] = useState('Abhinav 3140');
  const [category, setCategory] = useState<'Vegetables' | 'Fruits' | 'Grains' | 'Pulses'>('Vegetables');
  const [qualityGrade, setQualityGrade] = useState<'Grade A' | 'Grade B' | 'Organic Certified' | 'Premium'>('Grade A');
  const [quantityKg, setQuantityKg] = useState('500');
  const [minOrderKg, setMinOrderKg] = useState('100');
  const [pricePerKg, setPricePerKg] = useState('30');
  const [shelfLifeDays, setShelfLifeDays] = useState('8');
  const [selectedImage, setSelectedImage] = useState(TOMATO_IMG);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const presetImages = [
    { label: 'Tomato', url: TOMATO_IMG },
    { label: 'Red Onion', url: ONION_IMG },
    { label: 'Potato', url: POTATO_IMG },
    { label: 'Wheat', url: WHEAT_IMG },
    { label: 'Apple', url: APPLE_IMG }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addProduceListing({
        cropName,
        variety,
        category,
        qualityGrade,
        quantityKg: Number(quantityKg) || 100,
        minOrderQuantityKg: Number(minOrderKg) || 50,
        pricePerKg: Number(pricePerKg) || 25,
        harvestDate: 'Today, Just Harvested',
        shelfLifeDays: Number(shelfLifeDays) || 7,
        imageUrl: selectedImage,
        description: `Freshly harvested ${cropName} (${variety}) from ${currentUser.location}. Inspected Grade: ${qualityGrade}.`
      });

      setIsSubmitting(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        navigate('/farmer/dashboard');
      }, 800);
    }, 500);
  };

  return (
    <AppLayout title="List New Produce" showBack onBack={() => navigate('/farmer/dashboard')}>
      <div className="flex flex-col w-full gap-5 pb-6">
        {/* Success Toast Banner */}
        {showSuccessToast && (
          <div className="bg-tertiary text-on-tertiary p-4 rounded-2xl shadow-elevated flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
            <div>
              <p className="font-bold text-label-sm">Produce Listed Successfully!</p>
              <p className="text-[12px] opacity-90">Live on Buyer Marketplace now.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Photo Upload & AI Quality Scanner */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="font-label-sm text-label-sm font-bold text-on-surface">Crop Photograph</label>
              <span className="text-[11px] font-bold text-tertiary bg-tertiary-fixed/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                AI Quality Scanned: Grade A
              </span>
            </div>

            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-dashed border-primary/30 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Produce Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-outline-variant/30 text-[11px] font-semibold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                Verified Photo
              </div>
            </div>

            {/* Quick preset image selector */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
              {presetImages.map(img => (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => {
                    setSelectedImage(img.url);
                    if (img.label === 'Tomato') setCropName('Tomato (Hybrid)');
                    else if (img.label === 'Red Onion') setCropName('Red Onion');
                    else if (img.label === 'Potato') setCropName('Potato Jyoti');
                    else if (img.label === 'Wheat') setCropName('Sharbati Wheat');
                    else if (img.label === 'Apple') setCropName('Royal Delicious Apple');
                  }}
                  className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    selectedImage === img.url
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commodity Details */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-4">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Commodity Details</h3>

            {/* Crop Name & Variety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-medium text-on-surface">Crop Name</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={e => setCropName(e.target.value)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-medium text-on-surface">Variety / Hybrid</label>
                <input
                  type="text"
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Category & Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-medium text-on-surface">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-medium text-on-surface">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={e => setQualityGrade(e.target.value as any)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                >
                  <option value="Grade A">Grade A (Export / Prime)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Organic Certified">Organic Certified</option>
                  <option value="Premium">Premium Handpicked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex flex-col gap-4">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Quantity & Price</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-medium text-on-surface">Available Stock (kg)</label>
                <input
                  type="number"
                  value={quantityKg}
                  onChange={e => setQuantityKg(e.target.value)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-bold text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-medium text-on-surface">Min Order Qty (kg)</label>
                <input
                  type="number"
                  value={minOrderKg}
                  onChange={e => setMinOrderKg(e.target.value)}
                  className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-bold text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Asking Price with AI Guidance */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-label-sm font-medium text-on-surface">Your Asking Price (₹/kg)</label>
                <span className="text-[11px] font-semibold text-tertiary">
                  AI Guidance: ₹28.50 – ₹31.00/kg
                </span>
              </div>
              <div className="flex items-center bg-surface-container-low rounded-xl h-touch-target-min px-4 gap-2 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                <span className="font-bold text-primary text-body-md">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={pricePerKg}
                  onChange={e => setPricePerKg(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-bold text-headline-lg-mobile text-primary"
                  required
                />
                <span className="text-[12px] font-medium text-on-surface-variant">per kg</span>
              </div>
            </div>

            {/* Shelf life */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-medium text-on-surface">Est. Shelf Life (Days)</label>
              <input
                type="number"
                value={shelfLifeDays}
                onChange={e => setShelfLifeDays(e.target.value)}
                className="bg-surface-container-low h-touch-target-min px-4 rounded-xl border border-outline-variant/30 text-body-md font-medium text-on-surface outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md font-bold shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Publish Produce Listing</span>
                  <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
