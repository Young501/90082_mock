"use client";
import React from 'react';
import {
  Box,
  Container,
  Text,
  VStack,
  Spinner,
  Button,
} from '@chakra-ui/react';
import { useManage } from '@/hooks/useManage';
import ManageFilter from '@/app/(protected)/dashboard/components/ManageFilter';
import UserManagementCard from '@/app/(protected)/dashboard/components/UserManagementCard';
import UserMatchingStatus from '@/app/(protected)/dashboard/components/UserMatchingStatus';
import InfiniteScroll from '@/components/InfiniteScroll';
import Image from 'next/image';

const ManageOrganisationsPage = () => {
  const {
    participants,
    selectedParticipant,
    filters,
    hasMore,
    isLoading,
    error,
    loadMore,
    updateFilters,
    resetFilters,
    selectParticipant,
  } = useManage("partner");

  if (error) {
    return (
      <Box py={6} px={{ base: 4, lg: "72px" }} maxW="1512px" mx="auto" mt="126px">
        <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
          <Text as="h1" fontSize={{base: "32px", lg: "51px"}} fontWeight="600" color="#000000">
            Manage Organisations
          </Text>
          <Box
            bg="white"
            borderRadius="20px"
            p={{base: 6, lg: 12}}
            width="100%"
          >
            <VStack gap={4}>
              <Text fontSize="lg" fontWeight="bold" color="red.500">
                Error loading organisations
              </Text>
              <Text color="gray.600">{error}</Text>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box py={6} px={{ base: 4, lg: "72px" }} maxW="1512px" mx="auto" mt="126px">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <Box display="flex" justifyContent={{base: "start", lg: "space-between"}} alignItems={{base: "center", lg: "flex-start"}} flexDirection={{base: "column", lg: "row"}} gap={8}>
          <Text as="h1" fontSize={{base: "32px", lg: "51px"}} fontWeight="600" color="#000000">
            Manage Organisations
          </Text>
          <Button
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="#CFF3FF"
            color="#000000"
            height={{base: "50px", lg: "80px"}}
            fontWeight="600"
            fontSize={{base: "16px", lg: "22px"}}
            gap={2}
            px={{base: 4, lg: 10}}
            borderRadius={{base: "10px", lg: "18px"}}
            boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
            onClick={() => {/* TODO: Add organisations functionality */}}
          >
            
            <Image src="/assets/smallplusicon.svg" alt="Add Organisations" width={18} height={18} />
             Add Organisations to this list
          </Button>
        </Box>

        
        <VStack width="100%" gap={8} alignItems="flex-start" justifyContent="flex-start">

        <Box width={{base: "100%", lg: "35%"}} height="fit-content" display="flex" flexDirection="column" gap={8} maxW={{base: "100%", lg: "550px"}}
        alignItems="flex-start" justifyContent="flex-start"
        > 
        <ManageFilter
                filters={filters}
                onFilterChange={updateFilters}
                onReset={resetFilters}
              />
              </Box> 
            <Box display="flex" flexDirection={{base: "column", lg: "row"}} gap={{base: 8, lg: 0}} width="100%" justifyContent={{base: "start", lg: "space-between"}} alignItems={{base: "center", lg: "flex-start"}}>

            <Box
              bg="white"
              borderRadius="20px"
              px={{base: 6, lg: 10}}
              py={{base: 4, lg: 8}}
              boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
              height="fit-content"
            width={{base: "100%", lg: "35%"}}
            maxW={{base: "100%", lg: "550px"}}
            >
              

              <Box
                maxH="700px"
                overflowY="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {isLoading && participants.length === 0 ? (
                  <VStack gap={4} py={10}>
                    <Spinner size="xl" color="#002157" border="8px solid" borderImageSource="conic-gradient(from 111.1deg at 50% 50%, #FFFFFF 0deg, #002157 360deg)" />
                  </VStack>
                ) : participants.length === 0 ? (
                  <VStack gap={4} py={8}>
                    <Text fontSize="lg" color="gray.500">
                      No organisations found
                    </Text>
                    
                  </VStack>
                ) : (
                  <InfiniteScroll
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    isLoading={isLoading}
                  >
                    <VStack gap={3} align="stretch">
                      {participants.map((participant) => (
                        <UserManagementCard
                          key={participant.id}
                          participant={participant}
                          isSelected={selectedParticipant?.id === participant.id}
                          onClick={() => selectParticipant(participant)}
                          userType="partner"
                        />
                      ))}
                    </VStack>
                  </InfiniteScroll>
                )}
              </Box>
            </Box>

            <Box
              bg="white"
              borderRadius="20px"
              px={{base: 6, lg: 10}}
              py={{base: 4, lg: 8}}
              boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
              height="fit-content"
              width={{base: "100%", lg: "60%"}}
              maxW={{base: "100%", lg: "750px"}}
            >
              <UserMatchingStatus participant={selectedParticipant} userType="partner" />
            </Box>
        </Box>
        </VStack>

      </Container>
    </Box>
  );
};

export default ManageOrganisationsPage;