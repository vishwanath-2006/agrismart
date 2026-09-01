import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { useApp } from '../../context/AppContext';
import { TransporterProfileData } from '../../types';

export const TransporterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { transporterProfile, saveTransporterProfile, isProfileLoading, logout, switchRole, activeOrder } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<TransporterProfileData>(transporterProfile);

  useEffect(() => {
    setFormData(transporterProfile);
  }, [transporterProfile]);

  const totalSteps = 4;
  const onboardingProgressPct = Math.round((currentStep / totalSteps) * 100);

  const handlePickupAreaToggle = (area: string) => {
    const exists = formData.preferredPickupAreas.includes(area);
    const updated = exists
      ? formData.preferredPickupAreas.filter(a => a !== area)
      : [...formData.preferredPickupAreas, area];
    setFormData(prev => ({ ...prev, preferredPickupAreas: updated }));
  };

  const handleDeliveryMarketToggle = (market: string) => {
    const exists = formData.preferredDeliveryMarkets.includes(market);
    const updated = exists
      ? formData.preferredDeliveryMarkets.filter(m => m !== market)
      : [...formData.preferredDeliveryMarkets, market];
    setFormData(prev => ({ ...prev, preferredDeliveryMarkets: updated }));
  };

  const handleLocateBase = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            currentLocation: 'Mandya Central Corridor, Karnataka'
          }));
        },
        () => {
          setTimeout(() => {
            setIsLocating(false);
            setFormData(prev => ({
              ...prev,
              latitude: 12.5218,
              longitude: 76.8951,
              currentLocation: 'Mandya Central Corridor, Karnataka'
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

    const toSave: TransporterProfileData = {
      ...formData,
      completionPercentage: isComplete ? 100 : onboardingProgressPct,
      profileCompleted: isComplete
    };

    const success = await saveTransporterProfile(toSave);
    setIsSaving(false);

    if (success) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);

      if (isEditing) {
        setIsEditing(false);
      } else if (markComplete || currentStep === totalSteps) {
        setIsEditing(false);
        navigate('/transporter/dashboard');
      } else if (nextStep) {
        setCurrentStep(nextStep);
      }
    } else {
      setSaveErrorMessage('Unable to save transporter profile to database. Please check your connection and try again.');
    }
  };

  const availablePickupAreas = ['Mysore', 'Mandya', 'Hunsur', 'Channapatna', 'Kolar', 'Ramanagara', 'Davanagere', 'Tumkur'];
  const availableDeliveryMarkets = ['Bangalore KR Market', 'Yeshwantpur APMC', 'Hosur Terminal', 'Chennai Koyambedu', 'Pune Gultekdi', 'Hyderabad Bowenpally'];

  if (isProfileLoading) {
    return (
      <AppLayout title="Transporter Profile" showBack onBack={() => navigate('/transporter/dashboard')}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-10 h-10 border-3 border-tertiary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-md text-on-surface-variant">Loading your transporter fleet profile from Supabase...</p>
        </div>
      </AppLayout>
    );
  }

  // =========================================================================
  // VIEW A: COMPLETED PROFILE SUMMARY (When completed and not actively editing)
  // =========================================================================
  if (formData.profileCompleted && !isEditing) {
    const ongoingTrip = activeOrder && activeOrder.status !== 'COMPLETED' ? activeOrder : null;

    return (
      <AppLayout title="Transporter Profile" showBack onBack={() => navigate('/transporter/dashboard')}>
        <div className="flex flex-col w-full max-w-4xl mx-auto pb-16 gap-6">
          {/* Save Notice Toast */}
          {saveSuccessNotice && (
            <div className="p-3.5 bg-tertiary-fixed/30 text-tertiary rounded-2xl border border-tertiary/20 text-label-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Transporter fleet profile updated and saved to Supabase successfully.</span>
            </div>
          )}

          {/* 1. Profile Header Hero Card */}
          <div className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center border-2 border-tertiary shadow-sm text-2xl font-bold">
                  <span className="material-symbols-outlined text-4xl">local_shipping</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface font-bold">
                    {formData.fullName || 'Marcus Vance'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary text-on-tertiary shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Transporter
                  </span>
                  <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                    Demo vehicle &amp; driver profile
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant mt-0.5">
                  Plate: <span className="font-mono font-bold text-on-surface">{formData.vehicleRegistrationNumber || 'KA-09-E-4421'}</span> • Base: {formData.currentLocation || 'Karnataka'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] font-semibold text-tertiary bg-tertiary-fixed/30 px-3 py-0.5 rounded-full">
                    Profile 100% Complete
                  </span>
                  <span className="text-[12px] text-on-surface-variant font-medium">
                    {formData.vehicleType || 'Tata 407 Reefer'}
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
                onClick={() => navigate('/transporter/dashboard')}
                className="flex-1 md:flex-initial h-touch-target-min px-5 bg-surface-container-lowest text-tertiary border border-tertiary/30 rounded-xl font-label-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Dashboard
              </button>
            </div>
          </div>

          {/* 2. Key Transporter Overview Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Rate / km</p>
              <p className="text-title-md font-bold text-tertiary mt-1">
                ₹{formData.transportChargePerKm || 22} / km
              </p>
              <span className="text-[10px] text-on-surface-variant">Demo rate</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Payload Capacity</p>
              <p className="text-title-md font-bold text-on-surface mt-1 truncate">
                {formData.vehicleCapacity || '4.0 Tons'}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Active Delivery</p>
              <p className="text-title-md font-bold text-primary mt-1">
                {ongoingTrip ? '1 Trip' : 'None'}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Reliability Score</p>
              <p className="text-title-md font-bold text-on-surface mt-1">
                4.96 / 5.0
              </p>
              <span className="text-[10px] text-on-surface-variant">Demo score</span>
            </div>
          </div>

          {/* 3. Information Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Personal & Contact Details */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Personal &amp; Contact Details
              </h3>

              <div className="space-y-2 text-body-md text-on-surface">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Full Name</span>
                  <span className="font-semibold text-right">{formData.fullName || 'Marcus Vance'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Phone Number</span>
                  <span className="font-semibold text-right">+91 {formData.phone || '97411 98765'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Email Address</span>
                  <span className="font-semibold text-right truncate max-w-[180px]">{formData.email || 'logistics@vancetransport.com'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant text-[13px]">Base Dispatch Station</span>
                  <span className="font-semibold text-right">{formData.currentLocation || 'Mandya Central Bypass'}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                Vehicle Specifications
              </h3>

              <div className="space-y-2 text-body-md text-on-surface">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Vehicle Model</span>
                  <span className="font-semibold text-right">{formData.vehicleType || 'Tata 407 Reefer'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Registration Number</span>
                  <span className="font-mono font-bold text-right">{formData.vehicleRegistrationNumber || 'KA-09-E-4421'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Payload Capacity</span>
                  <span className="font-semibold text-right">{formData.vehicleCapacity || '4.0 Tons'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant text-[13px]">Minimum Trip Charge</span>
                  <span className="font-semibold text-right">₹{formData.minimumTripCharge || 1800}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Navigation & Account Options */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/30">
            <button
              onClick={() => navigate('/transporter/dashboard')}
              className="w-full sm:w-auto h-touch-target-min px-6 bg-surface-container text-on-surface font-label-sm font-semibold rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              Back to Transporter Dashboard
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  switchRole('farmer');
                  navigate('/farmer/dashboard');
                }}
                className="flex-1 sm:flex-initial h-touch-target-min px-4 bg-surface-container-low text-on-surface-variant font-label-sm rounded-xl hover:bg-surface-container transition-colors"
              >
                Switch to Farmer
              </button>
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
      title={isEditing ? 'Edit Transporter Profile' : 'Transporter Onboarding'}
      showBack
      onBack={() => {
        if (isEditing) setIsEditing(false);
        else navigate('/transporter/dashboard');
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
                {currentStep === 1 && 'Personal & Base Location Details'}
                {currentStep === 2 && 'Vehicle Specifications & Payload'}
                {currentStep === 3 && 'Operating Corridors & Schedules'}
                {currentStep === 4 && 'Tariff Charges & Fleet Activation'}
              </span>
            </div>
            <span className="font-label-sm font-bold text-tertiary bg-tertiary-fixed/30 px-3 py-1 rounded-full text-[12px]">
              {isEditing ? 'Editing' : `${onboardingProgressPct}% Complete`}
            </span>
          </div>

          {/* Accurate 4-Step Progress Bar */}
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
          <div className="mb-4 p-3 bg-tertiary-fixed/30 text-tertiary rounded-xl border border-tertiary/20 text-[13px] flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Transporter details saved to Supabase successfully.</span>
          </div>
        )}

        {/* STEP 1: PERSONAL & BASE LOCATION */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Basic &amp; Contact Details
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="fullName">Full Name</label>
                <div className="relative flex items-center h-touch-target-min bg-surface rounded-xl px-4 border border-outline-variant/30 focus-within:border-primary">
                  <span className="material-symbols-outlined text-outline mr-3 text-[20px]">person</span>
                  <input
                    className="flex-1 bg-transparent font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
                    id="fullName"
                    placeholder="e.g. Manjunath Gowda"
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="phone">Phone Number</label>
                <div className="relative flex items-center h-touch-target-min bg-surface rounded-xl px-4 border border-outline-variant/30 focus-within:border-primary">
                  <span className="material-symbols-outlined text-outline mr-3 text-[20px]">call</span>
                  <input
                    className="flex-1 bg-transparent font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
                    id="phone"
                    placeholder="+91 97411 98765"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="email">Email Address</label>
                <div className="relative flex items-center h-touch-target-min bg-surface rounded-xl px-4 border border-outline-variant/30 focus-within:border-primary">
                  <span className="material-symbols-outlined text-outline mr-3 text-[20px]">mail</span>
                  <input
                    className="flex-1 bg-transparent font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
                    id="email"
                    placeholder="logistics@gowdatransports.com"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium" htmlFor="location">Base Dispatch Location</label>
                <div className="relative flex items-center h-touch-target-min bg-surface rounded-xl px-4 border border-outline-variant/30 focus-within:border-primary">
                  <span className="material-symbols-outlined text-outline mr-3 text-[20px]">location_on</span>
                  <input
                    className="flex-1 bg-transparent font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none"
                    id="location"
                    placeholder="City, State"
                    type="text"
                    value={formData.currentLocation}
                    onChange={e => setFormData({ ...formData, currentLocation: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={handleLocateBase}
                    disabled={isLocating}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isLocating ? 'refresh' : 'my_location'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStep(2)}
                disabled={isSaving}
                className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md shadow-md flex items-center justify-center gap-2 hover:bg-primary-container active:scale-95 transition-all"
              >
                <span>Continue to Vehicle Details</span>
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

        {/* STEP 2: VEHICLE DETAILS */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                Vehicle Specifications
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium">Vehicle Category</label>
                <select
                  className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.vehicleType}
                  onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="4-Wheeler Tempo Reefer (Cold Chain)">4-Wheeler Tempo Reefer (Cold Chain)</option>
                  <option value="Pickup Truck (Mahindra Bolero Maxi)">Pickup Truck (Mahindra Bolero Maxi)</option>
                  <option value="Tata 407 (4-Ton Open Body)">Tata 407 (4-Ton Open Body)</option>
                  <option value="6-Wheeler Heavy Truck (10-Ton)">6-Wheeler Heavy Truck (10-Ton)</option>
                  <option value="Mini Truck (Tata Ace / Chota Hathi)">Mini Truck (Tata Ace / Chota Hathi)</option>
                  <option value="Refrigerated Container (Multi-Temp)">Refrigerated Container (Multi-Temp)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Registration Plate</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-mono font-bold text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase"
                    placeholder="KA-09-E-4421"
                    type="text"
                    value={formData.vehicleRegistrationNumber}
                    onChange={e => setFormData({ ...formData, vehicleRegistrationNumber: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Vehicle Model</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Tata 407 LPT"
                    type="text"
                    value={formData.vehicleModel}
                    onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Capacity (Tons)</label>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. 4.0 Metric Tons"
                    type="text"
                    value={formData.vehicleCapacity}
                    onChange={e => setFormData({ ...formData, vehicleCapacity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Vehicle Age</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.vehicleAge}
                    onChange={e => setFormData({ ...formData, vehicleAge: e.target.value })}
                  >
                    <option value="Less than 1 Year">Less than 1 Year (New)</option>
                    <option value="1 - 3 Years">1 - 3 Years</option>
                    <option value="4 - 7 Years">4 - 7 Years</option>
                    <option value="8+ Years">8+ Years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSaveStep(3)}
                disabled={isSaving}
                className="w-full h-touch-target-min bg-primary text-on-primary font-title-md rounded-2xl shadow-md hover:bg-primary-container flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Continue to Service Area &amp; Availability</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full h-touch-target-min bg-transparent text-on-surface-variant font-label-sm rounded-2xl hover:bg-surface-container transition-colors"
              >
                Back to Basic Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SERVICE AREA & AVAILABILITY */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">route</span>
                Corridors &amp; Operating Routes
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium">Primary Highway Corridor</label>
                <input
                  className="w-full h-touch-target-min bg-surface rounded-xl px-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Mysore - Bangalore Highway Corridor"
                  type="text"
                  value={formData.operatingLocation}
                  onChange={e => setFormData({ ...formData, operatingLocation: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="font-label-sm text-on-surface font-medium">Preferred Pickup Areas</label>
                <div className="flex flex-wrap gap-2">
                  {availablePickupAreas.map(area => {
                    const isSelected = formData.preferredPickupAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handlePickupAreaToggle(area)}
                        className={`px-3 py-1.5 rounded-xl text-label-sm font-semibold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                        }`}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                        <span>{area}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="font-label-sm text-on-surface font-medium">Preferred Drop Mandis &amp; Terminals</label>
                <div className="flex flex-wrap gap-2">
                  {availableDeliveryMarkets.map(mkt => {
                    const isSelected = formData.preferredDeliveryMarkets.includes(mkt);
                    return (
                      <button
                        key={mkt}
                        type="button"
                        onClick={() => handleDeliveryMarketToggle(mkt)}
                        className={`px-3 py-1.5 rounded-xl text-label-sm font-semibold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-secondary text-on-secondary shadow-sm'
                            : 'bg-surface text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                        }`}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                        <span>{mkt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Availability Status</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.availability}
                    onChange={e => setFormData({ ...formData, availability: e.target.value })}
                  >
                    <option value="Available Now (GPS Active)">Available Now (GPS Active)</option>
                    <option value="Scheduled Only">Scheduled Only</option>
                    <option value="Weekends Only">Weekends Only</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Working Days</label>
                  <select
                    className="w-full h-touch-target-min bg-surface rounded-xl px-3 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={formData.workingDays}
                    onChange={e => setFormData({ ...formData, workingDays: e.target.value })}
                  >
                    <option value="All 7 Days">All 7 Days</option>
                    <option value="Monday - Saturday">Monday - Saturday</option>
                    <option value="Monday - Friday">Monday - Friday</option>
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
                <span>Continue to Tariff &amp; Rates</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full h-touch-target-min bg-transparent text-on-surface-variant font-label-sm rounded-2xl hover:bg-surface-container transition-colors"
              >
                Back to Vehicle Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CHARGES & ACTIVATION */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_atm</span>
                Transport Tariff &amp; Rates
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Rate per km (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span>
                    <input
                      className="w-full h-touch-target-min bg-surface rounded-xl pl-8 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="22"
                      type="number"
                      value={formData.transportChargePerKm || ''}
                      onChange={e => setFormData({ ...formData, transportChargePerKm: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-on-surface font-medium">Min Base Charge (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span>
                    <input
                      className="w-full h-touch-target-min bg-surface rounded-xl pl-8 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="1800"
                      type="number"
                      value={formData.minimumTripCharge || ''}
                      onChange={e => setFormData({ ...formData, minimumTripCharge: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-on-surface font-medium">Loading / Handling Charge (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span>
                  <input
                    className="w-full h-touch-target-min bg-surface rounded-xl pl-8 pr-4 font-body-md text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="350"
                    type="number"
                    value={formData.additionalLoadingCharge || ''}
                    onChange={e => setFormData({ ...formData, additionalLoadingCharge: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Complete and Save Action Card */}
            <div className="bg-tertiary-fixed/20 border border-tertiary/30 rounded-2xl p-5 shadow-elevated flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-tertiary text-on-tertiary rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_shipping
                </span>
              </div>
              <div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                  {isEditing ? 'Save Transporter Profile Changes' : 'Complete Transporter Profile Setup'}
                </h3>
                <p className="text-[13px] text-on-surface-variant mt-1 max-w-sm">
                  Save your vehicle telemetry, operating corridor, and tariffs to Supabase to start receiving dispatch load matches.
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
                  {isSaving ? 'Saving to Supabase...' : isEditing ? 'Save Changes' : 'Save & Activate Fleet Profile'}
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
