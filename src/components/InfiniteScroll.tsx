import React, { useEffect, useRef, useCallback } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import Loader from "@/components/ui/Loader";

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  onLoadMore,
  hasMore,
  isLoading,
  children,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Attached via callback ref rather than a useEffect keyed on hasMore/isLoading so the
  // observer is only (re)created when the sentinel node itself mounts/unmounts, not on
  // every loading-state change. Recreating it mid-scroll causes an immediate re-trigger
  // for an already-intersecting sentinel, which can fire onLoadMore faster than real
  // scroll input and race page requests past the last available page.
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          onLoadMoreRef.current();
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: 0.1,
      }
    );

    observerRef.current.observe(node);
  }, []);

  return (
    <VStack align="stretch" gap={4}>
      {children}

      {hasMore && (
        <Box
          ref={sentinelRef}
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={4}
        >
          {isLoading ? (
            <VStack gap={2}>
              <Loader size="xl" color="#002157" animationDuration="0.8s" />
            </VStack>
          ) : (
            <Text fontSize="sm" color="gray.500">
              Scroll to load more
            </Text>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default InfiniteScroll;
