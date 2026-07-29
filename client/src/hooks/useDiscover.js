import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getDiscoveredSkills } from "../services/discoverService";

export default function useDiscover(initialParams = {}) {
  const [search, setSearch] = useState(initialParams.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialParams.search || "");
  const [category, setCategory] = useState(initialParams.category || "");
  const [type, setType] = useState(initialParams.type || "");
  const [level, setLevel] = useState(initialParams.level || "");
  const [sort, setSort] = useState(initialParams.sort || "newest");
  const [page, setPage] = useState(initialParams.page || 1);
  const [limit] = useState(initialParams.limit || 12);

  const [rawData, setRawData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 12,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isFirstMount = useRef(true);

  // 300ms Search Input Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 whenever search or filters change (skip on first mount)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, category, type, level, sort]);

  // Main Data Fetching Effect
  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit,
        sort,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (category.trim()) params.category = category.trim();
      if (type.trim()) params.type = type.trim();
      if (level.trim()) params.level = level.trim();

      const response = await getDiscoveredSkills(params);
      setRawData(response.data || []);
      setPagination(
        response.pagination || {
          currentPage: page,
          totalPages: 1,
          totalResults: response.data?.length || 0,
          limit,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Error fetching discovery skills:", err);
      setError(
        err.response?.data?.message || "Failed to load discovered skills. Please try again."
      );
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, type, level, sort, page, limit]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Memoized User-Centric Data Transformation (Groups skills by unique user & protects against duplicates)
  const users = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];

    const userMap = new Map();

    rawData.forEach((item) => {
      if (!item || !item.userId) return;

      const userIdStr = String(item.userId);

      if (!userMap.has(userIdStr)) {
        userMap.set(userIdStr, {
          userId: item.userId,
          name: item.name || "Community Member",
          avatar: item.avatar || "",
          banner: item.banner || "",
          location: item.location || "",
          rating: item.rating || 0,
          completedSwaps: item.completedSwaps || 0,
          offeringSkills: [],
          learningSkills: [],
          _offeringNames: new Set(),
          _learningNames: new Set(),
        });
      }

      const userObj = userMap.get(userIdStr);
      const skillName = item.skill ? item.skill.trim() : "";
      if (!skillName) return;

      const skillKey = skillName.toLowerCase();

      if (item.type === "Offer") {
        if (!userObj._offeringNames.has(skillKey)) {
          userObj._offeringNames.add(skillKey);
          userObj.offeringSkills.push({
            skillId: item.skillId,
            name: skillName,
            category: item.category,
            level: item.level,
            yearsOfExperience: item.yearsOfExperience,
            description: item.description,
          });
        }
      } else if (item.type === "Learn") {
        if (!userObj._learningNames.has(skillKey)) {
          userObj._learningNames.add(skillKey);
          userObj.learningSkills.push({
            skillId: item.skillId,
            name: skillName,
            category: item.category,
            level: item.level,
            yearsOfExperience: item.yearsOfExperience,
            description: item.description,
          });
        }
      }
    });

    return Array.from(userMap.values()).map((user) => {
      const { _offeringNames, _learningNames, ...cleanUser } = user;
      return cleanUser;
    });
  }, [rawData]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setType("");
    setLevel("");
    setSort("newest");
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    search.trim() || category || type || level || (sort && sort !== "newest")
  );

  return {
    search,
    setSearch,
    debouncedSearch,
    category,
    setCategory,
    type,
    setType,
    level,
    setLevel,
    sort,
    setSort,
    page,
    setPage,
    limit,
    users,
    pagination,
    loading,
    error,
    hasActiveFilters,
    clearFilters,
    refetch: fetchSkills,
  };
}
