import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { useApp } from '../../context/AppContext';
import { FarmerProfileData } from '../../types';
import { FARMER_AVATAR } from '../../data/mockData';

export const FarmerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { farmerProfile, saveFarmerProfile, isProfileLoading, logout, switchRole, produceListings } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<FarmerProfileData>(farmerProfile);

  useEffect(() => {
    setFormData(farmerProfile);
  }, [farmerProfile]);

  const totalSteps = 4;
  const onboardingProgressPct = Math.round((currentStep / totalSteps) * 100);

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

  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const handleSaveStep = async (nextStep?: number, markComplete: boolean = false) => {
    setIsSaving(true);
    setSaveErrorMessage(null);
    const isComplete = markComplete || currentStep === totalSteps || formData.profileCompleted;

    const toSave: FarmerProfileData = {
      ...formData,
      completionPercentage: isComplete ? 100 : onboardingProgressPct,
      profileCompleted: isComplete
    };

    const success = await saveFarmerProfile(toSave);
    setIsSaving(false);

    if (success) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);

      if (isEditing) {
        setIsEditing(false);
      } else if (markComplete || currentStep === totalSteps) {
        setIsEditing(false);
        navigate('/farmer/dashboard');
      } else if (nextStep) {
        setCurrentStep(nextStep);
      }
    } else {
      setSaveErrorMessage('Unable to save profile to database. Please check your connection and try again.');
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

  if (isProfileLoading) {
    return (
      <AppLayout title="Farmer Profile" showBack onBack={() => navigate('/farmer/dashboard')}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-md text-on-surface-variant">Loading your profile from Supabase...</p>
        </div>
      </AppLayout>
    );
  }

  // =========================================================================
  // VIEW A: COMPLETED PROFILE SUMMARY (When completed and not actively editing)
  // =========================================================================
  if (formData.profileCompleted && !isEditing) {
    const activeListings = produceListings || [];

    return (
      <AppLayout title="Farmer Profile" showBack onBack={() => navigate('/farmer/dashboard')}>
        <div className="flex flex-col w-full max-w-4xl mx-auto pb-16 gap-6">
          {/* Save Notice Toast */}
          {saveSuccessNotice && (
            <div className="p-3.5 bg-primary-fixed/30 text-primary rounded-2xl border border-primary/20 text-label-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Farmer profile updated and saved to Supabase successfully.</span>
            </div>
          )}

          {/* 1. Profile Header Hero Card */}
          <div className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <img
                  alt="Farmer Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-sm"
                  src={FARMER_AVATAR}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">agriculture</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface font-bold">
                    {formData.fullName || 'Ramesh Kumar'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-on-primary shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Farmer
                  </span>
                  <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                    Demo profile information
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant mt-0.5">
                  {formData.village || 'Mysore'}, {formData.state || 'Karnataka'} • +91 {formData.phone || '98450 12345'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] font-semibold text-primary bg-primary-fixed/30 px-3 py-0.5 rounded-full">
                    Profile 100% Complete
                  </span>
                  <span className="text-[12px] text-on-surface-variant font-medium">
                    {formData.farmingType || 'Organic Certified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 w-full md:w-auto relative z-10">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-initial h-touch-target-min px-5 bg-primary text-on-primary rounded-xl font-label-sm font-semibold hover:bg-primary-container active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/farmer/add-produce')}
                className="flex-1 md:flex-initial h-touch-target-min px-5 bg-surface-container-lowest text-primary border border-primary/30 rounded-xl font-label-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add Produce
              </button>
            </div>
          </div>

          {/* 2. Farmer Information Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Farm Land</p>
              <p className="text-title-md font-bold text-on-surface mt-1">
                {formData.farmSize || 4.5} {formData.farmSizeUnit || 'Acres'}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Primary Mandi</p>
              <p className="text-title-md font-bold text-on-surface mt-1 truncate">
                {formData.primaryMarket || 'Mysore APMC'}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Target Price</p>
              <p className="text-title-md font-bold text-primary mt-1">
                ₹{formData.expectedPricePreference || 28} / kg
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Experience</p>
              <p className="text-title-md font-bold text-on-surface mt-1">
                {formData.farmingExperience || '12 Years'}
              </p>
            </div>
          </div>

          {/* 3. Your Produce Section */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-title-md font-bold text-on-surface">Your Produce Listings</h3>
                <p className="text-[12px] text-on-surface-variant">Produce currently active in the marketplace</p>
              </div>
              <button
                onClick={() => navigate('/farmer/add-produce')}
                className="text-[12px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Add Crop</span>
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>

            {activeListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {activeListings.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.cropName}
                      className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-label-sm font-bold text-on-surface truncate">{item.cropName}</h4>
                      <p className="text-[11px] text-on-surface-variant">{item.quantityKg} kg • {item.qualityGrade}</p>
                      <p className="text-[12px] font-bold text-primary mt-0.5">₹{item.pricePerKg}/kg</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-2xl">
                <p className="text-[13px]">No active produce listed yet.</p>
                <button
                  onClick={() => navigate('/farmer/add-produce')}
                  className="mt-2 text-[12px] font-bold text-primary"
                >
                  Create your first listing
                </button>
              </div>
            )}
          </div>

          {/* 4. Information Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Farm Location Section */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Farm Location Details
              </h3>

              <div className="space-y-2 text-body-md text-on-surface">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Village / Town</span>
                  <span className="font-semibold text-right">{formData.village || 'Nanjangud Rural'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">District</span>
                  <span className="font-semibold text-right">{formData.district || 'Mysore'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">State</span>
                  <span className="font-semibold text-right">{formData.state || 'Karnataka'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant text-[13px]">Pincode</span>
                  <span className="font-semibold text-right">{formData.pincode || '570001'}</span>
                </div>
              </div>
            </div>

            {/* Cultivated Crops & Land Section */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">eco</span>
                Cultivated Crops &amp; Land
              </h3>

              <div className="space-y-2 text-body-md text-on-surface">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Practice Type</span>
                  <span className="font-semibold text-right">{formData.farmingType || 'Organic Certified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Land Holding</span>
                  <span className="font-semibold text-right">
                    {formData.farmSize || 4.5} {formData.farmSizeUnit || 'Acres'}
                  </span>
                </div>
                <div className="py-1">
                  <span className="text-on-surface-variant text-[13px] block mb-1.5">Main Crops</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.mainCrops.length > 0 ? formData.mainCrops : ['Tomatoes', 'Onions', 'Potatoes']).map(crop => (
                      <span key={crop} className="px-2.5 py-1 bg-surface-container-lowest text-primary rounded-lg text-[12px] font-semibold border border-primary/20">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Bottom Navigation & Account Options */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/30">
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="w-full sm:w-auto h-touch-target-min px-6 bg-surface-container text-on-surface font-label-sm font-semibold rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
              Back to Farmer Dashboard
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  switchRole('buyer');
                  navigate('/buyer/marketplace');
                }}
                className="flex-1 sm:flex-initial h-touch-target-min px-4 bg-surface-container-low text-on-surface-variant font-label-sm rounded-xl hover:bg-surface-container transition-colors"
              >
                Switch to Buyer
              </button>
              <button
                onClick={() => {
                  switchRole('transporter');
                  navigate('/transporter/dashboard');
                }}
                className="flex-1 sm:flex-initial h-touch-target-min px-4 bg-surface-container-low text-on-surface-variant font-label-sm rounded-xl hover:bg-surface-container transition-colors"
              >
                Switch to Transporter
              </button>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="flex-1 sm:flex-initial h-touch-target-min px-4 bg-error-container/20 text-error font-label-sm rounded-xl hover:bg-error-container/30 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // =========================================================================
  // VIEW B & C: EDIT MODE OR ONBOARDING WIZARD
  // =========================================================================
  return (
    <AppLayout
      title={isEditing ? 'Edit Farmer Profile' : 'Farmer Onboarding'}
      showBack
      onBack={() => {
        if (isEditing) setIsEditing(false);
        else navigate('/farmer/dashboard');
      }}
    >
      <div className="flex flex-col w-full max-w-2xl mx-auto pb-12">
        {/* Header Title & Progress Indicator */}
        <div className="mb-6 mt-2 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="font-label-sm text-primary font-bold uppercase tracking-wider text-[12px]">
                {isEditing ? 'Edit Mode' : `Step ${currentStep} of ${totalSteps}`}
              </span>
              <span className="font-title-md text-title-md font-bold text-on-surface">
                {currentStep === 1 && 'Personal Details & Farm Location'}
                {currentStep === 2 && 'Farm Details & Crops Cultivated'}
                {currentStep === 3 && 'Selling & Market Preferences'}
                {currentStep === 4 && 'Pricing & Final Review'}
              </span>
            </div>
            <span className="font-label-sm font-bold text-primary bg-primary-fixed/30 px-3 py-1 rounded-full text-[12px]">
              {isEditing ? 'Editing' : `${onboardingProgressPct}% Complete`}
            </span>
          </div>

          {/* Accurate Progress Bar for Steps */}
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

        {/* STEP 1: PERSONAL & LOCATION */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
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

            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Farm Location
              </h2>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface-variant font-medium">Village / Town</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Nanjangud"
                    type="text"
                    value={formData.village}
                    onChange={e => setFormData({ ...formData, village: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
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
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full h-touch-target-min bg-surface-container text-on-surface-variant font-label-sm rounded-2xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: FARM DETAILS */}
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

            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">eco</span>
                Main Crops Cultivated
              </h2>
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
                          ? 'bg-primary text-on-primary shadow-sm'
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

        {/* STEP 3: SELLING PREFERENCES */}
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
            </div>

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

        {/* STEP 4: PRICING & COMPLETION */}
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

            {/* Complete and Save Action Card */}
            <div className="bg-primary-fixed/20 border border-primary/30 rounded-2xl p-5 shadow-elevated flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                  {isEditing ? 'Save Farmer Profile Changes' : 'Complete Farmer Profile Setup'}
                </h3>
                <p className="text-[13px] text-on-surface-variant mt-1 max-w-sm">
                  Save your farm coordinates, crop catalog, and pricing preferences to Supabase to start listing produce.
                </p>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveStep(undefined, true)}
                  className="flex-1 h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold hover:bg-primary-container shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSaving ? 'sync' : 'save'}
                  </span>
                  {isSaving ? 'Saving to Supabase...' : isEditing ? 'Save Changes' : 'Save & Activate Profile'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) setIsEditing(false);
                    else setCurrentStep(3);
                  }}
                  className="flex-1 sm:flex-initial h-touch-target-min px-5 bg-surface-container text-on-surface-variant rounded-xl font-label-sm hover:bg-surface-container-high"
                >
                  {isEditing ? 'Cancel' : 'Back to Step 3'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
