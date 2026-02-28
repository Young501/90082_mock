import { Box, Progress } from "@chakra-ui/react";

const ProgressTrack = ({ progressPercent = 0, totalSteps = 5 }) => {
  return (
    <Box>
      <Progress.Root value={progressPercent} max={100} size="sm">
        <Progress.Track
          borderRadius="full"
          bg="track.100"
          h="8px"
        >
          <Progress.Range borderRadius="full" bg="profile.500" />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
};

export default ProgressTrack;
