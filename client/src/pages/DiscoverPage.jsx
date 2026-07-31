import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/discover/SearchBar";
import FilterPanel from "../components/discover/FilterPanel";
import FilterDrawer from "../components/discover/FilterDrawer";
import ActiveFilterChips from "../components/discover/ActiveFilterChips";
import DiscoverGrid from "../components/discover/DiscoverGrid";
import LoadingSkeleton from "../components/discover/LoadingSkeleton";
import EmptyState from "../components/discover/EmptyState";
import ErrorState from "../components/discover/ErrorState";
import Pagination from "../components/discover/Pagination";
import SwapRequestModal from "../components/swaps/SwapRequestModal";
import useDiscover from "../hooks/useDiscover";

export default function DiscoverPage() {
  const {
    search,
    setSearch,
    category,
    setCategory,
    type,
    setType,
    level,
    setLevel,
    sort,
    setSort,
    pagination,
    users,
    loading,
    error,
    hasActiveFilters,
    clearFilters,
    refetch,
    setPage,
  } = useDiscover();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSwapUser, setSelectedSwapUser] = useState(null);
  const [selectedSwapSkill, setSelectedSwapSkill] = useState(null);

  const resultsTopRef = useRef(null);

  const handleOpenSwapModal = (user, skill = null) => {
    setSelectedSwapUser(user);
    setSelectedSwapSkill(skill);
    setSwapModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    setSwapModalOpen(false);
    setSelectedSwapUser(null);
    setSelectedSwapSkill(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeFilterCount = [
    Boolean(search.trim()),
    Boolean(category),
    Boolean(type),
    Boolean(level),
    Boolean(sort && sort !== "newest"),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] font-sans antialiased flex flex-col">
      {/* Centralized Shared Top Navigation */}
      <Navbar />

      {/* Main Page Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-6">
        {/* Page Header */}
        <header className="space-y-1" ref={resultsTopRef}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16160F]">
            Discover Skills
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6858] max-w-2xl">
            Explore skills offered and requested by community members. Connect with mentors, find learning partners, and start swapping skills.
          </p>
        </header>

        {/* Persistent Search & Filter Container (Airbnb-inspired Layout) */}
        <section
          className="bg-white border border-[#E6E3DA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
          aria-label="Skill search and filter controls"
        >
          {/* Top Search Bar */}
          <div className="w-full flex items-center justify-between gap-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch("")}
              loading={loading && Boolean(search.trim())}
            />
          </div>

          {/* Desktop & Mobile Filter Bar */}
          <FilterPanel
            category={category}
            type={type}
            level={level}
            sort={sort}
            onCategoryChange={setCategory}
            onTypeChange={setType}
            onLevelChange={setLevel}
            onSortChange={setSort}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          {/* Active Filter Chips */}
          <ActiveFilterChips
            search={search}
            category={category}
            type={type}
            level={level}
            sort={sort}
            onRemoveSearch={() => setSearch("")}
            onRemoveCategory={() => setCategory("")}
            onRemoveType={() => setType("")}
            onRemoveLevel={() => setLevel("")}
            onRemoveSort={() => setSort("newest")}
            onClearAll={clearFilters}
          />
        </section>

        {/* Mobile Filter Drawer Modal */}
        <FilterDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          category={category}
          type={type}
          level={level}
          sort={sort}
          onCategoryChange={setCategory}
          onTypeChange={setType}
          onLevelChange={setLevel}
          onSortChange={setSort}
          onClearAll={() => {
            clearFilters();
            setMobileDrawerOpen(false);
          }}
        />

        {/* Discovery Results Section */}
        <section aria-label="Discovered community members list">
          {loading ? (
            <LoadingSkeleton count={6} />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : users.length === 0 ? (
            <EmptyState onClearFilters={hasActiveFilters ? clearFilters : null} />
          ) : (
            <>
              <DiscoverGrid users={users} onRequestSwap={handleOpenSwapModal} />
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                totalResults={pagination.totalResults}
              />
            </>
          )}
        </section>
      </main>

      {/* Swap Request Modal */}
      {selectedSwapUser && (
        <SwapRequestModal
          isOpen={swapModalOpen}
          onClose={handleCloseSwapModal}
          targetUser={selectedSwapUser}
          targetSkill={selectedSwapSkill}
        />
      )}
    </div>
  );
}
