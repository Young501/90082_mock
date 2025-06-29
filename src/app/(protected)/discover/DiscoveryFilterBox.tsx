"use client";

import React, { useState } from "react";
import {
  VStack,
  Heading,
  Flex,
  Text,
  HStack,
  Box,
  Stack,
} from "@chakra-ui/react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui";
import { FilterField } from "@/components/fields/FilterField";
import { ProcessedField, FilterFormData } from "@/types/discovery";
import { searchIcon, arrowDownIcon } from "@/assets";
import Image from "next/image";

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
  onReset,
}: DiscoveryFilterBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleFields = fields.filter((field) =>
    checkDependencies(field, watchedValues)
  );
  const primaryFields = visibleFields.slice(0, 3);
  const additionalFields = visibleFields.slice(3);

  const hasAdditionalFields = additionalFields.length > 0;

  return (
    <form onSubmit={onSubmit}>
      <Flex
        direction={{ base: "column" }}
        align="stretch"
        gap={4}
        w="100%"
        bg="#D9D9D9"
        p={4}
        borderRadius="15px"
      >
        {visibleFields.length > 0 ? (
          <Box w="100%" display="flex" flexDirection="column" gap={4}>
            <Stack direction={{ base: "column", lg: "row" }} gap={4}>
              <Box flex="1" w="100%">
                <Flex
                  wrap="wrap"
                  gap={4}
                  justify="flex-start"
                  align="stretch"
                  w="100%"
                  direction={{ base: "column", lg: "row" }}
                >
                  {primaryFields.map((field) => (
                    <Box
                      key={field.uniqueKey}
                      flex={{
                        base: "1 1 100%",
                        md: "1 1 calc(50% - 8px)",
                        lg: "1 1 calc(33.333% - 11px)",
                      }}
                      // minW={{ base: "100%", md: "200px" }}
                      // maxW="250px"
                      w="100%"
                    >
                      <FilterField
                        field={field}
                        control={control}
                        isVisible={true}
                      />
                    </Box>
                  ))}
                </Flex>
              </Box>

              <Flex
                direction={{ base: "row", lg: "row" }}
                align="center"
                justify={{ base: "flex-end", lg: "flex-start" }}
                gap={2}
                minW={{ base: "auto", lg: "250px" }}
                w={{ base: "100%", lg: "auto" }}
              >
                <HStack
                  gap={2}
                  w={{ base: "auto", lg: "100%" }}
                  justify={{ base: "flex-end", lg: "stretch" }}
                >
                  {hasSearched && (
                    <Button
                      variant="ghost"
                      bg="#2CA9DF"
                      color="white"
                      onClick={onReset}
                      disabled={isSearching}
                      fontSize="16px"
                      h="40px"
                      minW="80px"
                      flex={{ base: "0 0 auto", lg: "1" }}
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    type="submit"
                    bg="#2CA9DF"
                    color="white"
                    isLoading={isSearching}
                    disabled={isSearching}
                    fontSize="16px"
                    h="40px"
                    minW="100px"
                    borderRadius="15px"
                    flex={{ base: "0 0 auto", lg: "1" }}
                  >
                    <Image
                      src={searchIcon}
                      width={16}
                      height={16}
                      alt="search"
                      style={{ marginRight: "8px" }}
                    />
                    Search
                  </Button>
                </HStack>

                {hasAdditionalFields && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    color="#282F68"
                    _hover={{ bg: "gray.50" }}
                    h="40px"
                    minW="40px"
                    p={2}
                  >
                    {isExpanded ? (
                      <Image
                        src={arrowDownIcon}
                        width={16}
                        height={16}
                        style={{ transform: "rotate(180deg)" }}
                        alt="arrowUp"
                      />
                    ) : (
                      <Image
                        src={arrowDownIcon}
                        width={16}
                        height={16}
                        alt="arrowDown"
                      />
                    )}
                  </Button>
                )}
              </Flex>
            </Stack>
            {hasAdditionalFields && isExpanded && (
              <Box w="100%">
                <Flex
                  wrap="wrap"
                  gap={4}
                  justify="flex-start"
                  align="stretch"
                  direction={{ base: "column", md: "row" }}
                >
                  {additionalFields.map((field) => (
                    <Box
                      key={field.uniqueKey}
                      flex={{
                        base: "1 1 100%",
                        md: "1 1 calc(50% - 8px)",
                        lg: "1 1 calc(25% - 12px)",
                      }}
                      w="100%"
                    >
                      <FilterField
                        field={field}
                        control={control}
                        isVisible={true}
                      />
                    </Box>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
        ) : (
          <Text color="gray.500" fontStyle="italic" w="100%">
            No filterable fields found. Make sure the target user type has
            fields marked with &quot;is_filter&quot;: true.
          </Text>
        )}
      </Flex>
    </form>
  );
}
