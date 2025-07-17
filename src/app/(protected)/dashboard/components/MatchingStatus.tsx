import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Separator,
  Button,
} from '@chakra-ui/react';
import { Participant } from '@/types/dashboard';
import { getInitial } from '@/utils/getInitials';
import { formatDate } from '@/utils/formatDate';

interface MatchingStatusProps {
  participant: Participant | null;
}

const MatchingStatus: React.FC<MatchingStatusProps> = ({ participant }) => {
  if (!participant) {
    return (
      <Box height="100%" >
       <Text fontSize={{base: "20px", lg: "35px"}} fontWeight="600" color="#000000" textAlign="left">
        Matching Status
       </Text>
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        height="fit-content"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH={{base: "100%", lg: "400px"}}
      >
        <Text fontSize={{base: "18px", lg: "27px"}} fontWeight="400" color="#000000" maxW={{base: "100%", lg: "417px"}} textAlign="center">
        Click on a Student’s profile to 
        access matching status
        </Text>
      </Box>
      </Box>

    );
  }

  return (
    <Box
      bg="white"
      height="fit-content"
    >
      <Text fontSize={{base: "20px", lg: "35px"}} mb={{base: "20px", lg: "50px"}} fontWeight="600" color="#000000" textAlign="left">
        Matching Status
       </Text>

      <VStack align="stretch" gap={4}>

        <HStack gap={4} mb={{base: "20px", lg: "40px"}}>
          <Avatar.Root
            bg="gray.200"
            color="gray.800"
            fontWeight="bold"
            width="90px"
            height="90px"
            border="5px solid #DC2626"
            fontSize={{base: "20px", lg: "35px"}}
          >
            <Avatar.Fallback
              name={getInitial(participant.name || "")}
              bg="gray.200"
              color="gray.800"
            />
            {participant.name && (
              <Avatar.Image
                src={participant.name}
                w="90px"
                h="90px"
              />
            )}
          </Avatar.Root>
          <VStack align="start" gap={1}>
            <Text fontWeight="600" fontSize={{base: "16px", lg: "20px"}}>
              {participant.name}
            </Text>
          </VStack>
        </HStack>

        <Separator borderColor="#000000" mb={{base: "20px", lg: "40px"}} />

        <VStack align="stretch" gap={{base: "20px", lg: "40px"}} mb={{base: "20px", lg: "40px"}}>
          {participant?.messages && participant.messages.length > 0 ? (
            <VStack align="stretch" gap={2}>
              {participant.messages.map((message, index) => (
                <Box key={message.id || index}>
                  <HStack gap={6}>
                    <Box
                      w={23}
                      h={23}
                      bg="#DC2626"
                      borderRadius="full"
                    />
                    <Box>
                    <Text fontSize={{base: "18px", lg: "22px"}} fontWeight="700">
                      Student is contacted by {message.sender?.name || '-'}
                    </Text>
                    <Text fontSize={{base: "16px", lg: "20px"}} color="#000000"  fontWeight="400">
                    {formatDate(message.sent_at || "")}
                  </Text>
                  </Box>
                  </HStack>
                  

                </Box>
              ))}
            </VStack>
          ) : (
            <Text fontSize={{base: "16px", lg: "20px"}} color="#000000" fontStyle="italic">
              No messages yet
            </Text>
          )}
        </VStack>

        <Separator borderColor="#000000" mb={{base: "20px", lg: "40px"}} />

                  <HStack align="stretch" gap={3} w="100%" justifyContent="space-between">
            <Text fontWeight="600" fontSize={{base: "16px", lg: "20px"}} width="100%" color="gray.700">
              Do you want to match this student?
            </Text>
            <Button
              bg="#002157"
              color="white"
              fontSize={{base: "20px", lg: "27px"}}
              fontWeight="600"
              borderRadius="18px"
              py={{base: "10px", lg: "20px"}}
              px={{base: "20px", lg: "40px"}}
              maxW={{base: "100%", lg: "200px"}}
              disabled={participant.match_info?.is_matched || false}
            >
              Match
            </Button>
          </HStack>
      </VStack>
    </Box>
  );
};

export default MatchingStatus; 