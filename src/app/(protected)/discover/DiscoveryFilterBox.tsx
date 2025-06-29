"use client";

import React, { useState } from "react";
import { VStack, Heading, Flex, Text, HStack, Box } from "@chakra-ui/react";
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
      <HStack
        align="stretch"
        gap={4}
        w="100%"
        justify="space-between"
        alignItems="flex-start"
        bg="#D9D9D9"
        p={2}
        borderRadius="10px"
      >
        {visibleFields.length > 0 ? (
          <Box>
            <HStack
              w="100%"
              align="stretch"
              justify="space-between"
              wrap="wrap"
            >
              <Flex wrap="no-wrap" gap={4} justify="flex-start" w="100%">
                {primaryFields.map((field) => (
                  <Box
                    key={field.uniqueKey}
                    flex={{
                      base: "1 1 100%",
                      md: "1 1 calc(50% - 8px)",
                      lg: "1 1 calc(33.333% - 11px)",
                    }}
                    minW="200px"
                    maxW={{ base: "100%", lg: "300px" }}
                  >
                    <FilterField
                      field={field}
                      control={control}
                      isVisible={true}
                    />
                  </Box>
                ))}
              </Flex>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                w="100%"
              >
                <HStack justify="flex-end" maxW="200px" w="100%" maxH="60px">
                  {hasSearched && (
                    <Button
                      variant="ghost"
                      bg="#2CA9DF"
                      onClick={onReset}
                      disabled={isSearching}
                      fontSize="20px"
                      w="100%"
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
                    fontSize="20px"
                    w="100%"
                  >
                    <Image
                      src={searchIcon}
                      width={20}
                      height={20}
                      alt="search"
                    />
                    Search
                  </Button>
                </HStack>

                {hasAdditionalFields && (
                  <Box maxW="33px" w="100%">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      color="#282F68"
                      _hover={{ bg: "gray.50" }}
                    >
                      {isExpanded ? (
                        <Image
                          src={arrowDownIcon}
                          width={20}
                          height={20}
                          style={{ transform: "rotate(180deg)" }}
                          alt="arrowDown"
                        />
                      ) : (
                        <Image
                          src={arrowDownIcon}
                          width={33}
                          height={20}
                          alt="arrowDown"
                        />
                      )}
                    </Button>
                  </Box>
                )}
              </Box>
            </HStack>
            {hasAdditionalFields && isExpanded && (
              <Box mt={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                <Flex wrap="wrap" gap={4} justify="flex-start" align="stretch">
                  {additionalFields.map((field) => (
                    <Box
                      key={field.uniqueKey}
                      flex={{
                        base: "1 1 100%",
                        md: "1 1 calc(50% - 8px)",
                        lg: "1 1 calc(33.333% - 11px)",
                      }}
                      minW="200px"
                      maxW={{ base: "100%", lg: "300px" }}
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
          <Text color="gray.500" fontStyle="italic">
            No filterable fields found. Make sure the target user type has
            fields marked with &quot;is_filter&quot;: true.
          </Text>
        )}

        {/* <HStack justify="flex-end" mt={6} maxW="200px" w="100%">
          {hasSearched && (
            <Button
              variant="ghost"
              bg="#2CA9DF"
              onClick={onReset}
              disabled={isSearching}
              fontSize="20px"
              w="100%"
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
            fontSize="20px"
            w="100%"
          >
            <Image src={searchIcon} width={20} height={20} alt="search" />
            Search
          </Button>
        </HStack> */}
      </HStack>
    </form>
  );
}
