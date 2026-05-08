"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";

// Production timeout: 15 minutes
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function useSessionTimeout() {
  const [session, setSession] = useState<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    if (session) {
      const startTimeout = () => {
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(async () => {
          await supabaseRef.current.auth.signOut();
          window.location.href = "/login?expired=true";
        }, SESSION_TIMEOUT);
      };

      // Start the initial timeout
      startTimeout();

      // Reset timeout on user activity
      const resetTimeout = () => {
        startTimeout();
      };

      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, resetTimeout, true);
      });

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        events.forEach(event => {
          document.removeEventListener(event, resetTimeout, true);
        });
      };
    }
  }, [session]);
}
