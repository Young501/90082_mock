import React, { useState, useEffect, useRef } from "react";
import {
  VStack,
  Text,
  HStack,
  Box,
  Separator,
  IconButton,
  Checkbox,
  Slider,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { FilterFieldV2 } from "@/components/fields/FilterFieldV2";
import type {
  FacetsResponse,
  OpportunityFilters,
  FilterValue,
  RangeFilterValue,
} from "@/types/opportunity";
import { ChevronDown, ChevronUp, X, RotateCcw } from "lucide-react";
import IconFilter from "@/components/Icons/IconFilter";

function isEmptyFilters(f: OpportunityFilters): boolean {
  const keys = Object.keys(f).filter((k) => k !== "questionnaire");
  const hasQuestionnaire =
    f.questionnaire && Object.keys(f.questionnaire).length > 0;
  return keys.length === 0 && !hasQuestionnaire;
}

interface OpportunityFiltersProps {
  facets: FacetsResponse | null;
  filters: OpportunityFilters;
  onFilterChange: (filters: OpportunityFilters) => void;
  onReset: () => void;
  hasFilters: boolean;
  isLoading: boolean;
  inDrawer?: boolean;
  onApply?: () => void;
  onClose?: () => void;
  currentDistanceKm?: number | null;
  onDistanceChange?: (distanceKm: number | null) => void;
}

export function OpportunityFilters({
  facets,
  filters,
  onFilterChange,
  onReset,
  hasFilters,
  isLoading,
  inDrawer = false,
  onApply,
  onClose,
  currentDistanceKm,
  onDistanceChange,
}: OpportunityFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});


  // Use local state, but don't force push unmounted state to parent
  const [useDistanceFilter, setUseDistanceFilter] = useState(() => {
    return currentDistanceKm !== undefined && currentDistanceKm !== null;
  });
  const [distanceKm, setDistanceKm] = useState(() => {
    return currentDistanceKm ?? 30;
  });

  // To avoid drawer unmount auto-reset, distance changes should be passed up locally or on apply
  const syncDistanceToParent = React.useCallback(() => {
    onDistanceChange?.(useDistanceFilter ? distanceKm : null);
  }, [onDistanceChange, useDistanceFilter, distanceKm]);

  // Debounce API calls when sliding in non-drawer mode
  useEffect(() => {
    if (inDrawer) return;
    const timeoutId = window.setTimeout(() => {
      syncDistanceToParent();
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [syncDistanceToParent, inDrawer]);

  // In drawer mode, keep pending filters in local state; apply only on "Apply filter"
  const [localFilters, setLocalFilters] = useState<OpportunityFilters>({});
  const prevInDrawer = useRef(false);
  useEffect(() => {
    if (inDrawer && !prevInDrawer.current) {
      setLocalFilters({
        ...filters,
        questionnaire: filters.questionnaire
          ? { ...filters.questionnaire }
          : undefined,
      } as OpportunityFilters);
    }
    prevInDrawer.current = inDrawer;
  }, [inDrawer, filters]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleFilterValueChange = (
    key: string,
    value: FilterValue | undefined,
    isQuestionnaire: boolean = false
  ) => {
    const source = inDrawer ? localFilters : filters;
    const newFilters = { ...source };

    if (isQuestionnaire) {
      if (!newFilters.questionnaire) {
        newFilters.questionnaire = {};
      }

      if (value === undefined) {
        delete newFilters.questionnaire[key];
        if (Object.keys(newFilters.questionnaire).length === 0) {
          delete newFilters.questionnaire;
        }
      } else {
        newFilters.questionnaire[key] = value;
      }
    } else {
      if (value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
    }

    if (inDrawer) {
      setLocalFilters(newFilters);
    } else {
      onFilterChange(newFilters);
    }
  };

  const effectiveFilters = inDrawer ? localFilters : filters;
  const hasAnyLocalSelection = useDistanceFilter;
  const hasLocalFilters = inDrawer ? !isEmptyFilters(localFilters) : hasFilters;

  const shouldShowResetInDrawer = hasLocalFilters || hasAnyLocalSelection;
  const shouldShowGlobalReset = hasFilters || hasAnyLocalSelection;

  useEffect(() => {
    if (!facets) return;

    const onboardingKeys = Object.keys(facets.facets.onboarding || {});
    const questionnaireKeys = Object.keys(facets.facets.questionnaire || {});
    const firstSectionId = onboardingKeys[0]
      ? `onboarding-${onboardingKeys[0]}`
      : questionnaireKeys[0]
        ? `questionnaire-${questionnaireKeys[0]}`
        : null;

    setExpandedSections((prev) => {
      const next = { ...prev };

      // keep first filter expanded
      if (firstSectionId && !next[firstSectionId]) {
        next[firstSectionId] = true;
      }

      // Onboarding filters
      Object.keys(effectiveFilters).forEach((key) => {
        if (key === "questionnaire") return;
        const value = effectiveFilters[key];
        if (value !== undefined) {
          const sectionId = `onboarding-${key}`;
          if (!next[sectionId]) {
            next[sectionId] = true;
          }
        }
      });

      // Questionnaire filters
      if (effectiveFilters.questionnaire) {
        Object.keys(effectiveFilters.questionnaire).forEach((key) => {
          const value = effectiveFilters.questionnaire?.[key];
          if (value !== undefined) {
            const sectionId = `questionnaire-${key}`;
            if (!next[sectionId]) {
              next[sectionId] = true;
            }
          }
        });
      }

      return next;
    });
  }, [facets, effectiveFilters]);

  const getFilterValue = (
    key: string,
    isQuestionnaire: boolean = false
  ): FilterValue | undefined => {
    if (isQuestionnaire) {
      return effectiveFilters.questionnaire?.[key];
    }
    if (key === "questionnaire") {
      return undefined;
    }
    return effectiveFilters[key];
  };

  const handleApplyFilter = () => {
    onFilterChange(localFilters);
    syncDistanceToParent();
    onApply?.();
  };

  const clearLocalStates = () => {
    setUseDistanceFilter(false);
  };

  useEffect(() => {
    if (!shouldShowGlobalReset && !inDrawer) {
      clearLocalStates();
    }
  }, [shouldShowGlobalReset, inDrawer]);

  const handleResetInDrawer = () => {
    setLocalFilters({});
    clearLocalStates();
    onDistanceChange?.(null);
    onReset?.();
  };

  const handleGlobalReset = () => {
    clearLocalStates();
    onDistanceChange?.(null);
    onReset?.();
  };

  if (!facets) {
    return (
      <Box
        bg="white"
        borderRadius="24px"
        border="1px solid"
        borderColor="gray.200"
        p={{ base: 4, md: 5 }}
        w="100%"
        maxW="340px"
        h="fit-content"
      >
        <VStack align="stretch" gap={6}>
          <HStack gap={3} mb={2}>
            <IconFilter />
            <Text fontSize="md" fontWeight="bold" color="#27272A">
              Filter
            </Text>
          </HStack>
          <Text fontSize="14px" color="#717171">
            Loading filters...
          </Text>
        </VStack>
      </Box>
    );
  }

  const onboardingFacets = Object.entries(facets.facets.onboarding);
  const questionnaireFacets = Object.entries(facets.facets.questionnaire);

  // Filter out facets where all options have 0 count
  const hasAvailableOptions = (facet: any) => {
    if (facet.kind === "range" || facet.kind === "boolean") {
      return true;
    }
    return facet.options.some((option: any) => option.count > 0);
  };

  const allFacets = [
    ...onboardingFacets
      .filter(([_, facet]) => hasAvailableOptions(facet))
      .map(([key, facet]) => ({
        key,
        facet,
        isQuestionnaire: false,
        sectionId: `onboarding-${key}`,
      })),
    ...questionnaireFacets
      .filter(([_, facet]) => hasAvailableOptions(facet))
      .map(([key, facet]) => ({
        key,
        facet,
        isQuestionnaire: true,
        sectionId: `questionnaire-${key}`,
      })),
  ];

  const filterContent = (
    <VStack align="stretch" gap={0}>
      <Box>
        <HStack
          pt={4}
          pb={useDistanceFilter ? 3 : "10px"}
          justify="space-between"
        >
          <Checkbox.Root
            size="sm"
            colorPalette="profile.500"
            checked={useDistanceFilter}
            onCheckedChange={(details) =>
              setUseDistanceFilter(!!details.checked)
            }
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control
              bg={useDistanceFilter ? "profile.500" : "transparent"}
              border={
                useDistanceFilter
                  ? "1px solid var(--border-100)"
                  : "1px solid #E4E4E7"
              }
            />
            <Checkbox.Label fontSize="xs" color="#3F3F46">
              Filter by distance
            </Checkbox.Label>
          </Checkbox.Root>

          {useDistanceFilter && (
            <Text fontSize="xs" color="#52525B">
              {distanceKm} km
            </Text>
          )}
        </HStack>

        {useDistanceFilter && (
          <Box pb={4}>
            <Slider.Root
              min={1}
              max={100}
              step={1}
              value={[distanceKm]}
              onValueChange={(details) => setDistanceKm(details.value[0])}
            >
              <Slider.Control>
                <Slider.Track>
                  <Slider.Range bg="profile.500" />
                </Slider.Track>

                <Slider.Thumbs borderColor="profile.500" />
              </Slider.Control>
            </Slider.Root>
          </Box>
        )}

        {allFacets.length > 0 && <Separator borderColor="#E4E4E7" />}
      </Box>
      {allFacets.map(({ key, facet, isQuestionnaire, sectionId }, index) => {
        const isExpanded = expandedSections[sectionId] ?? false;

        return (
          <Box key={sectionId}>
            <VStack align="stretch" gap={0}>
              <HStack
                pt={4}
                pb="10px"
                cursor="pointer"
                onClick={() => toggleSection(sectionId)}
                justify="space-between"
              >
                <VStack align="flex-start" gap={0}>
                  <Text fontSize="sm" fontWeight="600" color="#52525B">
                    {facet.label}
                  </Text>
                  {isQuestionnaire && (
                    <Text fontSize="xs" color="#3F3F46">
                      (questionnaire)
                    </Text>
                  )}
                </VStack>
                <Box w="16px" h="16px">
                  {isExpanded ? (
                    <ChevronUp size={16} color="#71717A" />
                  ) : (
                    <ChevronDown size={16} color="#71717A" />
                  )}
                </Box>
              </HStack>

              {isExpanded && (
                <Box pb={4}>
                  <FilterFieldV2
                    facet={facet}
                    value={getFilterValue(key, isQuestionnaire)}
                    onChange={(value) =>
                      handleFilterValueChange(key, value, isQuestionnaire)
                    }
                  />
                </Box>
              )}

              {index < allFacets.length - 1 && (
                <Separator borderColor="#E4E4E7" />
              )}
            </VStack>
          </Box>
        );
      })}
    </VStack>
  );

  if (inDrawer) {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        w="100%"
        h="85vh"
        maxH="85vh"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <Box flexShrink={0} px={{ base: 4, md: 5 }} pt={4} pb={2} bg="white">
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <IconFilter />
              <Text fontSize="md" fontWeight="bold" color="#27272A">
                Filter
              </Text>
            </HStack>
            <Box position="relative" minH={10}>
              <IconButton
                position="absolute"
                top={0}
                right={0}
                aria-label="Close"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X size={20} color="#52525B" />
              </IconButton>
            </Box>
          </HStack>
        </Box>

        <Box
          flex={1}
          minH={0}
          overflowY="auto"
          overflowX="hidden"
          px={{ base: 4, md: 5 }}
        >
          {filterContent}
        </Box>

        <Box
          flexShrink={0}
          px={{ base: 4, md: 5 }}
          pt={4}
          pb={5}
          bg="white"
          borderTopWidth="1px"
          borderTopColor="#E4E4E7"
        >
          <VStack align="stretch" gap={2}>
            <Button
              w="100%"
              bg="profile.500"
              color="white"
              onClick={handleApplyFilter}
              disabled={isLoading}
              fontSize="14px"
              h="48px"
              borderRadius="xl"
            >
              Apply filter
            </Button>
            {shouldShowResetInDrawer && (
              <Button
                variant="ghost"
                w="100%"
                onClick={handleResetInDrawer}
                disabled={isLoading}
                color="#52525B"
                _hover={{ textDecoration: "none", bg: "#F4F4F5" }}
                fontSize="14px"
                h="48px"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="#D4D4D8"
                borderStyle="solid"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <RotateCcw size={16} />
                <Text ml={2}>Reset all filters</Text>
              </Button>
            )}
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="#E4E4E7"
      p={{ base: 4, md: 5 }}
      w="100%"
      minW="261px"
      h="fit-content"
    >
      <VStack align="stretch" gap={2}>
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            <IconFilter />
            <Text fontSize="md" fontWeight="bold" color="#27272A">
              Filter
            </Text>
          </HStack>
        </HStack>

        {filterContent}

        {shouldShowGlobalReset && (
          <Box pt={2}>
            <Button
              variant="ghost"
              w="100%"
              onClick={handleGlobalReset}
              disabled={isLoading}
              color="#52525B"
              _hover={{ textDecoration: "none", bg: "#F4F4F5" }}
              fontSize="14px"
              h="40px"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="#D4D4D8"
              borderStyle="solid"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <RotateCcw size={16} />
              <Text ml={2}>Reset all filters</Text>
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
