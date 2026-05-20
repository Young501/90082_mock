"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Spinner,
  Flex,
  Link,
} from "@chakra-ui/react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useRouter } from "next/navigation";
import type { HomepageOpportunity } from "@/types/homepage";
import Image from "next/image";
import IconMoreEllipsis from "@/components/Icons/IconMoreEllipsis";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { UnenrollDialog } from "@/components/ui/UnenrollDialog";
import { EditEnrollmentDialog } from "@/components/ui/EditEnrollmentDialog";
import { useEnrollmentActions } from "@/hooks/useEnrollmentActions";
import {
  useSetDefaultOpportunity,
  useClearDefaultOpportunity,
} from "@/services/dashboard";
import { toast } from "react-toastify";
import { PROFILE_TINT_COLORS, PROFILE_HOVER_COLORS } from "@/theme/theme";
import { ExternalLink, Mail } from "lucide-react";

interface MyOpportunitiesProps {
  opportunities: HomepageOpportunity[];
  userType: string;
  height?: string;
  maxH?: string;
}

function getStatusLabel(opp: HomepageOpportunity) {
  if (opp.visibility_display === "Public") {
    return "Public Opportunity";
  }
  if (opp.visibility_display === "Invite only") {
    return "Invite only";
  }
  return opp.visibility_display ?? "Opportunity";
}

function isEnrolled(opp: HomepageOpportunity) {
  return opp.enrollment_status === "enrolled";
}

interface DashboardOpportunityCardProps {
  opp: HomepageOpportunity;
  userType: string;
  onNavigate: (slug: string) => void;
}

function DashboardOpportunityCard({
  opp,
  userType,
  onNavigate,
}: DashboardOpportunityCardProps) {
  const enrolled = isEnrolled(opp);
  const setDefaultMutation = useSetDefaultOpportunity();
  const clearDefaultMutation = useClearDefaultOpportunity();
  const isDefault = opp.is_default ?? false;

  const enrollment = useEnrollmentActions({
    opportunityId: opp.id,
    questionnaire: (opp as { questionnaire?: unknown }).questionnaire,
    userType,
    isEnrolled: enrolled,
  });

  return (
    <>
      <VStack
        p={3}
        borderRadius="12px"
        border="1px solid #E4E4E7"
        w="full"
        align="stretch"
        gap={6}
      >
        <VStack align="stretch" gap={2}>
          <HStack align="flex-start" gap={3} flex={1} minW={0}>
            <Box flexShrink={0} w="48px" h="48px">
              {opp.logo_url ? (
                <Image
                  src={opp.logo_url as string}
                  alt={opp.title}
                  width={45}
                  height={45}
                />
              ) : (
                <Image
                  src="/assets/opportunityLogoPlaceholder.svg"
                  alt="Placeholder"
                  width={45}
                  height={45}
                  style={{ objectFit: "contain" }}
                />
              )}
            </Box>

            <VStack align="stretch" gap={1} flex={1} minW={0}>
              <Text fontSize="md" fontWeight="600" color="black">
                {opp.title}
              </Text>
              <HStack>
                <Text fontSize="xs" color="#173DA6" whiteSpace="nowrap">
                  {getStatusLabel(opp)}
                </Text>
                {opp.is_default && (
                  <Badge
                    bg="#F4F4F5"
                    color="#27272A"
                    fontSize={{ base: "2xs", md: "xs" }}
                    px={2}
                    py={0.5}
                    borderRadius="4px"
                    fontWeight="normal"
                  >
                    Default
                  </Badge>
                )}
              </HStack>
            </VStack>

            <HStack gap={4} flexShrink={0}>
              {enrolled && (
                <Badge
                  bg=""
                  boxShadow="0px 0px 1px 0px #116932 inset"
                  fontSize={{ base: "xs", md: "sm" }}
                  px={{ base: "6px", md: 3 }}
                  py={{ base: "2px", md: 1 }}
                  borderRadius="4px"
                  fontWeight="normal"
                  color="#116932"
                >
                  Enrolled
                </Badge>
              )}
              {enrolled ? (
                <MenuPopover
                  placement="bottom-end"
                  trigger={
                    <IconButton aria-label="More options" variant="ghost">
                      <IconMoreEllipsis color="#52525B" />
                    </IconButton>
                  }
                >
                  {enrollment.hasQuestionnaire && (
                    <Box
                      as="button"
                      w="full"
                      textAlign="left"
                      px={3}
                      py={2}
                      fontSize="sm"
                      color="#374151"
                      borderRadius="md"
                      _hover={{ bg: "#F3F4F6" }}
                      onClick={() => {
                        if (!enrollment.isResolvingEditAnswers)
                          enrollment.handleOpenEditEnrollment();
                      }}
                      opacity={enrollment.isResolvingEditAnswers ? 0.6 : 1}
                      cursor={
                        enrollment.isResolvingEditAnswers
                          ? "not-allowed"
                          : "pointer"
                      }
                      pointerEvents={
                        enrollment.isResolvingEditAnswers ? "none" : "auto"
                      }
                    >
                      {enrollment.isResolvingEditAnswers ? (
                        <HStack gap={2}>
                          <Spinner size="sm" />
                          <span>Preparing form...</span>
                        </HStack>
                      ) : (
                        "Edit Enrollment Answers"
                      )}
                    </Box>
                  )}
                  {isDefault ? (
                    <Box
                      as="button"
                      w="full"
                      textAlign="left"
                      px={3}
                      py={2}
                      fontSize="sm"
                      color="#374151"
                      borderRadius="md"
                      _hover={{ bg: "#F3F4F6" }}
                      onClick={() =>
                        clearDefaultMutation.mutate(opp.id, {
                          onSuccess: () =>
                            toast.success("Default opportunity cleared"),
                          onError: () =>
                            toast.error("Failed to clear default opportunity"),
                        })
                      }
                      opacity={
                        clearDefaultMutation.isPending ||
                        setDefaultMutation.isPending
                          ? 0.6
                          : 1
                      }
                      cursor={
                        clearDefaultMutation.isPending ||
                        setDefaultMutation.isPending
                          ? "not-allowed"
                          : "pointer"
                      }
                      pointerEvents={
                        clearDefaultMutation.isPending ||
                        setDefaultMutation.isPending
                          ? "none"
                          : "auto"
                      }
                    >
                      {clearDefaultMutation.isPending ? (
                        <HStack gap={2}>
                          <Spinner size="sm" />
                          <span>Clearing...</span>
                        </HStack>
                      ) : (
                        "Clear default"
                      )}
                    </Box>
                  ) : (
                    <Box
                      as="button"
                      w="full"
                      textAlign="left"
                      px={3}
                      py={2}
                      fontSize="sm"
                      color="#374151"
                      borderRadius="md"
                      _hover={{ bg: "#F3F4F6" }}
                      onClick={() =>
                        setDefaultMutation.mutate(opp.id, {
                          onSuccess: () =>
                            toast.success("Opportunity set as default"),
                          onError: () =>
                            toast.error("Failed to set opportunity as default"),
                        })
                      }
                      opacity={
                        setDefaultMutation.isPending ||
                        clearDefaultMutation.isPending
                          ? 0.6
                          : 1
                      }
                      cursor={
                        setDefaultMutation.isPending ||
                        clearDefaultMutation.isPending
                          ? "not-allowed"
                          : "pointer"
                      }
                      pointerEvents={
                        setDefaultMutation.isPending ||
                        clearDefaultMutation.isPending
                          ? "none"
                          : "auto"
                      }
                    >
                      {setDefaultMutation.isPending ? (
                        <HStack gap={2}>
                          <Spinner size="sm" />
                          <span>Setting...</span>
                        </HStack>
                      ) : (
                        "Set as default"
                      )}
                    </Box>
                  )}
                  <Box
                    as="button"
                    w="full"
                    textAlign="left"
                    px={3}
                    py={2}
                    fontSize="sm"
                    color="#DC2626"
                    borderRadius="md"
                    _hover={{ bg: "#FEF2F2" }}
                    onClick={enrollment.handleUnenrollClick}
                  >
                    Unenroll from Opportunity
                  </Box>
                </MenuPopover>
              ) : null}
            </HStack>
          </HStack>

          {userType === "student" && !enrolled && (
            <Text fontSize="sm" color="#A1A1AA">
              You&apos;re required to enroll first in order to access
              opportunities from this program
            </Text>
          )}

          <Text fontSize="xs" color="#52525B">
            {opp.description}
          </Text>

          {Array.isArray(opp.links) && opp.links.length > 0 && (
            <Flex flexWrap="wrap" gap={4} align="center" rowGap={1.5}>
              {opp.links.map((link, index) => {
                const href = link.url?.trim() ?? "";
                const label = link.label?.trim() ?? href;
                if (!href) return null;
                const isHttp =
                  href.startsWith("https://") || href.startsWith("http://");
                const isMailto = href.startsWith("mailto:");
                return (
                  <Link
                    key={`${href}-${index}`}
                    href={href}
                    fontSize="sm"
                    color="#52525B"
                    _hover={{ textDecoration: "underline" }}
                    {...(isHttp
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : isMailto
                        ? { target: "_self" }
                        : {})}
                  >
                    <HStack gap={2} align="center">
                      {label}
                      {isHttp && (
                        <ExternalLink
                          size={12}
                          strokeWidth={3}
                          color="#71717A"
                        />
                      )}
                      {isMailto && (
                        <Mail size={12} strokeWidth={3} color="#71717A" />
                      )}
                    </HStack>
                  </Link>
                );
              })}
            </Flex>
          )}
        </VStack>

        <VStack gap={2} flexShrink={0} w="full" align="stretch">
          <ButtonV2
            bg={
              userType === "organisation"
                ? enrolled
                  ? "#E9F7F6"
                  : "#3AADA8"
                : enrolled
                  ? "#EAF6FD"
                  : "#2AA8E0"
            }
            w="full"
            color={
              userType === "organisation"
                ? enrolled
                  ? "#1F7F7B"
                  : "#FFFFFF"
                : enrolled
                  ? "#1679AB"
                  : "#FFFFFF"
            }
            h="36px"
            border={
              enrolled
                ? userType === "organisation"
                  ? "1px solid #D3EFEA"
                  : "1px solid #D6EDFB"
                : "none"
            }
            size="sm"
            _hover={{
              bg: enrolled
                ? (PROFILE_TINT_COLORS[
                    userType as keyof typeof PROFILE_TINT_COLORS
                  ] ?? PROFILE_TINT_COLORS.student)
                : (PROFILE_HOVER_COLORS[
                    userType as keyof typeof PROFILE_HOVER_COLORS
                  ] ?? PROFILE_HOVER_COLORS.student),
            }}
            onClick={() => onNavigate(opp.slug)}
          >
            {enrolled ? "Explore Opportunity" : "Enroll"}
          </ButtonV2>
        </VStack>
      </VStack>

      <EditEnrollmentDialog
        open={enrollment.isEditEnrollmentOpen}
        onOpenChange={(details) =>
          enrollment.setIsEditEnrollmentOpen(details.open)
        }
        sections={enrollment.questionnaireSections}
        initialValues={enrollment.editAnswers}
        onAnswersChange={enrollment.handleAnswersChange}
        onSave={enrollment.handleSaveEnrollmentAnswers}
        isSaving={enrollment.updateParticipantMutation.isPending}
        formRef={enrollment.editFormRef}
      />

      <UnenrollDialog
        open={enrollment.isUnenrollDialogOpen}
        onOpenChange={(details) =>
          enrollment.setIsUnenrollDialogOpen(details.open)
        }
        onConfirm={enrollment.confirmUnenroll}
        isLoading={enrollment.updateParticipantMutation.isPending}
      />
    </>
  );
}

// TODO: Add opportunity summary

export function MyOpportunities({
  opportunities,
  userType,
  height = "fit-content",
  maxH = "551px",
}: MyOpportunitiesProps) {
  const router = useRouter();

  return (
    <Box
      bg="white"
      borderRadius="12px"
      p={{ base: 4, md: 5 }}
      border="1px solid #E4E4E7"
      width="100%"
      display="flex"
      flexDirection="column"
      gap={4}
      h="fit-content"
      minH={0}
      maxH={maxH}
    >
      <Text fontSize="md" fontWeight="600" color="black">
        My Opportunities
      </Text>

      <VStack align="stretch" gap={4} w="100%" overflowY="scroll">
        {opportunities.length === 0 ? (
          <Text color="#52525B" fontSize="sm">
            You currently don&apos;t have access to any opportunity. Contact us
            at{" "}
            <Link
              href="mailto:contactus@uniconnected.com"
              color="#173DA6"
              _hover={{ textDecoration: "underline" }}
            >
              contactus@uniconnected.com
            </Link>{" "}
            if you think this is a mistake.
          </Text>
        ) : (
          opportunities.map((opp) => (
            <DashboardOpportunityCard
              key={opp.id}
              opp={opp}
              userType={userType}
              onNavigate={(slug) => router.push(`/discover/?opp=${slug}`)}
            />
          ))
        )}
      </VStack>
    </Box>
  );
}
