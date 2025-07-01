import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";

const ProgressTrack = ({ progressPercent = 0, totalSteps = 5 }) => {
  const filledSteps = Math.floor((progressPercent / 100) * totalSteps);

  return (
    <Box mb={6}>
      <Text fontSize="sm" mb={3} color="gray.600">
        Progress: {progressPercent}%
      </Text>

      <Flex align="center" gap={0}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg={index < filledSteps ? "#002157" : "#C3C3C3"}
              transition="background-color 0.3s ease"
              zIndex={2}
              boxShadow="0px 4px 4px 0px #00000040"
            />

            {index < totalSteps - 1 && (
              <Box flex="1" h="15px" bg="#C3C3C3" mx={-2} position="relative">
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  h="100%"
                  bg="#002157"
                  transition="width 0.3s ease"
                  w={
                    index < filledSteps - 1
                      ? "100%"
                      : index === filledSteps - 1
                        ? `${((progressPercent / 100) * totalSteps - filledSteps) * 100}%`
                        : "0%"
                  }
                />
              </Box>
            )}
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
};

export default ProgressTrack;
