'use client';

import React from "react";
import { VStack, Heading, Flex, Text, HStack } from "@chakra-ui/react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui";
import { FilterField } from "@/components/fields/FilterField";
import { ProcessedField, FilterFormData } from "@/types/discovery";

interface DiscoveryFilterBoxProps {
  fields: ProcessedField[];
  control: Control<FilterFormData>;
  watchedValues: FilterFormData;
  checkDependencies: (field: ProcessedField, values: FilterFormData) => boolean;
  hasSearched: boolean;
  isSearching: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export function DiscoveryFilterBox({
  fields,
  control,
  watchedValues,
  checkDependencies,
  hasSearched,
  isSearching,
  onSubmit,
  onReset
}: DiscoveryFilterBoxProps) {
  return (
    <form onSubmit={onSubmit}>
      <VStack align="stretch" gap={4}>
        <Heading size="md" mb={4}>Filter Options</Heading>

        {fields.length > 0 ? (
          <Flex wrap="wrap" gap={4}>
            {fields.map(field => (
              <FilterField
                key={field.uniqueKey}
                field={field}
                control={control}
                isVisible={checkDependencies(field, watchedValues)}
              />
            ))}
          </Flex>
        ) : (
          <Text color="gray.500" fontStyle="italic">
            No filterable fields found. Make sure the target user type has fields marked with &quot;is_filter&quot;: true.
          </Text>
        )}

        <HStack justify="flex-end" mt={6}>
          {hasSearched && (
            <Button variant="ghost" onClick={onReset} disabled={isSearching}>
              Reset
            </Button>
          )}
          <Button type="submit" bg="#282F68" color="#2CA9DF" isLoading={isSearching} disabled={isSearching}>
            Search
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}