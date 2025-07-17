import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  Badge,
} from '@chakra-ui/react';
import { Participant } from '@/types/dashboard';
import { getInitial } from '@/utils/getInitials';

interface StudentCardProps {
  participant: Participant;
  isSelected: boolean;
  onClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  participant,
  isSelected,
  onClick,
}) => {
  

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Pending';
      case 'Accepted':
        return 'Accepted';
      case 'Declined':
        return 'Declined';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box
      bg={isSelected ? 'rgba(0, 0, 0, 0.14)' : 'white'}
      border="1px solid #2CA9DF"
      borderRadius="md"
      p={4}
      cursor="pointer"
      onClick={onClick}
      _hover={{
        bg: isSelected ? 'blue.50' : 'gray.50',
        borderColor: 'blue.300',
      }}
      transition="all 0.2s"
    >
      <HStack gap={4}>
        <Avatar.Root
          bg="gray.200"
          width="62px"
          height="62px"
          color="gray.800"
          fontWeight="bold"
          fontSize="2xl"
          borderRadius="full"
          border="5px solid #DC2626"
        >
          <Avatar.Fallback
            name={getInitial(participant.name || "")}
            bg="gray.200"
            color="gray.800"
          />
          {participant.name && (
            <Avatar.Image
              src={participant.name}
              w="62px"
              h="62px"
            />
          )}
        </Avatar.Root>

        <VStack align="start" flex={1} gap={1}>
          <Text fontWeight="600" fontSize="md">
            {participant.name}
          </Text>
          
          <Badge
            variant="subtle"
            fontSize="12px"
          >
            {getStatusText(participant.accepted_status || "")}
          </Badge>

          <Text fontSize={{base: "12px", lg: "12px"}} color="#000000" fontWeight="400">
            {participant.match_info?.is_matched ? "Matched with " + participant.match_info?.matched_with?.name : "Not Matched"}
          </Text>

        </VStack>
      </HStack>
    </Box>
  );
};

export default StudentCard; 