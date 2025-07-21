import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import { ParticipantsFilterParams } from "@/types/dashboard";
import Image from "next/image";

interface ManageFilterProps {
  filters: ParticipantsFilterParams;
  onFilterChange: (filters: Partial<ParticipantsFilterParams>) => void;
  onReset: () => void;
  searchOnly?: boolean;
}

const ManageFilter: React.FC<ManageFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  searchOnly = false
}) => {
  const [searchText, setSearchText] = useState(filters.text || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    onFilterChange({ text: searchText });
  };

  const handleStatusChange = (status: string) => {
    const currentStatus = filters.accepted_status;
    const newStatus = currentStatus === status ? undefined : status;
    onFilterChange({ accepted_status: newStatus });
  };

  const handleReset = () => {
    setSearchText("");
    onReset();
  };

  const hasSearched = filters.text || filters.accepted_status;

  if (searchOnly) {
    return (
      <Box bg="#D9D9D9" borderRadius="15px" p={4} mb={4} width="100%">
        <Flex gap={4} w="100%" direction={{ base: "column", lg: "row" }}>
          <Input
            placeholder="Search organization name"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSearch()}
            maxW="100%"
            bg="white"
            borderRadius="24px"
          />
          <Button
            bg="#2CA9DF"
            color="white"
            onClick={handleSearch}
            fontSize="16px"
            h="40px"
            borderRadius="24px"
          >
            Search
          </Button>
          {hasSearched && (
            <Button
              fontSize="12px"
              onClick={handleReset}
              variant="ghost"
              fontWeight="600"
              px={2}
            >
              Reset
            </Button>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="#D9D9D9" borderRadius="15px" p={4} mb={4} width="100%">
      <Flex direction={{ base: "column" }} align="stretch" gap={4} w="100%">
        <Box w="100%" display="flex" flexDirection="column" gap={4}>
          <Flex
            wrap="wrap"
            gap={4}
            justify="flex-start"
            align="stretch"
            w="100%"
            direction={{ base: "column", md: "row" }}
          >
            <Box
              flex={{
                base: "1 1 100%",
                md: "1 1 calc(50% - 8px)",
                lg: "1 1 calc(25% - 12px)",
              }}
              w="100%"
            >
              <Input
                placeholder="Name or Email"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                bg="white"
                borderRadius="24px"
                size="md"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </Box>

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
                  fontSize="12px"
                  onClick={handleReset}
                  variant="ghost"
                  fontWeight="600"
                  px={0}
                >
                  Reset
                </Button>
              )}
              <Button
                bg="#2CA9DF"
                color="white"
                onClick={handleSearch}
                fontSize="16px"
                h="40px"
                flex={hasSearched ? "1" : "2"}
                borderRadius="24px"
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
                  <Image
                    src="/assets/ArrowDownIcon.svg"
                    width={16}
                    height={16}
                    style={{ transform: "rotate(180deg)" }}
                    alt="arrowUp"
                  />
                ) : (
                  <Image
                    src="/assets/ArrowDownIcon.svg"
                    width={16}
                    height={16}
                    alt="arrowDown"
                  />
                )}
              </Button>
            </Flex>
          </Flex>

          {isExpanded && (
            <Box w="100%">
              <VStack align="stretch" gap={3}>
                <VStack align="stretch" gap={2}>
                  {[
                    { value: "pending", label: "Pending" },
                    { value: "accepted", label: "Accepted" },
                    { value: "declined", label: "Declined" },
                  ].map((status) => (
                    <Box
                      key={status.value}
                      bg={
                        filters.accepted_status === status.value
                          ? "#A2DDF0"
                          : "white"
                      }
                      borderRadius="md"
                      p={3}
                      cursor="pointer"
                      onClick={() => handleStatusChange(status.value)}
                    >
                      <HStack>
                        {filters.accepted_status === status.value ? (
                          <Image
                            src="/assets/Check.svg"
                            width={16}
                            height={16}
                            alt="check"
                          />
                        ) : (
                          <Box
                            w={4}
                            h={4}
                            borderRadius="sm"
                            border="2px solid"
                            position="relative"
                          ></Box>
                        )}
                        <Text fontSize="sm">{status.label}</Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
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
                fontSize="12px"
                onClick={handleReset}
                variant="ghost"
                fontWeight="600"
                px={0}
              >
                Reset
              </Button>
            )}
            <Button
              bg="#2CA9DF"
              color="white"
              onClick={handleSearch}
              fontSize="16px"
              h="40px"
              flex={hasSearched ? "1" : "2"}
              borderRadius="24px"
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
                <Image
                  src="/assets/ArrowDownIcon.svg"
                  width={16}
                  height={16}
                  style={{ transform: "rotate(180deg)" }}
                  alt="arrowUp"
                />
              ) : (
                <Image
                  src="/assets/ArrowDownIcon.svg"
                  width={16}
                  height={16}
                  alt="arrowDown"
                />
              )}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default ManageFilter;
