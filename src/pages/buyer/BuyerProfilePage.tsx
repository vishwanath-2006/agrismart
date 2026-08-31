import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { useApp } from '../../context/AppContext';
import { BuyerProfileData } from '../../types';

export const BuyerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { buyerProfile, saveBuyerProfile, isProfileLoading, logout, switchRole, orders } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Form State
  const [formData, setFormData] = useState<BuyerProfileData>(buyerProfile);

  useEffect(() => {
    setFormData(buyerProfile);
  }, [buyerProfile]);

  const totalSteps = 3;
  const onboardingProgressPct = Math.round((currentStep / totalSteps) * 100);

  const handleCommodityToggle = (item: string) => {
    const exists = formData.preferredVegetables.includes(item);
    const updated = exists
      ? formData.preferredVegetables.filter(c => c !== item)
      : [...formData.preferredVegetables, item];
    setFormData(prev => ({ ...prev, preferredVegetables: updated }));
  };

  const handleSaveStep = async (nextStep?: number, markComplete: boolean = false) => {
    setIsSaving(true);
    const isComplete = markComplete || currentStep === totalSteps || formData.profileCompleted;

    const toSave: BuyerProfileData = {
      ...formData,
      completionPercentage: isComplete ? 100 : onboardingProgressPct,
      profileCompleted: isComplete
    };

    const success = await saveBuyerProfile(toSave);
    setIsSaving(false);

    if (success) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);

      if (isEditing) {
        setIsEditing(false);
      } else if (markComplete || currentStep === totalSteps) {
        // Switch to completed profile summary
        setIsEditing(false);
      } else if (nextStep) {
        setCurrentStep(nextStep);
      }
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

  if (isProfileLoading) {
    return (
      <AppLayout title="Buyer Profile" showBack onBack={() => navigate('/buyer/marketplace')}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-10 h-10 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-md text-on-surface-variant">Loading your buyer profile from Supabase...</p>
        </div>
      </AppLayout>
    );
  }

  // =========================================================================
  // VIEW A: COMPLETED PROFILE SUMMARY (When completed and not actively editing)
  // =========================================================================
  if (formData.profileCompleted && !isEditing) {
    const buyerOrders = orders || [];
    const activeBuyerOrders = buyerOrders.filter(o => o.status !== 'COMPLETED');
    const completedBuyerOrders = buyerOrders.filter(o => o.status === 'COMPLETED');

    return (
      <AppLayout title="Buyer Profile" showBack onBack={() => navigate('/buyer/marketplace')}>
        <div className="flex flex-col w-full max-w-4xl mx-auto pb-16 gap-6">
          {/* Save Notice Toast */}
          {saveSuccessNotice && (
            <div className="p-3.5 bg-secondary-fixed/30 text-secondary rounded-2xl border border-secondary/20 text-label-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Buyer profile updated and saved to Supabase successfully.</span>
            </div>
          )}

          {/* 1. Profile Header Hero Card */}
          <div className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center border-2 border-secondary shadow-sm text-2xl font-bold">
                  <span className="material-symbols-outlined text-4xl">storefront</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface font-bold">
                    {formData.businessName || 'XYZ Traders'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary text-on-secondary shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Buyer
                  </span>
                  <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                    Demo profile information
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant mt-0.5">
                  {formData.city || 'Bangalore'}, {formData.state || 'Karnataka'} • Contact: {formData.fullName || 'Priya Sharma'} (+91 {formData.phone || '98765 43210'})
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] font-semibold text-secondary bg-secondary-fixed/30 px-3 py-0.5 rounded-full">
                    Profile 100% Complete
                  </span>
                  <span className="text-[12px] text-on-surface-variant font-medium">
                    {formData.businessType || 'Wholesaler'}
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
                onClick={() => navigate('/buyer/marketplace')}
                className="flex-1 md:flex-initial h-touch-target-min px-5 bg-surface-container-lowest text-secondary border border-secondary/30 rounded-xl font-label-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                Marketplace
              </button>
            </div>
          </div>

          {/* 2. Key Buyer Overview Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Business Type</p>
              <p className="text-title-md font-bold text-on-surface mt-1 truncate">
                {formData.businessType || 'Wholesaler'}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Purchase Vol</p>
              <p className="text-title-md font-bold text-on-surface mt-1 truncate">
                {formData.typicalPurchaseQuantity || '500 kg - 5 Tons'}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Active Orders</p>
              <p className="text-title-md font-bold text-primary mt-1">
                {activeBuyerOrders.length}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
              <p className="text-[12px] font-medium text-on-surface-variant">Completed Deals</p>
              <p className="text-title-md font-bold text-on-surface mt-1">
                {completedBuyerOrders.length}
              </p>
            </div>
          </div>

          {/* 3. Buying Activity Section */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-card flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-title-md font-bold text-on-surface">Buying Activity</h3>
                <p className="text-[12px] text-on-surface-variant">Summary of your procurement orders</p>
              </div>
              <button
                onClick={() => navigate('/buyer/marketplace')}
                className="text-[12px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Browse Marketplace</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {buyerOrders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {buyerOrders.slice(0, 2).map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center gap-3">
                    <img
                      src={ord.produceImage}
                      alt={ord.cropName}
                      className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-label-sm font-bold text-on-surface truncate">{ord.cropName}</h4>
                        <span className="text-[11px] font-bold text-primary">#{ord.orderNumber}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">{ord.quantityKg} kg • ₹{ord.totalAmount.toLocaleString()}</p>
                      <p className="text-[11px] font-semibold text-tertiary mt-0.5">Status: {ord.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-2xl">
                <p className="text-[13px]">Orders will appear here after you place an order.</p>
              </div>
            )}
          </div>

          {/* 4. Information Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Business & Contact Section */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">business</span>
                Business Identification
              </h3>

              <div className="space-y-2 text-body-md text-on-surface">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Company Name</span>
                  <span className="font-semibold text-right">{formData.businessName || 'XYZ Agri Trades Ltd.'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Representative</span>
                  <span className="font-semibold text-right">{formData.fullName || 'Priya Sharma'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Phone Number</span>
                  <span className="font-semibold text-right">+91 {formData.phone || '98765 43210'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant text-[13px]">Email Address</span>
                  <span className="font-semibold text-right truncate max-w-[180px]">{formData.email || 'procurement@xyztraders.com'}</span>
                </div>
              </div>
            </div>

            {/* Warehouse & Receiving Depot Section */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">warehouse</span>
                Warehouse &amp; Receiving Depot
              </h3>

              <div className="space-y-2 text-body-md text-on-surface">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">Receiving Address</span>
                  <span className="font-semibold text-right max-w-[200px]">{formData.receivingAddress || 'Depot 4B, APMC Yard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">City &amp; District</span>
                  <span className="font-semibold text-right">{formData.city || 'Bangalore'}, {formData.district || 'Bengaluru Urban'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant text-[13px]">State &amp; Pincode</span>
                  <span className="font-semibold text-right">{formData.state || 'Karnataka'} - {formData.pincode || '560002'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant text-[13px]">Unloading Window</span>
                  <span className="font-semibold text-right">{formData.preferredDeliveryWindow || 'Early Morning (5 AM - 9 AM)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Bottom Navigation & Account Options */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/30">
            <button
              onClick={() => navigate('/buyer/marketplace')}
              className="w-full sm:w-auto h-touch-target-min px-6 bg-surface-container text-on-surface font-label-sm font-semibold rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              Back to Marketplace
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
      title={isEditing ? 'Edit Buyer Profile' : 'Buyer Onboarding'}
      showBack
      onBack={() => {
        if (isEditing) setIsEditing(false);
        else navigate('/buyer/marketplace');
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
                {currentStep === 1 && 'Business & Contact Details'}
                {currentStep === 2 && 'Warehouse & Receiving Location'}
                {currentStep === 3 && 'Procurement Preferences & Final Review'}
              </span>
            </div>
            <span className="font-label-sm font-bold text-primary bg-primary-fixed/30 px-3 py-1 rounded-full text-[12px]">
              {isEditing ? 'Editing' : `${onboardingProgressPct}% Complete`}
            </span>
          </div>

          {/* Accurate 3-Step Progress Bar */}
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

        {/* STEP 1: BUSINESS & CONTACT */}
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

        {/* STEP 2: LOCATION & RECEIVING */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* STEP 3: BUYING PREFERENCES & COMPLETION */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shopping_basket</span>
                Preferred Commodities &amp; Volumes
              </h2>
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

            {/* Complete and Save Action Card */}
            <div className="bg-secondary-fixed/20 border border-secondary/30 rounded-2xl p-5 shadow-elevated flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
              </div>
              <div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                  {isEditing ? 'Save Buyer Profile Changes' : 'Complete Buyer Profile Setup'}
                </h3>
                <p className="text-[13px] text-on-surface-variant mt-1 max-w-sm">
                  Save your procurement requirements, warehouse depot location, and verified company details to Supabase.
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
                  {isSaving ? 'Saving to Supabase...' : isEditing ? 'Save Changes' : 'Save & Activate Buyer Profile'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) setIsEditing(false);
                    else setCurrentStep(2);
                  }}
                  className="flex-1 sm:flex-initial h-touch-target-min px-5 bg-surface-container text-on-surface-variant rounded-xl font-label-sm hover:bg-surface-container-high"
                >
                  {isEditing ? 'Cancel' : 'Back to Step 2'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
