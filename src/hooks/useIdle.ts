'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook to detect user idle state.
 * @param ms The timeout in milliseconds to consider the user as idle.
 * @returns boolean `isIdle`
 */
export const useIdle = (ms: number) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    // If we are idle, an event brings us out of it.
    if (isIdle) {
      setIsIdle(false);
    }
    
    // Clear any existing timer.
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    // Set a new timer.
    timeoutIdRef.current = setTimeout(() => {
      setIsIdle(true);
    }, ms);
  }, [ms, isIdle]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Start the timer initially.
    resetTimer();

    return () => {
      // Cleanup: remove listeners and clear timer.
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]); // The effect depends on resetTimer.

  return isIdle;
};
