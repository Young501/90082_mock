"use client";
import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  useDisclosure,
  Spinner,
  HStack,
  Avatar,
  SimpleGrid,
  Container,
  Image,
} from "@chakra-ui/react";
import { useMatchStudent, useParticipants } from "@/services/manage";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { MatchConfirmationModal } from "@/components/ui";
import { Participant } from "@/types/dashboard";
import ManageFilter from "@/app/(protected)/dashboard/components/ManageFilter";

const Match = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const opportunityId = searchParams.get("opportunityId");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrg, setSelectedOrg] = useState<Participant | null>(null);
  const { open, onOpen, onClose } = useDisclosure();

  const filters = useMemo(
    () => ({
      user_type: "partner",
      page,
      page_size: pageSize,
      text: search,
    }),
    [search, page, pageSize]
  );

  const { data, isLoading, error } = useParticipants(
    opportunityId || "",
    filters
  );
  const matchStudentMutation = useMatchStudent(opportunityId || "");

  const handleSelect = (org: Participant) => {
    setSelectedOrg(org);
    onOpen();
  };

  const handleMatch = async () => {
    if (!studentId || !opportunityId || !selectedOrg) return;
    try {
      await matchStudentMutation.mutateAsync({
        student_participant_id: studentId,
        partner_participant_id: selectedOrg.id.toString(),
      });
      router.push(`/dashboard/manage?manageType=student`);
    } catch (e) {
      onClose();
    }
  };

  return (
    <Box py={6} px={{ base: 4, lg: "72px" }} maxW="1512px" mx="auto" mt="126px">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <Text
          as="h1"
          fontSize={{ base: "32px", lg: "51px" }}
          fontWeight="600"
          color="#000000"
        >
          Select Matching Organisation
        </Text>
        <ManageFilter
          filters={{ text: search }}
          onFilterChange={(f) => {
            setSearch(f.text || "");
            setPage(1);
          }}
          onReset={() => {
            setSearch("");
            setPage(1);
          }}
          searchOnly
        />
        {isLoading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" />
          </Box>
        ) : error ? (
          <Text color="red.500">Failed to load organizations</Text>
        ) : (
          <>
            <Box w="100%">
              <SimpleGrid
                gap={{ base: 8, lg: 10 }}
                w="100%"
                columns={{ base: 1, lg: 2 }}
              >
                {data?.results?.map((org: Participant) => (
                  <HStack
                    key={org.id}
                    borderRadius="12px"
                    border="1px solid #2CA9DF"
                    gap={{ base: 4, lg: 6 }}
                    px={{ base: 4, lg: 10 }}
                    height={{ base: "80px", lg: "115px" }}
                    overflowX="auto"
                    onClick={() => handleSelect(org)}
                    cursor="pointer"
                    _hover={{
                      bg: "#F0F8FF",
                    }}
                  >
                    <Box
                      w={{ base: "50px", lg: "75px" }}
                      h={{ base: "50px", lg: "75px" }}
                      borderRadius="50%"
                      border="5px solid #22C45E"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Avatar.Root
                        w={{ base: "45px", lg: "70px" }}
                        h={{ base: "45px", lg: "70px" }}
                      >
                        <Avatar.Fallback
                          name={org.name || ""}
                          bg="gray.200"
                          color="gray.800"
                          fontWeight="bold"
                          fontSize="2xl"
                        />
                        {org.image_url && (
                          <Avatar.Image
                            src={org.image_url}
                            w={{ base: "45px", lg: "70px" }}
                            h={{ base: "45px", lg: "70px" }}
                          />
                        )}
                      </Avatar.Root>
                    </Box>

                    <Text
                      fontSize={{ base: "18px", lg: "28px" }}
                      fontWeight="600"
                      color="#000000"
                    >
                      {org.name}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </Box>
            <PaginationControls
              currentPage={page}
              totalPages={Math.ceil((data?.count || 0) / pageSize)}
              pageSize={pageSize}
              totalCount={data?.count || 0}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              isLoading={isLoading}
            />
          </>
        )}
        <MatchConfirmationModal
          isOpen={open}
          onClose={onClose}
          onConfirm={handleMatch}
          title="Confirm Match"
          message={`Are you sure you want to match this student to ${selectedOrg?.name}?`}
          confirmText="Confirm"
          isLoading={matchStudentMutation.isPending}
        />
      </Container>
    </Box>
  );
};

export default Match;
