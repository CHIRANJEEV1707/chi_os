'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * A hook to detect user idle state.
 * @param ms The timeout in milliseconds to consider the user as idle.
 * @returns boolean `isIdle`
 */
export const useIdle = (ms: number) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleActivity = () => {
      setIsIdle(false);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        setIsIdle(true);
      }, ms);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    // Initialize the timer
    handleActivity();

    // Cleanup function
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [ms]);

  return isIdle;
};
