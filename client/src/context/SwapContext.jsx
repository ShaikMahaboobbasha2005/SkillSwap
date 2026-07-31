import { createContext, useContext, useState, useEffect, useCallback } from "react";
import swapService from "../services/swapService";
import useAuth from "../hooks/useAuth";

export const SwapContext = createContext(null);

/**
 * SwapProvider Component
 *
 * Provides central swap statistics and pending incoming count state to the application.
 * Source of truth: swapService.getSwapStats()
 */
export const SwapProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    pendingIncoming: 0,
    pendingOutgoing: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
    totalIncoming: 0,
    totalOutgoing: 0,
  });

  const refreshStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats({
        pendingIncoming: 0,
        pendingOutgoing: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
        totalIncoming: 0,
        totalOutgoing: 0,
      });
      return;
    }

    try {
      const res = await swapService.getSwapStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch swap stats in SwapContext:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const value = {
    stats,
    pendingIncomingCount: stats.pendingIncoming || 0,
    refreshStats,
  };

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
};

/**
 * Custom Hook to consume SwapContext
 */
export const useSwap = () => {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error("useSwap must be used within a SwapProvider");
  }
  return context;
};
