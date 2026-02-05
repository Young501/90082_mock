import React, { useMemo } from "react";
import { Box, HStack, Text, Button, NativeSelect } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationVisiblePages } from "../../utils/getPaginationVisiblePages";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50] as const;

export interface PaginationControlsV2Props {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLoading?: boolean;
  itemLabel?: string;
}

export function PaginationControlsV2({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasNext: hasNextProp,
  hasPrevious: hasPreviousProp,
  isLoading = false,
  itemLabel = "members",
}: PaginationControlsV2Props) {
  const hasNext = hasNextProp ?? currentPage < totalPages;
  const hasPrevious = hasPreviousProp ?? currentPage > 1;

  const { countOnPage } = useMemo(() => {
    if (totalCount === 0) return { countOnPage: 0 };
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);
    return { countOnPage: endItem - startItem + 1 };
  }, [currentPage, pageSize, totalCount]);

  const visiblePages = useMemo(
    () => getPaginationVisiblePages(currentPage, Math.max(1, totalPages)),
    [currentPage, totalPages]
  );

  return (
    <Box w="full" py={3} px={4} borderRadius="lg">
      <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
        <HStack gap={3} align="center" wrap="wrap">
          <Text fontSize="sm" color="#697488">
            Showing{" "}
            <Text as="span" fontWeight="600" color="#051036">
              {countOnPage}
            </Text>{" "}
            of{" "}
            <Text as="span" fontWeight="600" color="#051036">
              {totalCount}
            </Text>{" "}
            {itemLabel}
          </Text>
          {onPageSizeChange && (
            <HStack gap={2} align="center">
              <NativeSelect.Root
                size="sm"
                width="auto"
                minW="72px"
                disabled={isLoading}
              >
                <NativeSelect.Field
                  value={String(pageSize)}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const next = Number(e.target.value);
                    if (
                      !Number.isNaN(next) &&
                      (PAGE_SIZE_OPTIONS as readonly number[]).includes(next)
                    ) {
                      onPageSizeChange(next);
                    }
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Text fontSize="sm" color="#697488">
                per page
              </Text>
            </HStack>
          )}
        </HStack>

        <HStack gap={2} align="center">
          <Button
            size="sm"
            variant="ghost"
            p={2}
            minW="auto"
            onClick={() => hasPrevious && onPageChange(currentPage - 1)}
            disabled={!hasPrevious || isLoading}
            color="ghost"
            _disabled={{ opacity: 0.5 }}
            aria-label="Previous page"
          >
            <ChevronLeft size={4} />
          </Button>

          <HStack gap={2}>
            {visiblePages.map((page, idx) =>
              page === "ellipsis" ? (
                <Button
                  key={`ellipsis-${idx}`}
                  size="sm"
                  variant="outline"
                  minW="36px"
                  h="36px"
                  borderRadius="4px"
                  border="1px solid"
                  borderColor="#E4E4E7"
                  bg="white"
                  color="#52525B"
                  cursor="default"
                  pointerEvents="none"
                  fontSize="sm"
                >
                  …
                </Button>
              ) : (
                <Button
                  key={page}
                  size="sm"
                  minW="36px"
                  h="36px"
                  borderRadius="xl"
                  variant={page === currentPage ? "solid" : "outline"}
                  bg={page === currentPage ? "#27272A" : "white"}
                  border="1px solid"
                  borderColor={page === currentPage ? "transparent" : "#E4E4E7"}
                  color={page === currentPage ? "white" : "#27272A"}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              )
            )}
          </HStack>

          <Button
            size="sm"
            variant="ghost"
            p={2}
            minW="auto"
            onClick={() => hasNext && onPageChange(currentPage + 1)}
            disabled={!hasNext || isLoading}
            color="#27272A"
            _disabled={{ opacity: 0.5 }}
            aria-label="Next page"
          >
            <ChevronRight size={4} />
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
