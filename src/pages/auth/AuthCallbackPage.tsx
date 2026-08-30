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
    console.log('[AgriSmart Auth] AuthCallback mounted. Initializing session establishment...');

    // Schedule a global fallback timer immediately so the screen NEVER hangs indefinitely
    const globalTimeoutTimer = setTimeout(() => {
      if (isMounted && !isProcessingRef.current) {
        console.warn('[AgriSmart Auth] Callback timeout reached without resolution. Showing retry option.');
        setErrorMessage('Authentication took longer than expected. Please try signing in again.');
      }
    }, 8000);

    const parseErrorFromUrl = () => {
      // Check query parameters
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
      if (isProcessingRef.current) {
        console.log('[AgriSmart Auth] User is already being processed. Skipping duplicate call.');
        return;
      }
      isProcessingRef.current = true;
      clearTimeout(globalTimeoutTimer);

      console.log(`[AgriSmart Auth] Session verified. Querying profile for user ID: ${userId.substring(0, 8)}...`);

      let targetRole: UserRole | null = null;

      try {
        // Query profiles with a strict 2.5s timeout so network latency NEVER blocks routing
        const profilePromise = supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Profile query timeout') }), 2500)
        );

        const result = (await Promise.race([profilePromise, timeoutPromise])) as any;

        if (result.data?.role) {
          targetRole = result.data.role as UserRole;
          console.log(`[AgriSmart Auth] Profile found with assigned role: ${targetRole}`);
        } else {
          console.log('[AgriSmart Auth] No existing profile/role found or query timed out. Routing to role selection onboarding.');
        }
      } catch (err: any) {
        console.warn('[AgriSmart Auth] Profile lookup notice:', err?.message || err);
      }

      if (!isMounted) return;

      if (targetRole) {
        switchRole(targetRole);
        if (targetRole === 'farmer') {
          console.log('[AgriSmart Auth] Redirecting to /farmer/dashboard');
          navigate('/farmer/dashboard', { replace: true });
        } else if (targetRole === 'buyer') {
          console.log('[AgriSmart Auth] Redirecting to /buyer/marketplace');
          navigate('/buyer/marketplace', { replace: true });
        } else {
          console.log('[AgriSmart Auth] Redirecting to /transporter/dashboard');
          navigate('/transporter/dashboard', { replace: true });
        }
      } else {
        console.log('[AgriSmart Auth] Redirecting to /select-role');
        navigate('/select-role', { replace: true });
      }
    };

    const handleCallback = async () => {
      // 1. Check for explicit OAuth errors in URL
      const urlError = parseErrorFromUrl();
      if (urlError) {
        console.error('[AgriSmart Auth] OAuth provider returned error in URL:', urlError);
        if (isMounted) setErrorMessage(urlError);
        clearTimeout(globalTimeoutTimer);
        return;
      }

      try {
        // 2. Check if a session is already established by Supabase auto-detector
        const { data: initialData } = await supabase.auth.getSession();
        if (initialData.session?.user) {
          console.log('[AgriSmart Auth] Active session detected immediately from getSession().');
          await processAuthenticatedUser(initialData.session.user.id);
          return;
        }

        // 3. Check for Implicit Hash Flow (#access_token=...&refresh_token=...)
        const rawHash = window.location.hash;
        const hasAccessTokenInHash = rawHash && rawHash.includes('access_token=');
        console.log(`[AgriSmart Auth] URL hash analysis: hasAccessToken=${Boolean(hasAccessTokenInHash)}`);

        if (hasAccessTokenInHash) {
          const hashString = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;
          const hashParams = new URLSearchParams(hashString);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            console.log('[AgriSmart Auth] Calling supabase.auth.setSession with extracted access token...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (sessionError) {
              console.error('[AgriSmart Auth] setSession failed:', sessionError.message);
              throw sessionError;
            }

            if (sessionData.session?.user) {
              console.log('[AgriSmart Auth] setSession succeeded.');
              await processAuthenticatedUser(sessionData.session.user.id);
              return;
            }
          }
        }

        // 4. Check for PKCE Code Flow (?code=...)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          console.log('[AgriSmart Auth] PKCE authorization code detected in query. Exchanging for session...');
          const { data: codeData, error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            console.error('[AgriSmart Auth] exchangeCodeForSession failed:', codeError.message);
            throw codeError;
          }

          if (codeData.session?.user) {
            console.log('[AgriSmart Auth] Code exchange succeeded.');
            await processAuthenticatedUser(codeData.session.user.id);
            return;
          }
        }

        // 5. Setup auth state change listener as a fallback listener
        console.log('[AgriSmart Auth] Setting up onAuthStateChange listener fallback...');
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log(`[AgriSmart Auth] onAuthStateChange event received: ${event}`);
          if (currentSession?.user) {
            authListener.subscription.unsubscribe();
            await processAuthenticatedUser(currentSession.user.id);
          }
        });
      } catch (err: any) {
        console.error('[AgriSmart Auth] Uncaught callback exception:', err?.message || err);
        if (isMounted && !isProcessingRef.current) {
          clearTimeout(globalTimeoutTimer);
          setErrorMessage(err?.message || 'Unable to establish Google Sign-In session. Please try again.');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
      clearTimeout(globalTimeoutTimer);
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
