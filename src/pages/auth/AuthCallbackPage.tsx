import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { switchRole } = useApp();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isHandled = false;

    const parseErrorFromUrl = () => {
      // Check query params
      const searchParams = new URLSearchParams(location.search);
      const queryError = searchParams.get('error_description') || searchParams.get('error');
      if (queryError) return queryError;

      // Check hash fragment
      if (location.hash && location.hash.includes('error=')) {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) return decodeURIComponent(hashError.replace(/\+/g, ' '));
      }

      return null;
    };

    const processUser = async (userId: string) => {
      if (isHandled) return;
      isHandled = true;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn('Profile lookup warning:', error);
        }

        if (profile?.role) {
          const role = profile.role as UserRole;
          switchRole(role);
          if (role === 'farmer') navigate('/farmer/dashboard', { replace: true });
          else if (role === 'buyer') navigate('/buyer/marketplace', { replace: true });
          else navigate('/transporter/dashboard', { replace: true });
        } else {
          // New Google user without role -> redirect to role selection
          navigate('/select-role', { replace: true });
        }
      } catch (err) {
        console.warn('Process user warning:', err);
        navigate('/select-role', { replace: true });
      }
    };

    const initCallback = async () => {
      // 1. Check for URL error params
      const urlError = parseErrorFromUrl();
      if (urlError) {
        setErrorMessage(urlError);
        return;
      }

      try {
        // 2. Check if code parameter exists (PKCE OAuth flow)
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session?.user) {
            await processUser(data.session.user.id);
            return;
          }
        }

        // 3. Check for active session (Implicit hash flow #access_token=...)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          await processUser(session.user.id);
          return;
        }

        // 4. Listen for auth state change event
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
            authListener.subscription.unsubscribe();
            await processUser(currentSession.user.id);
          }
        });

        // 5. Timeout fallback
        setTimeout(() => {
          if (!isHandled) {
            setErrorMessage('Authentication session expired or was cancelled. Please try signing in again.');
          }
        }, 5000);
      } catch (err: any) {
        console.error('OAuth callback processing error:', err);
        setErrorMessage(err.message || 'Unable to complete Google Sign-In. Please try again.');
      }
    };

    initCallback();
  }, [location, navigate, switchRole]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-elevated flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
        <img alt="AgriSmart AI" className="h-12 w-auto object-contain mb-1" src={LOGO_URL} />

        {errorMessage ? (
          <>
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">error</span>
            </div>
            <h2 className="text-title-md font-title-md font-bold text-on-surface">
              Authentication Error
            </h2>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-2 w-full h-touch-target-min bg-primary text-on-primary rounded-xl font-label-sm font-semibold hover:bg-primary-container transition-all"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mt-2" />
            <h2 className="text-title-md font-title-md font-bold text-on-surface mt-2">
              Authenticating with Google...
            </h2>
            <p className="text-[13px] text-on-surface-variant">
              Setting up your secure AgriSmart workspace.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
