import { useState, useCallback, useEffect } from "react";
import { useParticipants } from "@/services/manage";
import { Participant, ParticipantsFilterParams } from "@/types/dashboard";

export interface ManageState {
  participants: Participant[];
  selectedParticipant: Participant | null;
  filters: ParticipantsFilterParams;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useManage(
  userType: "student" | "organisation" = "student",
  opportunityId: string = ""
) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [filters, setFilters] = useState<ParticipantsFilterParams>({
    user_type: userType,
    page: 1,
    page_size: 20,
  });
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, error, refetch } = useParticipants(
    opportunityId,
    filters
  );

  useEffect(() => {
    if (data) {
      if (filters.page === 1) {
        setParticipants(data.results);
      } else {
        setParticipants((prev) => [...prev, ...data.results]);
      }
      setHasMore(!!data.next);
    }
  }, [data, filters.page]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  }, [hasMore, isLoading]);

  const updateFilters = useCallback(
    (newFilters: Partial<ParticipantsFilterParams>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 1,
      }));
      setParticipants([]);
      setHasMore(true);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      user_type: userType,
      page: 1,
      page_size: 20,
    });
    setParticipants([]);
    setHasMore(true);
    setSelectedParticipant(null);
  }, [userType]);

  const selectParticipant = useCallback((participant: Participant) => {
    setSelectedParticipant(participant);
  }, []);

  const updateSelectedParticipant = useCallback(
    (updatedParticipant: Participant) => {
      setSelectedParticipant(updatedParticipant);
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === updatedParticipant.id ? updatedParticipant : p
        )
      );
    },
    []
  );

  const clearSelectedParticipant = useCallback(() => {
    setSelectedParticipant(null);
  }, []);

  return {
    participants,
    selectedParticipant,
    filters,
    hasMore,
    isLoading,
    error: error?.message || null,
    loadMore,
    updateFilters,
    resetFilters,
    selectParticipant,
    updateSelectedParticipant,
    clearSelectedParticipant,
    refetch,
  };
}
