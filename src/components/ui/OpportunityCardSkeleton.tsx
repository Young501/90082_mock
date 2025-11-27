import { Box, HStack, SkeletonText, Flex, Skeleton } from "@chakra-ui/react";

const OpportunityCardSkeleton: React.FC = () => (
  <Box
    borderRadius="12px"
    bg="white"
    border="1px solid #E2E8F0"
    boxShadow="0 1px 3px rgba(0,0,0,0.1)"
    overflow="hidden"
  >
    <Box p={4}>
      <Flex justify="space-between" align="start">
        <Box flex={1}>
          <Skeleton height="20px" width="70%" mb={2} />
          <SkeletonText noOfLines={2} mb={3} />
          <HStack gap={4}>
            <Skeleton height="16px" width="120px" />
            <Skeleton height="16px" width="120px" />
          </HStack>
        </Box>
        <Box>
          <Skeleton height="32px" width="100px" />
        </Box>
      </Flex>
    </Box>
  </Box>
);

export default OpportunityCardSkeleton;
