import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SUNRISE_HERO_URL, LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, switchRole } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'farmer');
  const [identifier, setIdentifier] = useState('9845012345');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    switchRole(role);
    if (role === 'farmer') setIdentifier('9845012345');
    else if (role === 'buyer') setIdentifier('procurement@xyztraders.com');
    else setIdentifier('9741198765');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    switchRole(selectedRole);

    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === 'farmer') navigate('/farmer/dashboard');
      else if (selectedRole === 'buyer') navigate('/buyer/marketplace');
      else navigate('/transporter/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-start">
      {/* Top Header Bar */}
      <div className="h-16 px-margin-mobile flex items-center justify-between bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img alt="AgriSmart AI Logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
          <span className="font-title-md text-title-md text-primary font-bold">AgriSmart AI</span>
        </div>
        <span className="text-[12px] font-semibold text-primary bg-primary-fixed/30 px-3 py-1 rounded-full uppercase tracking-wider">
          Marketplace
        </span>
      </div>

      <div className="flex flex-col w-full max-w-md mx-auto">
        {/* Sunrise Illustration Banner */}
        <div
          className="w-full h-[220px] rounded-b-[2rem] bg-cover bg-center shadow-sm relative overflow-hidden shrink-0"
          style={{ backgroundImage: `url('${SUNRISE_HERO_URL}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        </div>

        {/* Form Container */}
        <div className="flex flex-col px-margin-mobile gap-6 -mt-10 relative z-10 pb-12">
          {/* Welcome Typography */}
          <div className="flex flex-col gap-1">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
              Welcome Back
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Sign in to manage your agribusiness.
            </p>
          </div>

          {/* Role Selection (Segmented Control) */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface font-medium px-1">
              Select your role
            </label>
            <div className="flex bg-surface-container rounded-2xl p-1 gap-1 relative shadow-inner border border-outline-variant/20">
              <button
                type="button"
                onClick={() => handleRoleChange('farmer')}
                className={`flex-1 h-touch-target-min flex items-center justify-center rounded-xl text-label-sm font-semibold transition-all duration-200 ${
                  selectedRole === 'farmer'
                    ? 'bg-surface-container-lowest text-primary shadow-card transform scale-100'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Farmer
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('buyer')}
                className={`flex-1 h-touch-target-min flex items-center justify-center rounded-xl text-label-sm font-semibold transition-all duration-200 ${
                  selectedRole === 'buyer'
                    ? 'bg-surface-container-lowest text-primary shadow-card transform scale-100'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('transporter')}
                className={`flex-1 h-touch-target-min flex items-center justify-center rounded-xl text-label-sm font-semibold transition-all duration-200 ${
                  selectedRole === 'transporter'
                    ? 'bg-surface-container-lowest text-primary shadow-card transform scale-100'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Transporter
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email/Mobile Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface font-medium px-1">
                Email or Mobile Number
              </label>
              <div className="flex items-center bg-surface-container-low rounded-2xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                <input
                  className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-outline-variant w-full h-full"
                  placeholder="e.g. +91 98450 12345"
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-sm text-label-sm text-on-surface font-medium">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password: Any input will work.'); }} className="font-label-sm text-label-sm text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="flex items-center bg-surface-container-low rounded-2xl h-touch-target-min px-4 gap-3 border border-outline-variant/30 focus-within:border-primary focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                <input
                  className="flex-1 bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-outline-variant w-full h-full"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-8 h-8 rounded-full"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 w-full">
              <button
                className="w-full h-touch-target-min bg-primary text-on-primary rounded-2xl font-title-md text-title-md shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      login
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Secondary Action */}
          <div className="flex justify-center items-center mt-2">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => alert(`Sign up flow initialized for new ${selectedRole} account.`)}
                className="text-primary font-title-md text-body-md font-semibold hover:underline ml-1"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
