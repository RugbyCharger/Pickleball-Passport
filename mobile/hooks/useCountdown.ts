import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { differenceInDays, differenceInHours, differenceInMinutes, isBefore } from 'date-fns';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
  isToday: boolean;
}

function calculateCountdown(targetDate: Date): CountdownResult {
  const now = new Date();
  const isPast = isBefore(targetDate, now);

  if (isPast) {
    return { days: 0, hours: 0, minutes: 0, isPast: true, isToday: false };
  }

  const totalDays = differenceInDays(targetDate, now);
  const totalHours = differenceInHours(targetDate, now);
  const totalMinutes = differenceInMinutes(targetDate, now);

  return {
    days: totalDays,
    hours: totalHours % 24,
    minutes: totalMinutes % 60,
    isPast: false,
    isToday: totalDays === 0,
  };
}

export function useCountdown(targetDate: Date | string | null) {
  const target = targetDate ? new Date(targetDate) : null;
  const [countdown, setCountdown] = useState<CountdownResult>(
    target ? calculateCountdown(target) : { days: 0, hours: 0, minutes: 0, isPast: true, isToday: false }
  );

  const updateCountdown = useCallback(() => {
    if (target) {
      setCountdown(calculateCountdown(target));
    }
  }, [target?.getTime()]);

  // Update on mount and every minute
  useEffect(() => {
    if (!target) return;

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [target?.getTime(), updateCountdown]);

  // Update when app returns to foreground (handles background pause)
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        updateCountdown();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [updateCountdown]);

  return countdown;
}
