"use client";
import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Text,
  VStack,
  useDisclosure,
  HStack,
  SimpleGrid,
  Container,
  IconButton,
} from "@chakra-ui/react";
import { useMatchStudent, useParticipants } from "@/services/manage";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { MatchConfirmationModal } from "@/components/ui";
import { Participant } from "@/types/dashboard";
import { toast } from "react-toastify";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ArrowLeft } from "lucide-react";
import { DebouncedSearchInput } from "@/components/ui/DebouncedSearchInput";

const Match = () => {
  const router = useRouter();
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
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
      user_type: "organisation",
      page,
      accepted_status: "accepted",
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
        organisation_participant_id: selectedOrg.id.toString(),
      });
      router.back();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to match student");
      onClose();
    }
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.MATCH} />
      <Box maxW="1512px" mx="auto">
        <Container maxW="1512px" px={0} display="flex" flexDirection="column" gap={8}>

          {/* Header */}
          <HStack gap={3} align="center">
            <IconButton
              aria-label="Back"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Text as="h1" fontSize={{ base: "22px", lg: "28px" }} fontWeight="600" color="#000000">
              Select Matching Organisation
            </Text>
          </HStack>

          <DebouncedSearchInput
            placeholder="Search by name or email"
            onChange={(val) => { setSearch(val); setPage(1); }}
          />

          {/* Content */}
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={12}>
              <Loader size="lg" />
            </Box>
          ) : error ? (
            <Text color="red.500" fontSize="sm">Failed to load organisations</Text>
          ) : (
            <>
              <SimpleGrid gap={4} w="100%" columns={{ base: 1, lg: 2 }}>
                {data?.results?.map((org: Participant) => (
                  <HStack
                    key={org.id}
                    bg="white"
                    borderRadius="12px"
                    border="1px solid #E4E4E7"
                    gap={4}
                    px={5}
                    py={4}
                    onClick={() => handleSelect(org)}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ transform: "scale(1.01)", borderColor: "#D3EFEA" }}
                  >
                    <ProfileAvatar
                      src={org.image_url ?? undefined}
                      fallback={org.name ?? ""}
                      size="52px"
                      borderRadius="12px"
                    />
                    <VStack align="flex-start" gap={0}>
                      <Text fontSize="md" fontWeight="600" color="#18181B">
                        {org.name}
                      </Text>
                      {org.email && (
                        <Text fontSize="sm" color="#71717A">
                          {org.email}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                ))}
              </SimpleGrid>

              {(!data?.results || data.results.length === 0) && (
                <Box
                  bg="white"
                  border="1px solid #E4E4E7"
                  borderRadius="12px"
                  p={10}
                  textAlign="center"
                >
                  <Text color="#71717A" fontSize="sm">No organisations found</Text>
                </Box>
              )}

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
        </Container>
      </Box>

      <MatchConfirmationModal
        isOpen={open}
        onClose={onClose}
        onConfirm={handleMatch}
        title="Confirm Match"
        message={`Are you sure you want to match this student to ${selectedOrg?.name}?`}
        confirmText="Confirm"
        isLoading={matchStudentMutation.isPending}
      />
    </>
  );
};

export default Match;
