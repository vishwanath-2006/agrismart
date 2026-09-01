import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SUNRISE_HERO_URL, LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, switchRole, loginAsDemoUser, loginWithGoogle } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'farmer');
  const [identifier, setIdentifier] = useState('9845012345');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
    setAuthError(null);
    loginAsDemoUser(selectedRole);

    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === 'farmer') navigate('/farmer/dashboard');
      else if (selectedRole === 'buyer') navigate('/buyer/marketplace');
      else navigate('/transporter/dashboard');
    }, 300);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        setAuthError(error.message || 'Google Sign-In could not be initialized. Please check network/configuration.');
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred during Google Sign-In.');
      setIsGoogleLoading(false);
    }
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
        <div className="flex flex-col px-margin-mobile gap-5 -mt-10 relative z-10 pb-12">
          {/* Welcome Typography */}
          <div className="flex flex-col gap-1">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">
              Welcome Back
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Sign in to manage your agribusiness.
            </p>
          </div>

          {/* Auth Error Banner if any */}
          {authError && (
            <div className="bg-error-container/40 text-error p-3.5 rounded-2xl border border-error/30 text-[13px] flex items-center gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              <p className="flex-1">{authError}</p>
            </div>
          )}

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-touch-target-min bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/30 rounded-2xl font-title-md text-body-md font-semibold shadow-card active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {isGoogleLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                {/* Google Official SVG Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-0.5">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant/80">
              or sign in with password
            </span>
            <div className="flex-1 h-px bg-outline-variant/30" />
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
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert('Demo mode: Any password will sign you in.');
                  }}
                  className="font-label-sm text-label-sm text-primary hover:underline"
                >
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
                disabled={isLoading || isGoogleLoading}
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
          <div className="flex justify-center items-center mt-1">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="text-primary font-title-md text-body-md font-semibold hover:underline ml-1"
              >
                Sign up with Google
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
