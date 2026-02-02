import React, { useState, useEffect, useRef } from "react";
import { VStack, Flex, Text, HStack, Box, Separator } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { FilterFieldV2 } from "@/components/fields/FilterFieldV2";
import {
  FacetsResponse,
  DiscoveryFilters,
  FilterValue,
} from "@/types/discovery";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import IconFilter from "@/components/Icons/IconFilter";

interface DiscoveryFilterV2Props {
  facets: FacetsResponse | null;
  filters: DiscoveryFilters;
  onFilterChange: (filters: DiscoveryFilters) => void;
  onReset: () => void;
  hasFilters: boolean;
  isLoading: boolean;
}

export function DiscoveryFilterV2({
  facets,
  filters,
  onFilterChange,
  onReset,
  hasFilters,
  isLoading,
}: DiscoveryFilterV2Props) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const hasInitializedExpanded = useRef(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Initialize expanded
  useEffect(() => {
    if (!facets || hasInitializedExpanded.current) return;
    hasInitializedExpanded.current = true;

    const initial: Record<string, boolean> = {};
    let count = 0;

    // Expand first 2 sections by default
    Object.keys(facets.facets.onboarding).forEach((key) => {
      if (count < 2) {
        initial[`onboarding-${key}`] = true;
        count++;
      }
    });

    if (count < 2) {
      Object.keys(facets.facets.questionnaire).forEach((key) => {
        if (count < 2) {
          initial[`questionnaire-${key}`] = true;
          count++;
        }
      });
    }

    setExpandedSections(initial);
  }, [facets]);

  const handleFilterValueChange = (
    key: string,
    value: FilterValue | undefined,
    isQuestionnaire: boolean = false
  ) => {
    const newFilters = { ...filters };

    if (isQuestionnaire) {
      if (!newFilters.questionnaire) {
        newFilters.questionnaire = {};
      }

      if (value === undefined) {
        delete newFilters.questionnaire[key];
        // Remove questionnaire object if empty
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

    onFilterChange(newFilters);
  };

  const getFilterValue = (
    key: string,
    isQuestionnaire: boolean = false
  ): FilterValue | undefined => {
    if (isQuestionnaire) {
      return filters.questionnaire?.[key];
    }
    // Skip the questionnaire property when accessing regular filters
    if (key === "questionnaire") {
      return undefined;
    }
    return filters[key];
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

  return (
    <Box
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="#E4E4E7"
      p={{ base: 4, md: 5 }}
      w="100%"
      maxW="261px"
      h="fit-content"
    >
      <VStack align="stretch" gap={2}>
        <HStack gap={3}>
          <IconFilter />
          <Text fontSize="md" fontWeight="bold" color="#27272A">
            Filter
          </Text>
        </HStack>

        <VStack align="stretch" gap={0}>
          {allFacets.map(
            ({ key, facet, isQuestionnaire, sectionId }, index) => {
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
                      <Separator borderColor="gray.100" />
                    )}
                  </VStack>
                </Box>
              );
            }
          )}
        </VStack>

        {hasFilters && (
          <Box pt={2}>
            <Button
              variant="ghost"
              w="100%"
              onClick={onReset}
              disabled={isLoading}
              color="#3F3F46"
              fontSize="14px"
            >
              Reset all filters
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
