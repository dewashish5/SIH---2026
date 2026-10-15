import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface LiveSyncState {
  sources: Record<string, any>;
  states: Record<string, any>;
  lastSyncedAt: Date | null;
  nextSyncAt: Date | null;
  isSyncing: boolean;
  syncCount: number;
  secondsRemaining: number;
  error: string | null;
  triggerSync: () => Promise<void>;
}

const LiveSyncContext = createContext<LiveSyncState | undefined>(undefined);

const SYNC_INTERVAL_SECONDS = 600; // 10 minutes

export const LiveSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sources, setSources] = useState<Record<string, any>>({});
  const [states, setStates] = useState<Record<string, any>>({});
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [nextSyncAt, setNextSyncAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncCount, setSyncCount] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(SYNC_INTERVAL_SECONDS);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestData = useCallback(async (isManual: boolean = false) => {
    try {
      setIsSyncing(true);
      setError(null);
      
      // 1. Trigger sync on backend to update live feed state
      if (isManual) {
        await api.syncLiveData().catch(() => {});
      }
      
      // 2. Fetch latest official sources data
      const data = await api.getLiveSources();
      if (data) {
        setSources(data.sources || {});
        setStates(data.states || {});
        const now = new Date();
        setLastSyncedAt(now);
        setNextSyncAt(new Date(now.getTime() + SYNC_INTERVAL_SECONDS * 1000));
        setSyncCount((prev) => prev + 1);
        setSecondsRemaining(SYNC_INTERVAL_SECONDS);
      }
    } catch (err: any) {
      console.warn('Live sync fetch error:', err);
      setError(err?.message || 'Sync failed');
      // Set fallback timestamp so UI shows active state
      if (!lastSyncedAt) {
        setLastSyncedAt(new Date());
      }
    } finally {
      setIsSyncing(false);
    }
  }, [lastSyncedAt]);

  // 1. Initial fetch on website open
  useEffect(() => {
    fetchLatestData(false);
  }, []);

  // 2. Automated 10-minute polling loop to hit API
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestData(true);
    }, SYNC_INTERVAL_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [fetchLatestData]);

  // 3. Countdown timer tick (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return SYNC_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerSync = async () => {
    await fetchLatestData(true);
  };

  return (
    <LiveSyncContext.Provider
      value={{
        sources,
        states,
        lastSyncedAt,
        nextSyncAt,
        isSyncing,
        syncCount,
        secondsRemaining,
        error,
        triggerSync
      }}
    >
      {children}
    </LiveSyncContext.Provider>
  );
};

export const useLiveSync = (): LiveSyncState => {
  const context = useContext(LiveSyncContext);
  if (!context) {
    throw new Error('useLiveSync must be used within a LiveSyncProvider');
  }
  return context;
};
