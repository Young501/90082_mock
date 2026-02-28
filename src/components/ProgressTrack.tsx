import { Box, Progress } from "@chakra-ui/react";

const PROGRESS_COLOR = "#2AA8E0";
const TRACK_COLOR = "#D6EDFB";

const ProgressTrack = ({ progressPercent = 0, totalSteps = 5 }) => {
  return (
    <Box>
      <Progress.Root value={progressPercent} max={100} size="sm">
        <Progress.Track borderRadius="full" bg={TRACK_COLOR} h="8px">
          <Progress.Range borderRadius="full" bg={PROGRESS_COLOR} />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
};

export default ProgressTrack;
