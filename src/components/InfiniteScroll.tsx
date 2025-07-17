import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

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
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  return (
    <VStack align="stretch" gap={4}>
      {children}
      
      {hasMore && (
        <Box
          ref={loadingRef}
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={4}
        >
          {isLoading ? (
            <VStack gap={2}>
              <Spinner size="xl" color="#002157" border="8px solid" borderImageSource="conic-gradient(from 111.1deg at 50% 50%, #FFFFFF 0deg, #002157 360deg)" />
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