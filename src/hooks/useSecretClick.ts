/**
 * Custom Hook: useSecretClick
 * 
 * Tracks rapid consecutive clicks on a target element within a sliding time window.
 * When the threshold (default: 5 clicks within 2000ms) is reached, it toggles isPreviewMode.
 */

import { useState, useRef, useCallback } from 'react';

interface UseSecretClickOptions {
  requiredClicks?: number;
  timeWindowMs?: number;
  initialState?: boolean;
  onToggle?: (active: boolean) => void;
}

export function useSecretClick({
  requiredClicks = 5,
  timeWindowMs = 2000,
  initialState = false,
  onToggle,
}: UseSecretClickOptions = {}) {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(initialState);
  const [clickCount, setClickCount] = useState<number>(0);
  const clickTimestampsRef = useRef<number[]>([]);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretClick = useCallback(() => {
    const now = Date.now();
    
    // Filter out clicks older than the sliding time window
    const recentClicks = clickTimestampsRef.current.filter(
      timestamp => now - timestamp < timeWindowMs
    );
    
    recentClicks.push(now);
    clickTimestampsRef.current = recentClicks;
    setClickCount(recentClicks.length);

    // Reset visual click count indicator after window expires
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      clickTimestampsRef.current = [];
      setClickCount(0);
    }, timeWindowMs);

    // Check if secret threshold has been reached
    if (recentClicks.length >= requiredClicks) {
      clickTimestampsRef.current = [];
      setClickCount(0);
      setIsPreviewMode(prev => {
        const nextState = !prev;
        if (onToggle) onToggle(nextState);
        return nextState;
      });
    }
  }, [requiredClicks, timeWindowMs, onToggle]);

  const exitPreviewMode = useCallback(() => {
    setIsPreviewMode(false);
    if (onToggle) onToggle(false);
  }, [onToggle]);

  return {
    isPreviewMode,
    setIsPreviewMode,
    handleSecretClick,
    exitPreviewMode,
    clickCount,
    requiredClicks,
  };
}
