"use client";

import type { ReactNode } from "react";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  EyeOff,
  Handshake,
  Layers2,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DiscoveryResultBox } from "@/app/(protected)/discover/DiscoveryResultBox";
import { ConversationList } from "@/app/(protected)/messaging/ConversationList";
import { ConversationView } from "@/app/(protected)/messaging/ConversationView";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import {
  mockOpportunities,
  mockOrganisation,
  mockOrganisationMember,
  mockOrganisations,
  mockStudentProfile,
  mockUserDetailsByType,
  mockUsersByType,
  setActiveUserType,
  type MockUserType,
} from "@/mocks/mockData";
import { useAuthStore } from "@/store";
import type {
  ConversationSummary,
  Message,
  MessagingUser,
} from "@/types/messaging";
import type { UserProfile } from "@/types/shared";

type CaseKey = "request" | "confirm" | "reject" | "hide";
type MatchStatus = "idle" | "pending" | "confirmed" | "rejected";

type GuideTarget =
  | "matched-button"
  | "submit-request"
  | "confirm-button"
  | "reject-button"
  | "hide-button"
  | "keep-visible-button";

type TutorialStep = {
  title: string;
  instruction: string;
  target: GuideTarget;
  expected: string;
};

type CaseDefinition = {
  key: CaseKey;
  title: string;
  shortTitle: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;
  startSurface: "opportunity" | "messaging";
  initialStatus: MatchStatus;
  initialHidePrompt: boolean;
  steps: TutorialStep[];
};

const TASK4_CONVERSATION_ID = 9404;
const MATCH_REQUEST_ID = 7701;

const transition: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

const caseDefinitions: CaseDefinition[] = [
  {
    key: "request",
    title: "Report a match",
    shortTitle: "Report match",
    subtitle:
      "A student self-reports that they matched with an organisation inside an opportunity.",
    accent: "#1679AB",
    icon: Handshake,
    startSurface: "opportunity",
    initialStatus: "idle",
    initialHidePrompt: false,
    steps: [
      {
        title: "Choose I matched",
        instruction:
          "Click I matched on the organisation profile inside the opportunity search result.",
        target: "matched-button",
        expected:
          "A confirmation prompt opens before notifying the other party.",
      },
      {
        title: "Send the request",
        instruction:
          "Send the self-reported match request to the organisation for confirmation.",
        target: "submit-request",
        expected:
          "The organisation card shows a disabled Matching state while the request waits for confirmation.",
      },
    ],
  },
  {
    key: "confirm",
    title: "Confirm request",
    shortTitle: "Confirm",
    subtitle:
      "The other party confirms the pending match from an in-app message action.",
    accent: "#176E43",
    icon: CheckCircle2,
    startSurface: "messaging",
    initialStatus: "pending",
    initialHidePrompt: false,
    steps: [
      {
        title: "Confirm the match",
        instruction:
          "Click Confirm on the system match request inside the conversation.",
        target: "confirm-button",
        expected:
          "The match becomes confirmed and the optional hide-profile prompt appears.",
      },
      {
        title: "Choose profile visibility",
        instruction:
          "Choose whether to leave this opportunity's search pool after the match is confirmed.",
        target: "hide-button",
        expected:
          "Only this opportunity's search results change; the wider profile stays available.",
      },
    ],
  },
  {
    key: "reject",
    title: "Reject request",
    shortTitle: "Reject",
    subtitle:
      "The other party rejects the pending request, leaving no confirmed match.",
    accent: "#B91C1C",
    icon: XCircle,
    startSurface: "messaging",
    initialStatus: "pending",
    initialHidePrompt: false,
    steps: [
      {
        title: "Reject the request",
        instruction:
          "Click Reject on the same system match request when the report is incorrect.",
        target: "reject-button",
        expected:
          "The request is rejected and the conversation keeps a visible audit row.",
      },
    ],
  },
  {
    key: "hide",
    title: "Hide profile opt-in",
    shortTitle: "Hide profile",
    subtitle:
      "After a confirmed match, each user chooses whether to hide their profile from that opportunity.",
    accent: "#7A5C16",
    icon: EyeOff,
    startSurface: "messaging",
    initialStatus: "confirmed",
    initialHidePrompt: true,
    steps: [
      {
        title: "Hide profile",
        instruction:
          "Click Hide my profile to stop receiving more discovery contacts for this matched opportunity.",
        target: "hide-button",
        expected:
          "The user's search visibility changes only for MTSI 2027 Teaching Placement.",
      },
      {
        title: "Alternative path",
        instruction:
          "Reset the case and choose Keep visible to show the non-hidden path.",
        target: "keep-visible-button",
        expected:
          "The match remains confirmed while the profile stays searchable.",
      },
    ],
  },
];

const studentUser: MessagingUser = {
  id: 101,
  email: "mia.chen@example.com",
  full_name: "Mia Chen",
  user_types: ["student"],
  profile_picture_url: null,
  organisation_name: null,
  organisation_logo_url: null,
  organisation_id: null,
};

const organisationUser: MessagingUser = {
  id: 202,
  email: "sam.taylor@northside.example",
  full_name: "Sam Taylor",
  user_types: ["organisation"],
  profile_picture_url: null,
  organisation_name: "Northside Learning Collective",
  organisation_logo_url: null,
  organisation_id: 201,
};

function profileForRole(role: MockUserType): UserProfile {
  if (role === "student") return mockStudentProfile as UserProfile;

  return {
    ...mockOrganisationMember,
    organisation: mockOrganisation,
  } as UserProfile;
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function GuideMotionStyles() {
  return (
    <style>{`
      @keyframes uc-task4-hint-breathe {
        0%, 100% {
          opacity: 0.55;
          box-shadow: 0 0 0 0 rgba(113, 113, 122, 0.06);
        }
        50% {
          opacity: 1;
          box-shadow: 0 0 0 5px rgba(113, 113, 122, 0.12);
        }
      }

      .uc-task4-hint-frame {
        border: 1px solid rgba(113, 113, 122, 0.5);
        animation: uc-task4-hint-breathe 1.8s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .uc-task4-hint-frame {
          animation: none;
        }
      }
    `}</style>
  );
}

function TargetHintFrame() {
  return (
    <Box
      as="span"
      className="uc-task4-hint-frame"
      position="absolute"
      inset="-5px"
      borderRadius="10px"
      pointerEvents="none"
      aria-hidden="true"
    />
  );
}

function HintWrap({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Box position="relative" display="inline-flex" w="fit-content">
      {children}
      {active && <TargetHintFrame />}
    </Box>
  );
}

export default function OpportunityMatchTask4PrototypePage() {
  return (
    <>
      <GuideMotionStyles />
      <Suspense fallback={<Box minH="100vh" bg="#F6F8F8" />}>
        <Task4PrototypeContent />
      </Suspense>
    </>
  );
}

function Task4PrototypeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseKey = searchParams.get("case") as CaseKey | null;
  const selectedCase = caseDefinitions.find((item) => item.key === caseKey);

  function selectCase(key: CaseKey) {
    router.push(`/prototype/opportunity-match-task-4/?case=${key}`, {
      scroll: false,
    });
  }

  function backToCases() {
    router.push("/prototype/opportunity-match-task-4/", { scroll: false });
  }

  function backToPrototypeIndex() {
    router.push("/prototype/", { scroll: false });
  }

  return (
    <Box minH="100vh" bg="#F6F8F8" color="#18181B">
      {selectedCase ? (
        <GuidedTask4Case
          key={selectedCase.key}
          caseDefinition={selectedCase}
          onBack={backToCases}
          onSwitchCase={selectCase}
        />
      ) : (
        <CaseLauncher
          onSelectCase={selectCase}
          onBackToPrototype={backToPrototypeIndex}
        />
      )}
    </Box>
  );
}

function CaseLauncher({
  onSelectCase,
  onBackToPrototype,
}: {
  onSelectCase: (key: CaseKey) => void;
  onBackToPrototype: () => void;
}) {
  return (
    <Container maxW="1180px" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
      <Stack gap={6}>
        <Box>
          <Button
            size="sm"
            variant="outline"
            borderColor="#D4D4D8"
            color="#18181B"
            bg="white"
            mb={5}
            onClick={onBackToPrototype}
          >
            <HStack gap={2}>
              <ArrowLeft size={15} />
              <Text>Prototype</Text>
            </HStack>
          </Button>
          <HStack gap={2} color="#176E78" fontWeight="semibold" mb={3}>
            <Handshake size={18} />
            <Text fontSize="sm">Sprint 1 prototype</Text>
          </HStack>
          <Heading as="h1" fontSize={{ base: "30px", md: "42px" }}>
            Task 4 self-reported opportunity matches
          </Heading>
          <Text mt={3} color="#52525B" maxW="760px">
            Walk through the proposed user-reported match flow: report from an
            opportunity profile, confirm or reject in messaging, then choose
            whether to hide profile visibility after confirmation.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
          {caseDefinitions.map((item) => {
            const Icon = item.icon;
            return (
              <Box
                key={item.key}
                as="button"
                textAlign="left"
                p={5}
                bg="white"
                borderWidth="1px"
                borderColor="#E4E4E7"
                borderRadius="xl"
                transition="border-color 0.15s ease, transform 0.15s ease"
                _hover={{
                  borderColor: item.accent,
                  transform: "translateY(-2px)",
                }}
                onClick={() => onSelectCase(item.key)}
              >
                <HStack gap={3} align="flex-start">
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="lg"
                    bg={hexToRgba(item.accent, 0.1)}
                    color={item.accent}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon size={19} />
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">{item.title}</Text>
                    <Text mt={1} color="#52525B" fontSize="sm">
                      {item.subtitle}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            );
          })}
        </Grid>
      </Stack>
    </Container>
  );
}

function GuidedTask4Case({
  caseDefinition,
  onBack,
  onSwitchCase,
}: {
  caseDefinition: CaseDefinition;
  onBack: () => void;
  onSwitchCase: (key: CaseKey) => void;
}) {
  const router = useRouter();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setUserDetailsV2 = useAuthStore((state) => state.setUserDetailsV2);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const setAccessibleOpportunities = useAuthStore(
    (state) => state.setAccessibleOpportunities
  );
  const setCoordinatorOpportunities = useAuthStore(
    (state) => state.setCoordinatorOpportunities
  );
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const [stepIndex, setStepIndex] = useState(0);
  const [surface, setSurface] = useState(caseDefinition.startSurface);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(
    caseDefinition.initialStatus !== "idle"
  );
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(
    caseDefinition.initialStatus
  );
  const [hidePromptOpen, setHidePromptOpen] = useState(
    caseDefinition.initialHidePrompt
  );
  const [profileHidden, setProfileHidden] = useState(false);
  const [visibilityChoice, setVisibilityChoice] = useState<
    "unset" | "hidden" | "visible"
  >("unset");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const isComplete = stepIndex >= caseDefinition.steps.length;
  const currentStep = isComplete ? null : caseDefinition.steps[stepIndex];

  function completeTarget(target: GuideTarget) {
    if (currentStep?.target === target) {
      setStepIndex((current) =>
        Math.min(current + 1, caseDefinition.steps.length)
      );
    }
  }

  function resetCase() {
    setStepIndex(0);
    setSurface(caseDefinition.startSurface);
    setRequestDialogOpen(false);
    setRequestSubmitted(caseDefinition.initialStatus !== "idle");
    setMatchStatus(caseDefinition.initialStatus);
    setHidePromptOpen(caseDefinition.initialHidePrompt);
    setProfileHidden(false);
    setVisibilityChoice("unset");
    setBannerDismissed(false);
    setComposerText("");
  }

  function handleOpenRequestDialog() {
    setRequestDialogOpen(true);
    completeTarget("matched-button");
  }

  function handleSubmitRequest() {
    setRequestDialogOpen(false);
    setRequestSubmitted(true);
    setMatchStatus("pending");
    completeTarget("submit-request");
  }

  function handleConfirmMatch() {
    setMatchStatus("confirmed");
    setHidePromptOpen(true);
    setBannerDismissed(false);
    completeTarget("confirm-button");
  }

  function handleRejectMatch() {
    setMatchStatus("rejected");
    setHidePromptOpen(false);
    setBannerDismissed(false);
    completeTarget("reject-button");
  }

  function handleHideProfile() {
    setProfileHidden(true);
    setVisibilityChoice("hidden");
    setHidePromptOpen(false);
    completeTarget("hide-button");
  }

  function handleKeepVisible() {
    setProfileHidden(false);
    setVisibilityChoice("visible");
    setHidePromptOpen(false);
    completeTarget("keep-visible-button");
  }

  function openCurrentProjectPage() {
    const role: MockUserType =
      caseDefinition.key === "request" ? "student" : "organisation";
    const href =
      caseDefinition.key === "request"
        ? "/discover/?opp=mtsi-2027"
        : "/messaging/";

    setActiveUserType(role);
    setAuthData(`mock-token-${role}`, mockUsersByType[role]);
    setUserDetailsV2(mockUserDetailsByType[role]);
    setUserProfile(profileForRole(role));
    setAccessibleOpportunities(mockOpportunities);
    setCoordinatorOpportunities(mockOpportunities);
    setIsAuthenticated(true);
    router.push(href);
  }

  return (
    <Container maxW="1440px" py={{ base: 4, md: 6 }} px={{ base: 3, md: 6 }}>
      <Stack gap={4}>
        <Flex
          align={{ base: "flex-start", lg: "center" }}
          justify="space-between"
          gap={4}
          direction={{ base: "column", lg: "row" }}
        >
          <HStack gap={3} align="center">
            <Button
              variant="outline"
              borderColor="#D4D4D8"
              bg="white"
              borderRadius="md"
              h="38px"
              onClick={onBack}
            >
              <HStack gap={2}>
                <ArrowLeft size={16} />
                <Text>Cases</Text>
              </HStack>
            </Button>
            <Box>
              <Text fontSize="sm" color="#71717A" fontWeight="700">
                Task 4 prototype on opportunity + messaging UI
              </Text>
              <HStack gap={2} align="center">
                <Heading
                  as="h1"
                  fontSize={{ base: "26px", md: "34px" }}
                  lineHeight="1.05"
                  letterSpacing="0"
                >
                  {caseDefinition.title}
                </Heading>
                <IconButton
                  aria-label="Open current project page"
                  title={
                    caseDefinition.key === "request"
                      ? "Open current discovery page"
                      : "Open current messaging page"
                  }
                  size="sm"
                  h="30px"
                  minW="30px"
                  borderRadius="md"
                  variant="ghost"
                  color="#71717A"
                  _hover={{ bg: "#F4F4F5", color: "#176E78" }}
                  onClick={openCurrentProjectPage}
                >
                  <Layers2 size={16} />
                </IconButton>
              </HStack>
            </Box>
          </HStack>

          <HStack gap={2} wrap="wrap">
            {caseDefinitions.map((item) => (
              <Button
                key={item.key}
                size="sm"
                h="38px"
                borderRadius="md"
                bg={item.key === caseDefinition.key ? "#18393C" : "white"}
                color={item.key === caseDefinition.key ? "white" : "#18181B"}
                borderWidth="1px"
                borderColor={
                  item.key === caseDefinition.key ? "#18393C" : "#D4D4D8"
                }
                _hover={{
                  bg: item.key === caseDefinition.key ? "#10272A" : "#F8FAFC",
                }}
                onClick={() => onSwitchCase(item.key)}
              >
                {item.shortTitle}
              </Button>
            ))}
          </HStack>
        </Flex>

        <Grid
          templateColumns={{
            base: "1fr",
            xl:
              surface === "messaging"
                ? "300px minmax(0, 1fr) 320px"
                : "minmax(0, 1fr) 320px",
          }}
          gap={4}
          alignItems="stretch"
        >
          <AnimatePresence mode="wait" initial={false}>
            {surface === "opportunity" ? (
              <motion.div
                key="opportunity"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={transition}
                style={{ minWidth: 0 }}
              >
                <OpportunityWorkspace
                  currentTarget={currentStep?.target}
                  requestSubmitted={requestSubmitted}
                  matchStatus={matchStatus}
                  profileHidden={profileHidden}
                  onOpenRequestDialog={handleOpenRequestDialog}
                />
              </motion.div>
            ) : (
              <motion.div
                key="conversation-list"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={transition}
                style={{ minHeight: "690px" }}
              >
                <ConversationList
                  conversations={makeConversations(
                    matchStatus,
                    visibilityChoice
                  )}
                  selectedConversationId={TASK4_CONVERSATION_ID}
                  showArchived={showArchived}
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  onShowArchivedChange={setShowArchived}
                  onSelectConversation={() => undefined}
                  onToggleArchive={() => undefined}
                  hasAnyConversations
                  getConversationBadges={(conversation) =>
                    conversation.id === TASK4_CONVERSATION_ID ? (
                      <ConversationStatusBadge
                        status={matchStatus}
                        hidden={profileHidden}
                        visibilityChoice={visibilityChoice}
                        showVisibility={false}
                      />
                    ) : null
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {surface === "messaging" && (
            <motion.div
              key="conversation-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              style={{ minWidth: 0, minHeight: "690px" }}
            >
              <ConversationWorkspace
                currentTarget={currentStep?.target}
                composerText={composerText}
                onComposerTextChange={setComposerText}
                matchStatus={matchStatus}
                requestSubmitted={requestSubmitted}
                hidePromptOpen={hidePromptOpen}
                profileHidden={profileHidden}
                visibilityChoice={visibilityChoice}
                bannerDismissed={bannerDismissed}
                onDismissBanner={() => setBannerDismissed(true)}
                onSendMessage={() => setComposerText("")}
                onConfirmMatch={handleConfirmMatch}
                onRejectMatch={handleRejectMatch}
                onHideProfile={handleHideProfile}
                onKeepVisible={handleKeepVisible}
                onCloseHidePrompt={() => setHidePromptOpen(false)}
              />
            </motion.div>
          )}

          <Stack gap={4}>
            <BackendTracePanel
              status={matchStatus}
              requestSubmitted={requestSubmitted}
              profileHidden={profileHidden}
              visibilityChoice={visibilityChoice}
            />
            <WorkflowCoach
              steps={caseDefinition.steps}
              stepIndex={stepIndex}
              accent={caseDefinition.accent}
              onReset={resetCase}
            />
          </Stack>
        </Grid>
      </Stack>

      {requestDialogOpen && (
        <SelfReportDialog
          currentTarget={currentStep?.target}
          onClose={() => setRequestDialogOpen(false)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </Container>
  );
}

function OpportunityWorkspace({
  currentTarget,
  requestSubmitted,
  matchStatus,
  profileHidden,
  onOpenRequestDialog,
}: {
  currentTarget?: GuideTarget;
  requestSubmitted: boolean;
  matchStatus: MatchStatus;
  profileHidden: boolean;
  onOpenRequestDialog: () => void;
}) {
  const organisationResults = mockOrganisations as UserProfile[];
  const targetOrganisationId = organisationResults[0]?.id;

  function renderOrganisationAction(organisation: UserProfile) {
    if (organisation.id !== targetOrganisationId) return null;

    const label = requestSubmitted
      ? matchStatus === "pending"
        ? "Matching"
        : matchStatus === "confirmed"
          ? "Matched"
          : matchStatus === "rejected"
            ? "Rejected"
            : "Message"
      : "I matched";

    if (requestSubmitted) {
      return (
        <ButtonV2
          variant="secondary"
          flex={1}
          size="sm"
          h="36px"
          py={3}
          px={3}
          disabled
          icon={<Handshake size={15} />}
          bg="#F4F4F5"
          color="#71717A"
          border="1px solid #E4E4E7"
          cursor="not-allowed"
          _hover={{ bg: "#F4F4F5", color: "#71717A" }}
          _disabled={{
            opacity: 1,
            bg: "#F4F4F5",
            color: "#71717A",
            borderColor: "#E4E4E7",
            cursor: "not-allowed",
          }}
        >
          {label}
        </ButtonV2>
      );
    }

    return (
      <HintWrap active={currentTarget === "matched-button"}>
        <ButtonV2
          variant="primary"
          flex={1}
          size="sm"
          h="36px"
          py={3}
          px={3}
          onClick={onOpenRequestDialog}
          icon={<Handshake size={15} />}
        >
          {label}
        </ButtonV2>
      </HintWrap>
    );
  }

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="#E4E4E7"
      borderRadius="xl"
      overflow="hidden"
      minH="690px"
      p={{ base: 4, md: 5 }}
    >
      <Stack gap={4}>
        <Box
          bg="#FAFBFC"
          borderWidth="1px"
          borderColor="#E4E4E7"
          borderRadius="lg"
          px={4}
          py={3}
        >
          <Text fontSize="sm" color="#71717A">
            Current opportunity
          </Text>
          <Text fontWeight="700">MTSI 2027 Teaching Placement</Text>
        </Box>

        <DiscoveryResultBox
          results={organisationResults}
          isLoading={false}
          hasSearched
          show
          userType="organisation"
          opportunityId={mockOpportunities[0]?.id?.toString()}
          opportunitySlug={mockOpportunities[0]?.slug}
          query=""
          renderOrganisationAction={renderOrganisationAction}
        />

        {profileHidden && (
          <Box bg="#F4F4F5" borderRadius="lg" px={3} py={2}>
            <HStack gap={2} color="#52525B">
              <EyeOff size={16} />
              <Text fontSize="sm">
                Your profile is hidden from this opportunity&apos;s search
                results.
              </Text>
            </HStack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack justify="space-between" align="flex-start" gap={3}>
      <Text fontSize="sm" color="#71717A">
        {label}
      </Text>
      <Text fontSize="sm" color="#18181B" fontWeight="600" textAlign="right">
        {value}
      </Text>
    </HStack>
  );
}

function SelfReportDialog({
  currentTarget,
  onClose,
  onSubmit,
}: {
  currentTarget?: GuideTarget;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(15, 23, 42, 0.32)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={transition}
        style={{ width: "100%", maxWidth: "520px" }}
        onClick={(event) => event.stopPropagation()}
      >
        <Box bg="white" borderRadius="xl" boxShadow="xl" overflow="hidden">
          <Flex
            align="center"
            justify="space-between"
            px={5}
            py={4}
            borderBottomWidth="1px"
            borderColor="#E4E4E7"
          >
            <Box>
              <Text color="#71717A" fontSize="sm" fontWeight="700">
                Self-reported match
              </Text>
              <Heading as="h2" fontSize="22px">
                Send confirmation request?
              </Heading>
            </Box>
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X size={18} />
            </IconButton>
          </Flex>

          <Stack gap={4} px={5} py={5}>
            <Text color="#52525B" fontSize="sm" lineHeight="1.6">
              Mia Chen is reporting a match with Northside Learning Collective
              for MTSI 2027 Teaching Placement. The organisation must confirm
              before this becomes a confirmed opportunity match.
            </Text>
            <Box
              borderWidth="1px"
              borderColor="#E4E4E7"
              borderRadius="lg"
              p={3}
              bg="#FAFBFC"
            >
              <Stack gap={2} fontSize="sm">
                <InfoRow label="Requester" value="Mia Chen" />
                <InfoRow label="Recipient" value="Sam Taylor" />
                <InfoRow label="Initial status" value="Pending confirmation" />
              </Stack>
            </Box>
            <Flex justify="flex-end" gap={2}>
              <Button variant="outline" borderRadius="lg" onClick={onClose}>
                Cancel
              </Button>
              <HintWrap active={currentTarget === "submit-request"}>
                <Button
                  bg="#1679AB"
                  color="white"
                  borderRadius="lg"
                  _hover={{ bg: "#0F5F88" }}
                  onClick={onSubmit}
                >
                  Send request
                </Button>
              </HintWrap>
            </Flex>
          </Stack>
        </Box>
      </motion.div>
    </Box>
  );
}

function ConversationWorkspace({
  currentTarget,
  composerText,
  onComposerTextChange,
  matchStatus,
  requestSubmitted,
  hidePromptOpen,
  profileHidden,
  visibilityChoice,
  bannerDismissed,
  onDismissBanner,
  onSendMessage,
  onConfirmMatch,
  onRejectMatch,
  onHideProfile,
  onKeepVisible,
  onCloseHidePrompt,
}: {
  currentTarget?: GuideTarget;
  composerText: string;
  onComposerTextChange: (value: string) => void;
  matchStatus: MatchStatus;
  requestSubmitted: boolean;
  hidePromptOpen: boolean;
  profileHidden: boolean;
  visibilityChoice: "unset" | "hidden" | "visible";
  bannerDismissed: boolean;
  onDismissBanner: () => void;
  onSendMessage: () => void;
  onConfirmMatch: () => void;
  onRejectMatch: () => void;
  onHideProfile: () => void;
  onKeepVisible: () => void;
  onCloseHidePrompt: () => void;
}) {
  const messages = useMemo(() => makeMessages(), []);

  const conversation = makePrimaryConversation(matchStatus, visibilityChoice);
  const showBanner = requestSubmitted && !bannerDismissed;

  return (
    <ConversationView
      isSinglePane={false}
      conversation={conversation}
      messages={messages}
      composerText={composerText}
      onComposerTextChange={onComposerTextChange}
      onSendMessage={onSendMessage}
      onBackToList={() => undefined}
      onToggleArchive={() => undefined}
      messagesLoading={false}
      profileType="organisation"
      headerNoticeSlot={
        <ConversationStatusBadge
          status={matchStatus}
          hidden={profileHidden}
          visibilityChoice={visibilityChoice}
        />
      }
      afterHeaderSlot={
        showBanner ? (
          <MatchNoticeBar
            status={matchStatus}
            visibilityChoice={visibilityChoice}
            onDismiss={onDismissBanner}
          />
        ) : null
      }
      timelineSlotAfterMessageId="context-1"
      timelineSlot={
        <MatchRequestTimelineCard
          currentTarget={currentTarget}
          status={matchStatus}
          visibilityChoice={visibilityChoice}
          onConfirm={onConfirmMatch}
          onReject={onRejectMatch}
        />
      }
      overlaySlot={
        hidePromptOpen ? (
          <HideProfilePrompt
            currentTarget={currentTarget}
            onHide={onHideProfile}
            onKeepVisible={onKeepVisible}
            onClose={onCloseHidePrompt}
          />
        ) : null
      }
    />
  );
}

function makePrimaryConversation(
  status: MatchStatus,
  visibilityChoice: "unset" | "hidden" | "visible"
): ConversationSummary {
  return {
    id: TASK4_CONVERSATION_ID,
    otherUserId: studentUser.id,
    otherOrganisationId: null,
    otherUserTypes: ["student"],
    otherUserName: "Mia Chen",
    organisationTitle: "",
    organisationSubtitle: "Mia Chen",
    studentSubtitle: "MTSI 2027 Teaching Placement",
    lastMessagePreview:
      status === "confirmed"
        ? visibilityChoice === "hidden"
          ? "Profile hidden from MTSI 2027 search."
          : visibilityChoice === "visible"
            ? "Profile kept visible for MTSI 2027 search."
            : "Match confirmed. Choose profile visibility."
        : status === "rejected"
          ? "Match request rejected."
          : "Mia reported a match and is waiting for confirmation.",
    lastActivityAt: "2026-08-25T07:18:00Z",
    hasUnread: status === "pending",
    unreadCount: status === "pending" ? 1 : 0,
    isArchived: false,
    opportunityId: 1,
    avatar: null,
    organisationLogo: null,
    organisationMemberName: null,
    opportunityTitle: "MTSI 2027 Teaching Placement",
  };
}

function makeConversations(
  status: MatchStatus,
  visibilityChoice: "unset" | "hidden" | "visible"
): ConversationSummary[] {
  return [
    makePrimaryConversation(status, visibilityChoice),
    {
      id: 9405,
      otherUserId: 102,
      otherOrganisationId: null,
      otherUserTypes: ["student"],
      otherUserName: "Noah Patel",
      organisationTitle: "",
      organisationSubtitle: "Noah Patel",
      studentSubtitle: "Employment Access",
      lastMessagePreview: "Thanks, I will send my updated resume tonight.",
      lastActivityAt: "2026-08-24T04:30:00Z",
      hasUnread: false,
      unreadCount: 0,
      isArchived: false,
      opportunityId: 2,
      avatar: null,
      organisationLogo: null,
      organisationMemberName: null,
      opportunityTitle: "Employment Access",
    },
    {
      id: 9406,
      otherUserId: 103,
      otherOrganisationId: null,
      otherUserTypes: ["student"],
      otherUserName: "Olivia Nguyen",
      organisationTitle: "",
      organisationSubtitle: "Olivia Nguyen",
      studentSubtitle: "Entrepreneurship Internship Opportunity",
      lastMessagePreview: "Could we meet next week to discuss availability?",
      lastActivityAt: "2026-08-23T05:20:00Z",
      hasUnread: false,
      unreadCount: 0,
      isArchived: false,
      opportunityId: 3,
      avatar: null,
      organisationLogo: null,
      organisationMemberName: null,
      opportunityTitle: "Entrepreneurship Internship Opportunity",
    },
  ];
}

function makeMessages(): Message[] {
  return [
    {
      id: "context-1",
      conversationId: TASK4_CONVERSATION_ID,
      sender: "them",
      text: "Hi Sam, we have finalised the MTSI placement plan with your team. Could you confirm it on UniConnected as well?",
      createdAt: "2026-08-25T07:03:00Z",
      messanger: studentUser,
    },
  ];
}

function ConversationStatusBadge({
  status,
  hidden,
  visibilityChoice = hidden ? "hidden" : "unset",
  showVisibility = true,
}: {
  status: MatchStatus;
  hidden: boolean;
  visibilityChoice?: "unset" | "hidden" | "visible";
  showVisibility?: boolean;
}) {
  if (
    status === "confirmed" &&
    showVisibility &&
    visibilityChoice === "hidden"
  ) {
    return (
      <Badge bg="#E8F5EC" color="#176E43" borderRadius="md">
        Matched - hidden
      </Badge>
    );
  }

  if (
    status === "confirmed" &&
    showVisibility &&
    visibilityChoice === "visible"
  ) {
    return (
      <Badge bg="#E8F5EC" color="#176E43" borderRadius="md">
        Matched - visible
      </Badge>
    );
  }

  const config = {
    idle: { label: "Not reported", bg: "#F4F4F5", color: "#52525B" },
    pending: { label: "Matching", bg: "#F4F4F5", color: "#71717A" },
    confirmed: { label: "Matched", bg: "#E8F5EC", color: "#176E43" },
    rejected: { label: "Rejected", bg: "#FEF2F2", color: "#B91C1C" },
  }[status];

  return (
    <Badge bg={config.bg} color={config.color} borderRadius="md">
      {config.label}
    </Badge>
  );
}

function MatchNoticeBar({
  status,
  visibilityChoice,
  onDismiss,
}: {
  status: MatchStatus;
  visibilityChoice: "unset" | "hidden" | "visible";
  onDismiss: () => void;
}) {
  const copy =
    visibilityChoice === "hidden"
      ? "Profile hidden from MTSI 2027 search results. This only affects this opportunity."
      : visibilityChoice === "visible"
        ? "Profile kept visible in MTSI 2027 search results for now."
        : status === "confirmed"
          ? "Match confirmed. Choose whether to stay visible in this opportunity search."
          : status === "rejected"
            ? "Match request rejected. No confirmed opportunity match was created."
            : "Mia reported a match. Confirm or reject the request from the message below.";

  return (
    <Box
      borderBottomWidth="1px"
      borderColor="#CDE7E7"
      bg="#EAF7F6"
      px={4}
      py={3}
    >
      <HStack justify="space-between" align="flex-start" gap={3}>
        <HStack align="flex-start" gap={2} color="#176E78">
          <Handshake size={17} />
          <Box>
            <Text fontSize="sm" fontWeight="700">
              Opportunity match
            </Text>
            <Text fontSize="sm">{copy}</Text>
          </Box>
        </HStack>
        <IconButton
          aria-label="Dismiss match notice"
          variant="ghost"
          size="sm"
          onClick={onDismiss}
        >
          <X size={16} color="#176E78" />
        </IconButton>
      </HStack>
    </Box>
  );
}

function MatchRequestTimelineCard({
  currentTarget,
  status,
  visibilityChoice,
  onConfirm,
  onReject,
}: {
  currentTarget?: GuideTarget;
  status: MatchStatus;
  visibilityChoice: "unset" | "hidden" | "visible";
  onConfirm: () => void;
  onReject: () => void;
}) {
  const isPending = status === "pending";
  const statusCopy =
    status === "confirmed"
      ? visibilityChoice === "hidden"
        ? "Confirmed - hidden"
        : visibilityChoice === "visible"
          ? "Confirmed - visible"
          : "Confirmed"
      : status === "rejected"
        ? "Rejected"
        : "Matching";

  const resultCopy =
    status === "rejected"
      ? "Rejected. No confirmed match was created."
      : visibilityChoice === "hidden"
        ? "Confirmed. Profile hidden from this opportunity's search results."
        : visibilityChoice === "visible"
          ? "Confirmed. Profile kept visible in this opportunity's search results."
          : "Confirmed. Choose whether to stay visible in this opportunity search.";

  return (
    <Box display="flex" justifyContent="center" py={1}>
      <Box
        w="100%"
        maxW="620px"
        borderWidth="1px"
        borderColor={
          status === "rejected"
            ? "#FECACA"
            : status === "confirmed"
              ? "#B8DDC5"
              : "#B9DCDC"
        }
        bg={
          status === "rejected"
            ? "#FEF2F2"
            : status === "confirmed"
              ? "#F0FAF3"
              : "#F4FBFA"
        }
        borderRadius="xl"
        p={4}
      >
        <Stack gap={3}>
          <HStack align="flex-start" gap={3}>
            <Box
              w="34px"
              h="34px"
              borderRadius="10px"
              bg="white"
              color={
                status === "rejected"
                  ? "#B91C1C"
                  : status === "confirmed"
                    ? "#176E43"
                    : "#176E78"
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              {status === "confirmed" ? (
                <CheckCircle2 size={18} />
              ) : status === "rejected" ? (
                <XCircle size={18} />
              ) : (
                <Handshake size={18} />
              )}
            </Box>
            <Box flex={1} minW={0}>
              <HStack gap={2} flexWrap="wrap">
                <Text fontWeight="800">Match confirmation request</Text>
                <Badge
                  bg="white"
                  color={
                    status === "rejected"
                      ? "#B91C1C"
                      : status === "confirmed"
                        ? "#176E43"
                        : "#75530E"
                  }
                  borderRadius="md"
                >
                  {statusCopy}
                </Badge>
              </HStack>
              <Text mt={1} color="#374151" fontSize="sm" lineHeight="1.55">
                Mia Chen reported that she matched with Northside Learning
                Collective for MTSI 2027 Teaching Placement.
              </Text>
              <Text mt={2} color="#64706A" fontSize="xs">
                Request #{MATCH_REQUEST_ID} - self-reported by student
              </Text>
            </Box>
          </HStack>

          {isPending ? (
            <HStack justify="flex-end" gap={2} flexWrap="wrap">
              <HintWrap active={currentTarget === "reject-button"}>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="#FCA5A5"
                  color="#B91C1C"
                  borderRadius="lg"
                  bg="white"
                  _hover={{ bg: "#FEF2F2" }}
                  onClick={onReject}
                >
                  Reject
                </Button>
              </HintWrap>
              <HintWrap active={currentTarget === "confirm-button"}>
                <Button
                  size="sm"
                  bg="#176E43"
                  color="white"
                  borderRadius="lg"
                  _hover={{ bg: "#105D37" }}
                  onClick={onConfirm}
                >
                  <HStack gap={2}>
                    <Check size={15} />
                    <Text>Confirm</Text>
                  </HStack>
                </Button>
              </HintWrap>
            </HStack>
          ) : (
            <Box
              borderTopWidth="1px"
              borderColor={status === "rejected" ? "#FECACA" : "#C9E6D0"}
              pt={3}
            >
              <Text
                fontSize="sm"
                color={status === "rejected" ? "#991B1B" : "#176E43"}
                fontWeight="700"
              >
                {resultCopy}
              </Text>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function HideProfilePrompt({
  currentTarget,
  onHide,
  onKeepVisible,
  onClose,
}: {
  currentTarget?: GuideTarget;
  onHide: () => void;
  onKeepVisible: () => void;
  onClose: () => void;
}) {
  return (
    <Box
      position="absolute"
      inset={0}
      bg="rgba(248, 250, 252, 0.76)"
      zIndex={5}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={transition}
        style={{ width: "100%", maxWidth: "520px" }}
      >
        <Box bg="white" borderRadius="xl" boxShadow="xl" overflow="hidden">
          <Flex
            align="center"
            justify="space-between"
            px={5}
            py={4}
            borderBottomWidth="1px"
            borderColor="#E4E4E7"
          >
            <Box>
              <Text color="#71717A" fontSize="sm" fontWeight="700">
                Match confirmed
              </Text>
              <Heading as="h2" fontSize="22px">
                Stop showing in this opportunity search?
              </Heading>
            </Box>
            <IconButton
              aria-label="Close visibility prompt"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X size={18} />
            </IconButton>
          </Flex>

          <Stack gap={4} px={5} py={5}>
            <Text color="#52525B" fontSize="sm" lineHeight="1.6">
              Once this match is confirmed, you can leave the MTSI 2027 search
              pool so other users do not keep contacting you for the same
              opportunity. Your profile stays visible elsewhere, and this is
              optional.
            </Text>
            <Box
              borderWidth="1px"
              borderColor="#E4E4E7"
              borderRadius="lg"
              p={3}
              bg="#FAFBFC"
            >
              <Stack gap={2} fontSize="sm">
                <InfoRow
                  label="Current user"
                  value="Northside Learning Collective"
                />
                <InfoRow
                  label="Opportunity"
                  value="MTSI 2027 Teaching Placement"
                />
                <InfoRow
                  label="Default choice"
                  value="Keep visible until selected"
                />
              </Stack>
            </Box>
            <Flex justify="flex-end" gap={2} flexWrap="wrap">
              <HintWrap active={currentTarget === "keep-visible-button"}>
                <Button
                  variant="outline"
                  borderRadius="lg"
                  bg="white"
                  onClick={onKeepVisible}
                >
                  Keep visible
                </Button>
              </HintWrap>
              <HintWrap active={currentTarget === "hide-button"}>
                <Button
                  bg="#18393C"
                  color="white"
                  borderRadius="lg"
                  _hover={{ bg: "#10272A" }}
                  onClick={onHide}
                >
                  <HStack gap={2}>
                    <EyeOff size={16} />
                    <Text>Hide my profile</Text>
                  </HStack>
                </Button>
              </HintWrap>
            </Flex>
          </Stack>
        </Box>
      </motion.div>
    </Box>
  );
}

function BackendTracePanel({
  status,
  requestSubmitted,
  profileHidden,
  visibilityChoice,
}: {
  status: MatchStatus;
  requestSubmitted: boolean;
  profileHidden: boolean;
  visibilityChoice: "unset" | "hidden" | "visible";
}) {
  const rows = [
    requestSubmitted
      ? "opportunity_match: source=self_reported, status=" + status
      : "opportunity_match: no self-reported record yet",
    requestSubmitted
      ? "system_message: match_confirmation_request with Confirm/Reject actions"
      : "system_message: waiting for I matched",
    status === "confirmed"
      ? "confirmed_at set after recipient action"
      : status === "rejected"
        ? "rejected_at set after recipient action"
        : "confirmation status waiting",
    visibilityChoice === "unset"
      ? "profile_visibility: no opt-in choice yet"
      : profileHidden
        ? "profile_visibility: hidden for opportunity_id=1"
        : "profile_visibility: kept visible for opportunity_id=1",
  ];

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="#E4E4E7"
      borderRadius="xl"
      overflow="hidden"
    >
      <Box px={4} py={3} borderBottomWidth="1px" borderColor="#E4E4E7">
        <HStack justify="space-between">
          <Text fontWeight="800">Backend trace</Text>
          <Clock3 size={16} color="#71717A" />
        </HStack>
      </Box>
      <Stack gap={2} p={4}>
        {rows.map((row) => (
          <Box
            key={row}
            borderWidth="1px"
            borderColor="#E4E4E7"
            borderRadius="lg"
            bg="#FAFBFC"
            px={3}
            py={2}
          >
            <Text fontSize="12px" color="#374151" fontWeight="600">
              {row}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function WorkflowCoach({
  steps,
  stepIndex,
  accent,
  onReset,
}: {
  steps: TutorialStep[];
  stepIndex: number;
  accent: string;
  onReset: () => void;
}) {
  const isComplete = stepIndex >= steps.length;
  const step = isComplete ? steps[steps.length - 1] : steps[stepIndex];

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="#E4E4E7"
      borderRadius="xl"
      overflow="hidden"
    >
      <Box px={4} py={3} borderBottomWidth="1px" borderColor="#E4E4E7">
        <HStack justify="space-between">
          <Text color="#71717A" fontSize="sm" fontWeight="800">
            Demo guide
          </Text>
          <Text color="#71717A" fontSize="xs">
            {Math.min(stepIndex + 1, steps.length)} / {steps.length}
          </Text>
        </HStack>
      </Box>
      <Stack gap={3} p={4}>
        <HStack gap={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={isComplete ? "#176E43" : accent}
          />
          <Text fontWeight="800">
            {isComplete ? "Workflow complete" : step.title}
          </Text>
        </HStack>
        <Text color="#52525B" fontSize="sm" lineHeight="1.55">
          {isComplete ? step.expected : step.instruction}
        </Text>
        {!isComplete && (
          <Box
            borderWidth="1px"
            borderColor="#E4E4E7"
            borderRadius="lg"
            p={3}
            bg="#FAFBFC"
          >
            <Text color="#71717A" fontSize="xs" fontWeight="700">
              Expected result
            </Text>
            <Text mt={1} color="#52525B" fontSize="sm">
              {step.expected}
            </Text>
          </Box>
        )}
        <Button size="sm" variant="outline" borderRadius="lg" onClick={onReset}>
          Reset case
        </Button>
      </Stack>
    </Box>
  );
}
