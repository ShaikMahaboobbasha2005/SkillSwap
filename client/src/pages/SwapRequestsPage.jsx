import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import IncomingRequests from "../components/swaps/IncomingRequests";
import OutgoingRequests from "../components/swaps/OutgoingRequests";
import swapService from "../services/swapService";
import { useSwap } from "../context/SwapContext";
import {
  Inbox,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Filter,
} from "lucide-react";

export default function SwapRequestsPage() {
  const { stats, refreshStats } = useSwap();
  const [activeTab, setActiveTab] = useState("incoming"); // "incoming" | "outgoing"
  const [statusFilter, setStatusFilter] = useState(""); // "" | "pending" | "accepted" | "rejected" | "cancelled"

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Requests List based on activeTab & statusFilter
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }

      if (activeTab === "incoming") {
        const res = await swapService.getIncomingSwaps(params);
        setIncomingRequests(res.data || res.swapRequests || []);
      } else {
        const res = await swapService.getOutgoingSwaps(params);
        setOutgoingRequests(res.data || res.swapRequests || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab} swap requests:`, err);
      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to load ${activeTab} swap requests. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  // Initial Load & Effect on Tab / Status Filter change
  useEffect(() => {
    refreshStats();
    fetchRequests();
  }, [refreshStats, fetchRequests]);

  // Action Refresh Callback (Preserves activeTab and statusFilter)
  const handleActionComplete = useCallback(() => {
    refreshStats();
    fetchRequests();
  }, [refreshStats, fetchRequests]);

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const isIncoming = activeTab === "incoming";

  // Tab-contextual statistics calculation
  const pendingCount = isIncoming
    ? (stats.incoming?.pending ?? stats.pendingIncoming ?? 0)
    : (stats.outgoing?.pending ?? stats.pendingOutgoing ?? 0);

  const acceptedCount = isIncoming
    ? (stats.incoming?.accepted ?? 0)
    : (stats.outgoing?.accepted ?? 0);

  const thirdCardTitle = isIncoming ? "Rejected" : "Cancelled";
  const thirdCardCount = isIncoming
    ? (stats.incoming?.rejected ?? stats.rejected ?? 0)
    : (stats.outgoing?.cancelled ?? stats.cancelled ?? 0);

  const totalCardTitle = isIncoming ? "Total Incoming" : "Total Outgoing";
  const totalCardCount = isIncoming
    ? (stats.incoming?.total ?? stats.totalIncoming ?? 0)
    : (stats.outgoing?.total ?? stats.totalOutgoing ?? 0);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] font-sans antialiased flex flex-col">
      {/* Top Application Navbar */}
      <Navbar />

      {/* Main Page Layout Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-6">
        
        {/* Page Header */}
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16160F]">
            Swap Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6858] max-w-2xl">
            Track, accept, reject, or cancel your skill exchange requests across the platform.
          </p>
        </header>

        {/* 4 Tab-Contextual Statistics Overview Cards */}
        <section
          aria-label="Swap request statistics overview"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {/* Card 1: Pending */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                Pending
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {pendingCount}
              </span>
            </div>
          </div>

          {/* Card 2: Accepted */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                Accepted
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {acceptedCount}
              </span>
            </div>
          </div>

          {/* Card 3: Rejected / Cancelled */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isIncoming ? "bg-red-50 text-red-600 border-red-200" : "bg-zinc-100 text-zinc-700 border-zinc-200"
            }`}>
              {isIncoming ? <XCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                {thirdCardTitle}
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {thirdCardCount}
              </span>
            </div>
          </div>

          {/* Card 4: Total */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center shrink-0">
              {isIncoming ? <Inbox className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                {totalCardTitle}
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {totalCardCount}
              </span>
            </div>
          </div>
        </section>

        {/* Primary Tabs & Status Filter Controls */}
        <section
          aria-label="Filter and tab controls"
          className="bg-white border border-[#E6E3DA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          {/* Main Incoming / Outgoing Tabs */}
          <div className="flex items-center justify-between border-b border-[#E6E3DA]/80 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("incoming")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 ${
                  activeTab === "incoming"
                    ? "bg-[#1B4332] text-white shadow-2xs"
                    : "text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2]"
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Incoming Requests</span>
                {stats.pendingIncoming > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-amber-950">
                    {stats.pendingIncoming}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("outgoing")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 ${
                  activeTab === "outgoing"
                    ? "bg-[#1B4332] text-white shadow-2xs"
                    : "text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2]"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Outgoing Requests</span>
                {stats.pendingOutgoing > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#E4EEE8] text-[#1B4332]">
                    {stats.pendingOutgoing}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Status Filter Pills Bar */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B6858] mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>

            {statusOptions.map((opt) => {
              const isSelected = statusFilter === opt.value;
              return (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1B4332] text-white border-[#1B4332]"
                      : "bg-[#F7F6F2] text-[#16160F] border-[#E6E3DA] hover:border-[#1B4332]/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Requests List Section */}
        <section aria-label="Swap requests list">
          {activeTab === "incoming" ? (
            <IncomingRequests
              requests={incomingRequests}
              loading={loading}
              error={error}
              onRetry={fetchRequests}
              onActionComplete={handleActionComplete}
              statusFilter={statusFilter}
            />
          ) : (
            <OutgoingRequests
              requests={outgoingRequests}
              loading={loading}
              error={error}
              onRetry={fetchRequests}
              onActionComplete={handleActionComplete}
              statusFilter={statusFilter}
            />
          )}
        </section>
      </main>
    </div>
  );
}
