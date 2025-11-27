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
  filterOptions: Record<
    string,
    Array<string | { label: string; value: string }>
  >;
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
  filterOptions,
}: DiscoveryFilterBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleFields = fields.filter((field) =>
    checkDependencies(field, watchedValues)
  );
  const primaryFields = visibleFields.slice(0, 3);
  const additionalFields = visibleFields.slice(3);
  const hasAdditionalFields = additionalFields.length > 0;

  return (
    <form
      onSubmit={(e) => {
        onSubmit(e);
      }}
    >
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
            <Flex
              wrap="wrap"
              gap={4}
              justify="flex-start"
              align="start"
              w="100%"
              direction={{ base: "column", md: "row" }}
            >
              {primaryFields.map((field) => (
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
                    availableOptions={filterOptions[field.field]}
                  />
                </Box>
              ))}

              <Flex
                direction="row"
                align="center"
                justify="flex-start"
                gap={2}
                flex={{
                  base: "none",
                  md: "1 1 calc(50% - 8px)",
                  lg: "1 1 calc(25% - 12px)",
                }}
                w={{ base: "100%", md: "auto" }}
                display={{ base: "none", md: "flex" }}
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
                    flex="1"
                    borderRadius="15px"
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
                  flex={hasSearched ? "1" : "2"}
                  borderRadius="15px"
                >
                  <Image
                    src="/assets/SearchIcon.svg"
                    width={16}
                    height={16}
                    alt="search"
                    style={{ marginRight: "8px" }}
                  />
                  Search
                </Button>

                {hasAdditionalFields && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    color="#282F68"
                    _hover={{ bg: "gray.50" }}
                    h="40px"
                    w="40px"
                    p={2}
                  >
                    {isExpanded ? (
                      <Box pos="relative" w="16px" h="16px">
                        <Image
                          src="/assets/ArrowDownIcon.svg"
                          alt="arrowUp"
                          fill
                          style={{
                            objectFit: "contain",
                            transform: "rotate(180deg)",
                          }}
                        />
                      </Box>
                    ) : (
                      <Box pos="relative" w="16px" h="16px">
                        <Image
                          src="/assets/ArrowDownIcon.svg"
                          alt="arrowDown"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </Box>
                    )}
                  </Button>
                )}
              </Flex>
            </Flex>
            {hasAdditionalFields && isExpanded && (
              <Box w="100%">
                <Flex
                  wrap="wrap"
                  gap={4}
                  justify="flex-start"
                  align="start"
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
                        availableOptions={filterOptions[field.field]}
                      />
                    </Box>
                  ))}
                </Flex>
              </Box>
            )}

            <Flex
              direction="row"
              align="center"
              justify="flex-start"
              gap={2}
              w="100%"
              display={{ base: "flex", md: "none" }}
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
                  flex="1"
                  borderRadius="15px"
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
                flex={hasSearched ? "1" : "2"}
                borderRadius="15px"
              >
                <Image
                  src="/assets/SearchIcon.svg"
                  width={16}
                  height={16}
                  alt="search"
                  style={{ marginRight: "8px" }}
                />
                Search
              </Button>

              {hasAdditionalFields && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  color="#282F68"
                  _hover={{ bg: "gray.50" }}
                  h="40px"
                  w="40px"
                  p={2}
                >
                  {isExpanded ? (
                    <Box pos="relative" w="16px" h="16px">
                      <Image
                        src="/assets/ArrowDownIcon.svg"
                        alt="arrowUp"
                        fill
                        style={{
                          objectFit: "contain",
                          transform: "rotate(180deg)",
                        }}
                      />
                    </Box>
                  ) : (
                    <Box pos="relative" w="16px" h="16px">
                      <Image
                        src="/assets/ArrowDownIcon.svg"
                        alt="arrowDown"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                  )}
                </Button>
              )}
            </Flex>
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
