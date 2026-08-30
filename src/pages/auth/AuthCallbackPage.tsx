import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { LOGO_URL } from '../../data/mockData';
import { UserRole } from '../../types';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useApp();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const parseErrorFromUrl = () => {
      // Check query params
      const searchParams = new URLSearchParams(window.location.search);
      const queryError = searchParams.get('error_description') || searchParams.get('error');
      if (queryError) return queryError;

      // Check hash fragment
      if (window.location.hash && window.location.hash.includes('error=')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) return decodeURIComponent(hashError.replace(/\+/g, ' '));
      }

      return null;
    };

    const processAuthenticatedUser = async (userId: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn('Profile query notice:', error.message);
        }

        if (!isMounted) return;

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
        console.warn('Profile dispatch fallback:', err);
        if (isMounted) {
          navigate('/select-role', { replace: true });
        }
      }
    };

    const handleCallback = async () => {
      // 1. Check for explicit OAuth error in URL
      const urlError = parseErrorFromUrl();
      if (urlError) {
        if (isMounted) setErrorMessage(urlError);
        return;
      }

      try {
        // 2. Process Implicit Hash Flow (#access_token=...&refresh_token=...)
        const rawHash = window.location.hash;
        if (rawHash && rawHash.includes('access_token=')) {
          const hashString = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;
          const hashParams = new URLSearchParams(hashString);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (error) {
              console.error('setSession error from hash:', error);
              throw error;
            }

            if (data.session?.user) {
              await processAuthenticatedUser(data.session.user.id);
              return;
            }
          }
        }

        // 3. Process PKCE Code Flow (?code=...)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('exchangeCodeForSession error:', error);
            throw error;
          }

          if (data.session?.user) {
            await processAuthenticatedUser(data.session.user.id);
            return;
          }
        }

        // 4. Check for already established session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('getSession error:', sessionError);
        }

        if (session?.user) {
          await processAuthenticatedUser(session.user.id);
          return;
        }

        // 5. Subscribe to onAuthStateChange in case session is established asynchronously
        const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
            authSubscription.subscription.unsubscribe();
            await processAuthenticatedUser(currentSession.user.id);
          }
        });

        // 6. Timeout safeguard
        setTimeout(() => {
          if (isMounted && !isProcessingRef.current) {
            setErrorMessage('Authentication session expired or was cancelled. Please try signing in again.');
          }
        }, 6000);
      } catch (err: any) {
        console.error('OAuth callback execution error:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Unable to establish Google Sign-In session. Please try again.');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, switchRole]);

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
