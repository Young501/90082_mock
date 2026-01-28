import React, { useState, useEffect, useRef } from "react";
import { VStack, Flex, Text, HStack, Box, Separator } from "@chakra-ui/react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FilterFieldV2 } from "@/components/fields/FilterFieldV2";
import { ProcessedField, FilterFormData } from "@/types/discovery";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { getDisplayLabel } from "@/utils/questionnaireParser";

interface DiscoveryFilterV2Props {
  fields: ProcessedField[];
  control: Control<FilterFormData>;
  watchedValues: FilterFormData;
  checkDependencies: (field: ProcessedField, values: FilterFormData) => boolean;
  hasSearched: boolean;
  isSearching: boolean;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  filterOptions: Record<
    string,
    Array<{ label: string; value: string; count: number }>
  >;
  autoSelectedFields: Record<string, string>;
}

export function DiscoveryFilterV2({
  fields,
  control,
  watchedValues,
  checkDependencies,
  hasSearched,
  isSearching,
  onSubmit,
  onReset,
  filterOptions,
  autoSelectedFields,
}: DiscoveryFilterV2Props) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const previousWatchedValuesRef = useRef<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const visibleFields = fields.filter((field) =>
    checkDependencies(field, watchedValues)
  );

  useEffect(() => {
    if (
      Object.keys(expandedSections).length === 0 &&
      visibleFields.length > 0
    ) {
      const initial: Record<string, boolean> = {};
      visibleFields.forEach((f, i) => {
        // Expand first couple by default
        initial[f.uniqueKey] = i < 3;
      });
      setExpandedSections(initial);
    }
  }, [visibleFields, expandedSections]);

  useEffect(() => {
    const watchedValuesStr = JSON.stringify(watchedValues);

    if (previousWatchedValuesRef.current === watchedValuesStr) {
      return;
    }

    const timer = setTimeout(() => {
      previousWatchedValuesRef.current = watchedValuesStr;
      onSubmit();
    }, 400);

    return () => clearTimeout(timer);
  }, [watchedValues, onSubmit]);

  return (
    <Box
      bg="white"
      borderRadius="24px"
      border="1px solid"
      borderColor="gray.200"
      p={6}
      w="100%"
      maxW="340px"
      h="fit-content"
    >
      <VStack align="stretch" gap={6}>
        <HStack gap={3} mb={2}>
          <Filter size={20} color="#1A1A1A" />
          <Text fontSize="20px" fontWeight="bold" color="#1A1A1A">
            Filter
          </Text>
        </HStack>

        <VStack align="stretch" gap={0}>
          {visibleFields.map((field, index) => {
            const label = getDisplayLabel(field, true);
            const isExpanded = expandedSections[field.uniqueKey] ?? false;

            return (
              <Box key={field.uniqueKey}>
                <VStack align="stretch" gap={0}>
                  <HStack
                    py={4}
                    cursor="pointer"
                    onClick={() => toggleSection(field.uniqueKey)}
                    justify="space-between"
                  >
                    <Text fontSize="16px" fontWeight="600" color="#4A4A4A">
                      {label}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#717171" />
                    ) : (
                      <ChevronDown size={18} color="#717171" />
                    )}
                  </HStack>

                  {isExpanded && (
                    <Box pb={4}>
                      <FilterFieldV2
                        field={field}
                        control={control}
                        isVisible={true}
                        availableOptions={filterOptions[field.field]}
                        isAutoSelected={
                          autoSelectedFields[field.field] !== undefined
                        }
                      />
                    </Box>
                  )}

                  {index < visibleFields.length - 1 && (
                    <Separator borderColor="gray.100" />
                  )}
                </VStack>
              </Box>
            );
          })}
        </VStack>

        {hasSearched && (
          <Box pt={2}>
            <Button
              variant="ghost"
              w="100%"
              onClick={onReset}
              disabled={isSearching}
              color="#717171"
              fontSize="14px"
              _hover={{ bg: "gray.50" }}
            >
              Reset all filters
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
