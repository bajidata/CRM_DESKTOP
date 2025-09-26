import { useState, useRef, useCallback } from 'react';

export const useTimer = () => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsRunning(true);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 50);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedMs(0);
  }, [stopTimer]);

  return {
    elapsedMs,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer
  };
};