import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LOGO_URL } from '../../data/mockData';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[AgriSmart Auth] CALLBACK_MOUNTED');

    let navigated = false;

    const performNavigation = (reason: string) => {
      if (navigated) return;
      navigated = true;
      console.log(`[AgriSmart Auth] NAVIGATING_SELECT_ROLE (Trigger: ${reason})`);
      navigate('/select-role', { replace: true });
    };

    // Safety fallback timer: fires in 4s regardless of async state
    const timerId = setTimeout(() => {
      console.log('[AgriSmart Auth] SAFETY_TIMER_FIRED');
      performNavigation('safety_timer');
    }, 4000);

    const processAuth = async () => {
      try {
        console.log('[AgriSmart Auth] SESSION_START');

        // Check for error in query or hash
        const searchParams = new URLSearchParams(window.location.search);
        const queryParamsList = Array.from(searchParams.keys());
        if (queryParamsList.length > 0) {
          console.log('[AgriSmart Auth] QUERY_PARAMS_DETECTED:', queryParamsList.join(', '));
        }

        const rawHash = window.location.hash;
        if (rawHash) {
          const hashString = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;
          const hashParams = new URLSearchParams(hashString);
          const hashKeys = Array.from(hashParams.keys());
          console.log('[AgriSmart Auth] HASH_DETECTED with keys:', hashKeys.join(', '));

          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            console.log('[AgriSmart Auth] Calling setSession with extracted hash tokens...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (error) {
              console.error('[AgriSmart Auth] setSession returned error:', error.message);
            } else if (data?.session) {
              console.log('[AgriSmart Auth] SESSION_SUCCESS via setSession');
              clearTimeout(timerId);
              performNavigation('set_session_success');
              return;
            }
          }
        }

        // Check code parameter for PKCE
        const code = searchParams.get('code');
        if (code) {
          console.log('[AgriSmart Auth] PKCE code detected. Calling exchangeCodeForSession...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('[AgriSmart Auth] exchangeCodeForSession error:', error.message);
          } else if (data?.session) {
            console.log('[AgriSmart Auth] SESSION_SUCCESS via exchangeCodeForSession');
            clearTimeout(timerId);
            performNavigation('pkce_success');
            return;
          }
        }

        // Check existing session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          console.log('[AgriSmart Auth] SESSION_SUCCESS via getSession');
          clearTimeout(timerId);
          performNavigation('get_session_active');
          return;
        }

        console.log('[AgriSmart Auth] Awaiting safety timer fallback...');
      } catch (err: any) {
        console.error('[AgriSmart Auth] Exception in processAuth:', err?.message || err);
        clearTimeout(timerId);
        performNavigation('exception_fallback');
      }
    };

    processAuth();

    return () => {
      // Keep safety timer active during remounts or cleanup so navigation is guaranteed
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-elevated flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
        <img alt="AgriSmart AI" className="h-12 w-auto object-contain mb-1" src={LOGO_URL} />
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mt-2" />
        <h2 className="text-title-md font-title-md font-bold text-on-surface mt-2">
          Authenticating with Google...
        </h2>
        <p className="text-[13px] text-on-surface-variant">
          Setting up your secure AgriSmart workspace.
        </p>
      </div>
    </div>
  );
};
