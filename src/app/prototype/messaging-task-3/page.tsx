"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  Textarea,
} from "@chakra-ui/react";
import {
  Ban,
  BellOff,
  CheckCheck,
  ChevronLeft,
  Clock3,
  Edit3,
  Flag,
  Megaphone,
  MessageSquareText,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ConversationList } from "@/app/(protected)/messaging/ConversationList";
import { ConversationView } from "@/app/(protected)/messaging/ConversationView";
import type {
  ConversationSummary,
  Message,
  MessagingUser,
} from "@/types/messaging";

type CaseKey = "read" | "mute" | "block" | "report" | "edit-delete" | "admin";

type GuideTarget =
  | "conversation-options"
  | "mark-unread"
  | "mute-button"
  | "block-button"
  | "confirm-block"
  | "unsafe-message-actions"
  | "report-menu-item"
  | "report-submit"
  | "own-message-actions"
  | "edit-button"
  | "save-edit"
  | "delete-button"
  | "send-button-context-menu"
  | "send-notice-menu-item";

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
  steps: TutorialStep[];
};

const DEMO_CONVERSATION_ID = 8103;
const DEFAULT_ADMIN_NOTICE_TEXT =
  "Platform reminder: keep contact details and placement agreements inside UniConnected until the university team confirms the next step.";

const caseDefinitions: CaseDefinition[] = [
  {
    key: "read",
    title: "Mark unread",
    shortTitle: "Read state",
    subtitle: "Verify that Mark as unread works from conversation settings.",
    accent: "#1679AB",
    icon: CheckCheck,
    steps: [
      {
        title: "Open conversation settings",
        instruction:
          "Click the highlighted header menu, or right-click the selected conversation in the inbox.",
        target: "conversation-options",
        expected:
          "The menu shows Mark as unread with mute and block actions together.",
      },
      {
        title: "Mark as unread",
        instruction: "Click Mark as unread.",
        target: "mark-unread",
        expected: "The unread badge returns on the conversation list.",
      },
    ],
  },
  {
    key: "mute",
    title: "Mute conversation",
    shortTitle: "Mute",
    subtitle:
      "Suppress notifications while keeping the conversation visible and writable.",
    accent: "#52525B",
    icon: BellOff,
    steps: [
      {
        title: "Open conversation settings",
        instruction:
          "Click the highlighted header menu, or right-click the selected conversation.",
        target: "conversation-options",
        expected:
          "Mute conversation appears beside read-state and block actions.",
      },
      {
        title: "Mute the thread",
        instruction: "Click Mute conversation. The thread remains open.",
        target: "mute-button",
        expected: "Muted state appears in the header and conversation list.",
      },
    ],
  },
  {
    key: "block",
    title: "Block user",
    shortTitle: "Block",
    subtitle:
      "Block closes the whole conversation instead of only hiding it like archive.",
    accent: "#B91C1C",
    icon: Ban,
    steps: [
      {
        title: "Open conversation settings",
        instruction:
          "Click the highlighted header menu, or right-click the selected conversation.",
        target: "conversation-options",
        expected: "Block user appears with the other conversation controls.",
      },
      {
        title: "Open block confirmation",
        instruction: "Click Block user. This is a destructive action.",
        target: "block-button",
        expected: "A confirmation dialog opens inside the chat workspace.",
      },
      {
        title: "Confirm the block",
        instruction:
          "Confirm the block. The conversation should become read-only.",
        target: "confirm-block",
        expected: "The composer locks and messages can no longer be sent.",
      },
    ],
  },
  {
    key: "report",
    title: "Report message",
    shortTitle: "Report",
    subtitle:
      "Report one message, create a moderation record, and notify admins.",
    accent: "#B64033",
    icon: Flag,
    steps: [
      {
        title: "Open message actions",
        instruction:
          "Click the highlighted message actions control beside the unsafe Organisation B message.",
        target: "unsafe-message-actions",
        expected: "The existing message actions menu opens.",
      },
      {
        title: "Choose Report message",
        instruction:
          "Click Report message in the menu. The report dialog opens in the chat workspace.",
        target: "report-menu-item",
        expected: "Category options and an optional details field are shown.",
      },
      {
        title: "Submit the report",
        instruction:
          "Select a category, optionally add details, then submit the report.",
        target: "report-submit",
        expected: "A moderation report row is created and admins are notified.",
      },
    ],
  },
  {
    key: "edit-delete",
    title: "Edit / delete own message",
    shortTitle: "Edit + delete",
    subtitle:
      "Edit your own sent message, then soft-delete it while preserving the timeline.",
    accent: "#7A5C16",
    icon: Edit3,
    steps: [
      {
        title: "Open your message actions",
        instruction:
          "Click the highlighted actions control beside your sent message.",
        target: "own-message-actions",
        expected: "Edit and Delete are available in the existing menu.",
      },
      {
        title: "Choose Edit",
        instruction: "Click Edit. The message becomes editable in place.",
        target: "edit-button",
        expected: "An inline edit state appears inside the message bubble.",
      },
      {
        title: "Save the edit",
        instruction:
          "Save the revised copy. The message keeps an edited label.",
        target: "save-edit",
        expected: "The edited content replaces the old copy.",
      },
      {
        title: "Open actions again",
        instruction:
          "Open the same message actions menu again to access Delete.",
        target: "own-message-actions",
        expected: "Delete is ready for the same sent message.",
      },
      {
        title: "Delete the message",
        instruction:
          "Click Delete message. This should be a soft delete placeholder.",
        target: "delete-button",
        expected: "The message remains as a deleted-message placeholder.",
      },
    ],
  },
  {
    key: "admin",
    title: "Admin notice in group chat",
    shortTitle: "Admin messages",
    subtitle:
      "Send an admin notice into a group conversation and keep the notice bar visible until dismissed.",
    accent: "#176E78",
    icon: Megaphone,
    steps: [
      {
        title: "Open Send menu",
        instruction:
          "Right-click the Send button. Admin users get an extra Send admin notice action from the composer.",
        target: "send-button-context-menu",
        expected:
          "A small composer menu opens with Send admin notice available.",
      },
      {
        title: "Send admin notice",
        instruction:
          "Click Send admin notice. The notice is posted at the bottom of the group chat.",
        target: "send-notice-menu-item",
        expected:
          "The notice bar appears below the header, then two group replies arrive after the notice row.",
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
  organisation_id: 402,
};

const groupPeerUser: MessagingUser = {
  id: 204,
  email: "riley.morgan@metrostem.example",
  full_name: "Riley Morgan",
  user_types: ["organisation"],
  profile_picture_url: null,
  organisation_name: "Metro STEM Hub",
  organisation_logo_url: null,
  organisation_id: 404,
};

const adminUser: MessagingUser = {
  id: 1,
  email: "admin@uniconnected.example",
  full_name: "UniConnected Admin",
  user_types: ["organisation"],
  profile_picture_url: null,
  organisation_name: "UniConnected",
  organisation_logo_url: null,
  organisation_id: null,
};

const transition: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const bigint = parseInt(
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value,
    16
  );
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function TargetHintFrame() {
  return (
    <Box
      as="span"
      className="uc-target-hint-frame"
      position="absolute"
      inset="-5px"
      borderRadius="10px"
      pointerEvents="none"
      aria-hidden="true"
    />
  );
}

function GuideMotionStyles() {
  return (
    <style>{`
      @keyframes uc-target-hint-breathe {
        0%, 100% {
          opacity: 0.56;
          box-shadow: 0 0 0 0 rgba(113, 113, 122, 0.08);
        }
        50% {
          opacity: 1;
          box-shadow: 0 0 0 5px rgba(113, 113, 122, 0.12);
        }
      }

      .uc-target-hint-frame {
        border: 1px solid rgba(113, 113, 122, 0.48);
        animation: uc-target-hint-breathe 1.8s ease-in-out infinite;
      }

      .uc-target-hint-control {
        outline: 1px solid rgba(113, 113, 122, 0.48);
        outline-offset: 5px;
        animation: uc-target-hint-control-breathe 1.8s ease-in-out infinite;
      }

      @keyframes uc-target-hint-control-breathe {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(113, 113, 122, 0.08);
        }
        50% {
          box-shadow: 0 0 0 5px rgba(113, 113, 122, 0.12);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .uc-target-hint-frame,
        .uc-target-hint-control {
          animation: none;
        }
      }
    `}</style>
  );
}

function getInitialComposerText(key: CaseKey) {
  return key === "admin" ? DEFAULT_ADMIN_NOTICE_TEXT : "";
}

export default function MessagingTask3PrototypePage() {
  return (
    <>
      <GuideMotionStyles />
      <Suspense fallback={<Box minH="100vh" bg="#F6F8F8" color="#18181B" />}>
        <MessagingTask3PrototypeContent />
      </Suspense>
    </>
  );
}

function MessagingTask3PrototypeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseKey = searchParams.get("case") as CaseKey | null;
  const selectedCase = caseDefinitions.find((item) => item.key === caseKey);

  function selectCase(key: CaseKey) {
    router.push(`/prototype/messaging-task-3/?case=${key}`, { scroll: false });
  }

  function backToCases() {
    router.push("/prototype/messaging-task-3/", { scroll: false });
  }

  return (
    <Box minH="100vh" bg="#F6F8F8" color="#18181B">
      {selectedCase ? (
        <GuidedMessagingCase
          caseDefinition={selectedCase}
          onBack={backToCases}
          onSwitchCase={selectCase}
        />
      ) : (
        <CaseLauncher onSelectCase={selectCase} />
      )}
    </Box>
  );
}

function CaseLauncher({
  onSelectCase,
}: {
  onSelectCase: (key: CaseKey) => void;
}) {
  return (
    <Container maxW="1180px" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
      <Stack gap={6}>
        <Box>
          <HStack gap={2} color="#1679AB" fontWeight="semibold" mb={3}>
            <MessageSquareText size={18} />
            <Text fontSize="sm">Sprint 1 prototype</Text>
          </HStack>
          <Heading as="h1" fontSize={{ base: "30px", md: "42px" }}>
            Task 3 messaging workflows
          </Heading>
          <Text mt={3} color="#52525B" maxW="720px">
            Each case opens the current UniConnected messaging screen with the
            proposed conversation management and moderation controls layered in.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
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

function GuidedMessagingCase({
  caseDefinition,
  onBack,
  onSwitchCase,
}: {
  caseDefinition: CaseDefinition;
  onBack: () => void;
  onSwitchCase: (key: CaseKey) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [unread, setUnread] = useState(false);
  const [muted, setMuted] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState(
    "Off-platform contact request"
  );
  const [reportDetail, setReportDetail] = useState("");
  const [reported, setReported] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [editedMessageText, setEditedMessageText] = useState(
    "Yes. Monday and Thursday are best for me. I will upload my availability note today."
  );
  const [editDraft, setEditDraft] = useState(editedMessageText);
  const [adminBanner, setAdminBanner] = useState(false);
  const [adminInlineMessage, setAdminInlineMessage] = useState(false);
  const [adminNoticeDismissed, setAdminNoticeDismissed] = useState(false);
  const [adminReplyCount, setAdminReplyCount] = useState(0);
  const [adminNoticeText, setAdminNoticeText] = useState(
    DEFAULT_ADMIN_NOTICE_TEXT
  );
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [sendNoticeMenuPosition, setSendNoticeMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const adminReplyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isComplete = stepIndex >= caseDefinition.steps.length;
  const currentStep = isComplete ? null : caseDefinition.steps[stepIndex];

  function clearAdminReplyTimers() {
    adminReplyTimersRef.current.forEach((timer) => clearTimeout(timer));
    adminReplyTimersRef.current = [];
  }

  useEffect(() => {
    clearAdminReplyTimers();
    setStepIndex(0);
    setSearchTerm("");
    setShowArchived(false);
    setComposerText(getInitialComposerText(caseDefinition.key));
    setUnread(false);
    setMuted(false);
    setBlockConfirmOpen(false);
    setBlocked(false);
    setReportDialogOpen(false);
    setReportCategory("Off-platform contact request");
    setReportDetail("");
    setReported(false);
    setEditing(false);
    setEdited(false);
    setDeleted(false);
    setEditedMessageText(
      "Yes. Monday and Thursday are best for me. I will upload my availability note today."
    );
    setEditDraft(
      "Yes. Monday and Thursday are best for me. I will upload my availability note today."
    );
    setAdminBanner(false);
    setAdminInlineMessage(false);
    setAdminNoticeDismissed(false);
    setAdminReplyCount(0);
    setAdminNoticeText(DEFAULT_ADMIN_NOTICE_TEXT);
    setContextMenuPosition(null);
    setSendNoticeMenuPosition(null);
  }, [caseDefinition.key]);

  useEffect(() => () => clearAdminReplyTimers(), []);

  useEffect(() => {
    const sendButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Send message"]'
    );

    if (
      caseDefinition.key === "admin" &&
      currentStep?.target === "send-button-context-menu"
    ) {
      sendButton?.classList.add("uc-target-hint-control");
    }

    return () => {
      sendButton?.classList.remove("uc-target-hint-control");
    };
  }, [caseDefinition.key, currentStep?.target]);

  useEffect(() => {
    if (caseDefinition.key !== "admin" || blocked) return;

    function handleSendButtonContextMenu(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const sendButton = target?.closest('button[aria-label="Send message"]');

      if (!sendButton) return;

      event.preventDefault();
      setSendNoticeMenuPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (currentStep?.target === "send-button-context-menu") {
        setStepIndex((current) =>
          Math.min(current + 1, caseDefinition.steps.length)
        );
      }
    }

    document.addEventListener("contextmenu", handleSendButtonContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleSendButtonContextMenu);
    };
  }, [
    blocked,
    caseDefinition.key,
    caseDefinition.steps.length,
    currentStep?.target,
  ]);

  function isTarget(target: GuideTarget) {
    return currentStep?.target === target;
  }

  function completeTarget(target: GuideTarget) {
    if (isTarget(target)) {
      setStepIndex((current) =>
        Math.min(current + 1, caseDefinition.steps.length)
      );
    }
  }

  function openConversationActions() {
    completeTarget("conversation-options");
  }

  function handleReadStateAction() {
    if (unread) {
      setUnread(false);
    } else {
      setUnread(true);
      completeTarget("mark-unread");
    }
    setContextMenuPosition(null);
  }

  function handleToggleMute() {
    setMuted((current) => !current);
    completeTarget("mute-button");
    setContextMenuPosition(null);
  }

  function handleBlockAction() {
    if (blocked) {
      setBlocked(false);
      setBlockConfirmOpen(false);
    } else {
      setBlockConfirmOpen(true);
      completeTarget("block-button");
    }
    setContextMenuPosition(null);
  }

  function handleSendNotice() {
    clearAdminReplyTimers();
    setAdminNoticeText(composerText.trim() || DEFAULT_ADMIN_NOTICE_TEXT);
    setAdminBanner(true);
    setAdminInlineMessage(true);
    setAdminNoticeDismissed(false);
    setAdminReplyCount(0);
    setComposerText("");
    setSendNoticeMenuPosition(null);
    completeTarget("send-notice-menu-item");

    adminReplyTimersRef.current = [
      setTimeout(() => setAdminReplyCount(1), 700),
      setTimeout(() => setAdminReplyCount(2), 1350),
    ];
  }

  function handleSendRegularMessage() {
    if (blocked) return;
    setComposerText("");
    setSendNoticeMenuPosition(null);
  }

  function resetCase() {
    clearAdminReplyTimers();
    setStepIndex(0);
    setComposerText(getInitialComposerText(caseDefinition.key));
    setUnread(false);
    setMuted(false);
    setBlockConfirmOpen(false);
    setBlocked(false);
    setReportDialogOpen(false);
    setReportCategory("Off-platform contact request");
    setReportDetail("");
    setReported(false);
    setEditing(false);
    setEdited(false);
    setDeleted(false);
    setEditedMessageText(
      "Yes. Monday and Thursday are best for me. I will upload my availability note today."
    );
    setEditDraft(
      "Yes. Monday and Thursday are best for me. I will upload my availability note today."
    );
    setAdminBanner(false);
    setAdminInlineMessage(false);
    setAdminNoticeDismissed(false);
    setAdminReplyCount(0);
    setAdminNoticeText(DEFAULT_ADMIN_NOTICE_TEXT);
    setContextMenuPosition(null);
    setSendNoticeMenuPosition(null);
  }

  const selectedConversation = useMemo<ConversationSummary>(() => {
    const isAdminCase = caseDefinition.key === "admin";

    return {
      id: DEMO_CONVERSATION_ID,
      otherUserId: organisationUser.id,
      otherOrganisationId: organisationUser.organisation_id,
      otherUserTypes: organisationUser.user_types,
      organisationTitle: isAdminCase
        ? "MTSI Placement Group"
        : "Northside Learning Collective",
      otherUserName: isAdminCase ? "MTSI Placement Group" : "Sam Taylor",
      organisationSubtitle: isAdminCase
        ? "Mia Chen, Sam Taylor, Riley Morgan"
        : "Sam Taylor",
      studentSubtitle: "MTSI 2027 placement pool",
      lastMessagePreview: blocked
        ? "Conversation blocked"
        : isAdminCase && adminReplyCount >= 2
          ? "Sam: Thanks, we will keep everything in the group."
          : isAdminCase && adminInlineMessage
            ? "UniConnected Admin notice sent"
            : "Could you also send your personal phone number?",
      lastActivityAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      hasUnread: unread,
      unreadCount: unread ? 1 : 0,
      isArchived: false,
      opportunityId: 77,
      avatar: null,
      organisationLogo: null,
      organisationMemberName: isAdminCase ? "Group chat" : "Sam Taylor",
      opportunityTitle: "MTSI 2027 placement pool",
      isMuted: muted,
      isBlocked: blocked,
    };
  }, [
    adminInlineMessage,
    adminReplyCount,
    blocked,
    caseDefinition.key,
    muted,
    unread,
  ]);

  const conversations = useMemo<ConversationSummary[]>(
    () => [
      selectedConversation,
      {
        id: 8104,
        otherUserId: 204,
        otherOrganisationId: 404,
        otherUserTypes: ["organisation"],
        organisationTitle: "Metro STEM Hub",
        otherUserName: "Riley Morgan",
        organisationSubtitle: "Riley Morgan",
        studentSubtitle: "Engineering outreach assistant",
        lastMessagePreview: "Thanks, we will review your profile this week.",
        lastActivityAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        hasUnread: false,
        unreadCount: 0,
        isArchived: false,
        opportunityId: 78,
        avatar: null,
        organisationLogo: null,
        organisationMemberName: "Riley Morgan",
        opportunityTitle: "Engineering outreach assistant",
      },
      {
        id: 8105,
        otherUserId: 205,
        otherOrganisationId: 405,
        otherUserTypes: ["organisation"],
        organisationTitle: "University Careers",
        otherUserName: "Aisha Patel",
        organisationSubtitle: "Aisha Patel",
        studentSubtitle: "Placement briefing",
        lastMessagePreview: "Reminder: placement briefing on Friday.",
        lastActivityAt: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        hasUnread: false,
        unreadCount: 0,
        isArchived: false,
        opportunityId: 79,
        avatar: null,
        organisationLogo: null,
        organisationMemberName: "Aisha Patel",
        opportunityTitle: "Placement briefing",
      },
    ],
    [selectedConversation]
  );

  const messages = useMemo<Message[]>(() => {
    if (caseDefinition.key === "admin") {
      const groupMessages: Message[] = [
        {
          id: "sam-1",
          conversationId: DEMO_CONVERSATION_ID,
          sender: "them",
          text: "Hi group, the MTSI placement pool is open for next term. Please keep availability updates here so everyone has the same context.",
          createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
          messanger: organisationUser,
        },
        {
          id: "mia-1",
          conversationId: DEMO_CONVERSATION_ID,
          sender: "me",
          text: "I can do Monday and Thursday, and I will upload my availability note today.",
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          messanger: studentUser,
        },
        {
          id: "riley-1",
          conversationId: DEMO_CONVERSATION_ID,
          sender: "them",
          text: "I can cover Friday workshops if the school team still needs support.",
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          messanger: groupPeerUser,
        },
        {
          id: "mia-2",
          conversationId: DEMO_CONVERSATION_ID,
          sender: "me",
          text: "Sounds good. I will keep all placement details inside UniConnected.",
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          messanger: studentUser,
        },
      ];

      if (adminInlineMessage && adminReplyCount >= 1) {
        groupMessages.push({
          id: "riley-after-admin",
          conversationId: DEMO_CONVERSATION_ID,
          sender: "them",
          text: "Thanks for the reminder. I will keep the contact details in this group.",
          createdAt: new Date(Date.now() - 50 * 1000).toISOString(),
          messanger: groupPeerUser,
        });
      }

      if (adminInlineMessage && adminReplyCount >= 2) {
        groupMessages.push({
          id: "sam-after-admin",
          conversationId: DEMO_CONVERSATION_ID,
          sender: "them",
          text: "Agreed. We will keep everything here so the university team can follow the process.",
          createdAt: new Date(Date.now() - 20 * 1000).toISOString(),
          messanger: organisationUser,
        });
      }

      return groupMessages;
    }

    return [
      {
        id: "sam-1",
        conversationId: DEMO_CONVERSATION_ID,
        sender: "them",
        text: "Hi Mia, thanks for joining the MTSI placement pool. Are you still available two days per week next term?",
        createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        messanger: organisationUser,
      },
      {
        id: "mia-1",
        conversationId: DEMO_CONVERSATION_ID,
        sender: "me",
        text: edited
          ? editedMessageText
          : "Yes. Monday and Thursday are best for me, and I can share a short availability note today.",
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        messanger: studentUser,
        isEdited: edited,
        isSoftDeleted: deleted,
      },
      {
        id: "sam-2",
        conversationId: DEMO_CONVERSATION_ID,
        sender: "them",
        text: "Great. Could you also send your personal phone number? If it is easier, we can move the details outside UniConnected.",
        createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        messanger: organisationUser,
      },
      {
        id: "mia-2",
        conversationId: DEMO_CONVERSATION_ID,
        sender: "me",
        text: "I will keep the placement details here so the university team can follow the process.",
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        messanger: studentUser,
      },
    ];
  }, [
    adminInlineMessage,
    adminReplyCount,
    caseDefinition.key,
    deleted,
    edited,
    editedMessageText,
  ]);

  const targetHint = (target: GuideTarget) =>
    isTarget(target) ? <TargetHintFrame /> : null;

  const activity = useMemo(
    () =>
      getActivityLog({
        unread,
        muted,
        blocked,
        reported,
        edited,
        deleted,
        sendNoticeMenuOpen: !!sendNoticeMenuPosition,
        adminBanner,
        adminInlineMessage,
        adminNoticeDismissed,
        adminReplyCount,
        blockConfirmOpen,
        reportDialogOpen,
        reportCategory,
        reportDetail,
      }),
    [
      unread,
      muted,
      blocked,
      reported,
      edited,
      deleted,
      sendNoticeMenuPosition,
      adminBanner,
      adminInlineMessage,
      adminNoticeDismissed,
      adminReplyCount,
      blockConfirmOpen,
      reportDialogOpen,
      reportCategory,
      reportDetail,
    ]
  );

  return (
    <Container maxW="1640px" px={{ base: 3, md: 5 }} py={{ base: 4, md: 5 }}>
      <Flex
        align={{ base: "flex-start", lg: "center" }}
        justify="space-between"
        direction={{ base: "column", lg: "row" }}
        gap={3}
        mb={4}
      >
        <HStack gap={3} align="center">
          <Button
            size="sm"
            variant="outline"
            borderColor="#D4D4D8"
            color="#18181B"
            onClick={onBack}
          >
            <HStack gap={2}>
              <ChevronLeft size={15} />
              <Text>Cases</Text>
            </HStack>
          </Button>
          <Box>
            <Text fontSize="12px" color="#71717A" fontWeight="semibold">
              Task 3 prototype on current messaging UI
            </Text>
            <Heading
              as="h1"
              fontSize={{ base: "24px", md: "30px" }}
              fontWeight="semibold"
            >
              {caseDefinition.title}
            </Heading>
          </Box>
        </HStack>

        <HStack gap={2} wrap="wrap">
          {caseDefinitions.map((item) => (
            <Button
              key={item.key}
              size="sm"
              bg={item.key === caseDefinition.key ? "#18181B" : "white"}
              color={item.key === caseDefinition.key ? "white" : "#18181B"}
              borderWidth="1px"
              borderColor="#D4D4D8"
              _hover={{
                bg: item.key === caseDefinition.key ? "#27272A" : "#F4F4F5",
              }}
              onClick={() => onSwitchCase(item.key)}
            >
              {item.shortTitle}
            </Button>
          ))}
        </HStack>
      </Flex>

      <Flex
        w="100%"
        gap={4}
        align="stretch"
        p={4}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="#E4E4E7"
        bg="white"
        h={{ base: "760px", xl: "calc(100vh - 132px)" }}
        minH="680px"
      >
        <Box
          flexBasis="358px"
          maxW="358px"
          h="100%"
          display={{ base: "none", lg: "block" }}
          position="relative"
        >
          <ConversationList
            conversations={conversations}
            selectedConversationId={DEMO_CONVERSATION_ID}
            showArchived={showArchived}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onShowArchivedChange={setShowArchived}
            onSelectConversation={() => undefined}
            onToggleArchive={() => undefined}
            hasAnyConversations={conversations.length > 0}
            onConversationContextMenu={(conversation, event) => {
              if (conversation.id !== DEMO_CONVERSATION_ID) return;
              setContextMenuPosition({
                x: event.clientX,
                y: event.clientY,
              });
              openConversationActions();
            }}
          />
          <FloatingGuidePanel
            caseDefinition={caseDefinition}
            stepIndex={stepIndex}
            isComplete={isComplete}
            activity={activity}
            onReset={resetCase}
            onStepBack={() =>
              setStepIndex((current) => Math.max(0, current - 1))
            }
          />
        </Box>

        <Box flex={1} h="100%" minW={0}>
          <ConversationView
            isSinglePane={false}
            conversation={selectedConversation}
            messages={messages}
            composerText={composerText}
            onComposerTextChange={setComposerText}
            onSendMessage={() => {
              if (!blocked) setComposerText("");
            }}
            onBackToList={() => undefined}
            onToggleArchive={() => undefined}
            messagesLoading={false}
            profileType="student"
            isSending={false}
            headerNoticeSlot={
              <HeaderStatusBadges
                unread={unread}
                muted={muted}
                blocked={blocked}
              />
            }
            headerMenuSlot={
              <ConversationSettingsMenu
                unread={unread}
                muted={muted}
                blocked={blocked}
                readIndicator={targetHint("mark-unread")}
                muteIndicator={targetHint("mute-button")}
                blockIndicator={targetHint("block-button")}
                onReadStateAction={handleReadStateAction}
                onToggleMute={handleToggleMute}
                onBlockAction={handleBlockAction}
              />
            }
            headerOptionsButtonIndicator={targetHint("conversation-options")}
            onHeaderOptionsOpen={openConversationActions}
            afterHeaderSlot={
              <ConversationNotices
                muted={muted}
                blocked={blocked}
                adminBanner={adminBanner}
                adminNoticeText={adminNoticeText}
                adminNoticeDismissed={adminNoticeDismissed}
                onDismissAdminNotice={() => setAdminNoticeDismissed(true)}
              />
            }
            timelineSlotAfterMessageId={
              caseDefinition.key === "admin" ? "mia-2" : "sam-1"
            }
            timelineSlot={
              adminInlineMessage ? (
                <AdminNoticeRow text={adminNoticeText} />
              ) : null
            }
            composerLockedReason={
              blocked
                ? "This conversation has been blocked. New messages are disabled for both participants."
                : null
            }
            composerSendMode="inlineIcon"
            overlaySlot={
              <>
                <BlockConfirmDialog
                  open={blockConfirmOpen}
                  accent={caseDefinition.accent}
                  confirmIndicator={targetHint("confirm-block")}
                  onCancel={() => setBlockConfirmOpen(false)}
                  onConfirm={() => {
                    setBlocked(true);
                    setBlockConfirmOpen(false);
                    completeTarget("confirm-block");
                  }}
                />
                <ReportDialog
                  open={reportDialogOpen}
                  category={reportCategory}
                  detail={reportDetail}
                  accent={caseDefinition.accent}
                  submitIndicator={targetHint("report-submit")}
                  onCategoryChange={setReportCategory}
                  onDetailChange={setReportDetail}
                  onClose={() => setReportDialogOpen(false)}
                  onSubmit={() => {
                    setReportDialogOpen(false);
                    setReported(true);
                    completeTarget("report-submit");
                  }}
                />
              </>
            }
            messagePrototype={(message) => {
              if (message.id === "sam-2") {
                const relevant =
                  caseDefinition.key === "report" &&
                  !reported &&
                  !reportDialogOpen;
                return {
                  forceActions:
                    relevant &&
                    (isTarget("unsafe-message-actions") ||
                      isTarget("report-menu-item")),
                  triggerIndicator: targetHint("unsafe-message-actions"),
                  reportIndicator: targetHint("report-menu-item"),
                  onOpenActions: () => completeTarget("unsafe-message-actions"),
                  onReport: () => {
                    setReportDialogOpen(true);
                    completeTarget("report-menu-item");
                  },
                  isReported: reported,
                };
              }

              if (message.id === "mia-1") {
                const forceOwnActions =
                  caseDefinition.key === "edit-delete" &&
                  !deleted &&
                  !editing &&
                  (isTarget("own-message-actions") ||
                    isTarget("edit-button") ||
                    isTarget("delete-button"));
                return {
                  forceActions: forceOwnActions,
                  triggerIndicator: targetHint("own-message-actions"),
                  editIndicator: targetHint("edit-button"),
                  deleteIndicator: targetHint("delete-button"),
                  saveEditIndicator: targetHint("save-edit"),
                  onOpenActions: () => completeTarget("own-message-actions"),
                  onEdit: () => {
                    setEditing(true);
                    setEditDraft(editedMessageText);
                    completeTarget("edit-button");
                  },
                  editing,
                  editDraft,
                  onEditDraftChange: setEditDraft,
                  onCancelEdit: () => {
                    setEditDraft(editedMessageText);
                    setEditing(false);
                  },
                  onSaveEdit: () => {
                    setEditedMessageText(editDraft);
                    setEditing(false);
                    setEdited(true);
                    completeTarget("save-edit");
                  },
                  onDelete: () => {
                    setDeleted(true);
                    completeTarget("delete-button");
                  },
                  isEdited: edited,
                  isDeleted: deleted,
                };
              }

              return undefined;
            }}
          />
        </Box>
        <ConversationContextMenu
          open={!!contextMenuPosition}
          position={contextMenuPosition}
          unread={unread}
          muted={muted}
          blocked={blocked}
          readIndicator={targetHint("mark-unread")}
          muteIndicator={targetHint("mute-button")}
          blockIndicator={targetHint("block-button")}
          onClose={() => setContextMenuPosition(null)}
          onReadStateAction={handleReadStateAction}
          onToggleMute={handleToggleMute}
          onBlockAction={handleBlockAction}
        />
        <SendNoticeContextMenu
          open={!!sendNoticeMenuPosition}
          position={sendNoticeMenuPosition}
          indicator={targetHint("send-notice-menu-item")}
          onClose={() => setSendNoticeMenuPosition(null)}
          onSendNotice={handleSendNotice}
          onSendMessage={handleSendRegularMessage}
        />
      </Flex>
    </Container>
  );
}

function HeaderStatusBadges({
  unread,
  muted,
  blocked,
}: {
  unread: boolean;
  muted: boolean;
  blocked: boolean;
}) {
  return (
    <HStack gap={1.5} flexShrink={0}>
      {unread && (
        <Badge bg="#DBEAFE" color="#1D4ED8" borderRadius="md">
          Unread
        </Badge>
      )}
      {muted && (
        <Badge bg="#F4F4F5" color="#52525B" borderRadius="md">
          Muted
        </Badge>
      )}
      {blocked && (
        <Badge bg="#FEF2F2" color="#B91C1C" borderRadius="md">
          Blocked
        </Badge>
      )}
    </HStack>
  );
}

function ConversationSettingsMenu({
  unread,
  muted,
  blocked,
  readIndicator,
  muteIndicator,
  blockIndicator,
  onReadStateAction,
  onToggleMute,
  onBlockAction,
}: {
  unread: boolean;
  muted: boolean;
  blocked: boolean;
  readIndicator?: ReactNode;
  muteIndicator?: ReactNode;
  blockIndicator?: ReactNode;
  onReadStateAction: () => void;
  onToggleMute: () => void;
  onBlockAction: () => void;
}) {
  return (
    <>
      <ConversationMenuItem
        label={unread ? "Mark as read" : "Mark as unread"}
        indicator={readIndicator}
        onClick={onReadStateAction}
      />
      <ConversationMenuItem
        label={muted ? "Unmute conversation" : "Mute conversation"}
        indicator={muteIndicator}
        onClick={onToggleMute}
      />
      <ConversationMenuItem
        label={blocked ? "Unblock user" : "Block user"}
        danger={!blocked}
        indicator={blockIndicator}
        onClick={onBlockAction}
      />
      <Box my={1} borderTopWidth="1px" borderTopColor="#E4E4E7" />
    </>
  );
}

function ConversationMenuItem({
  label,
  danger = false,
  disabled = false,
  indicator,
  onClick,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  indicator?: ReactNode;
  onClick: () => void;
}) {
  return (
    <HStack
      as="button"
      w="100%"
      gap={2}
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.5 : 1}
      px={2}
      py={1.5}
      borderRadius="md"
      justify="space-between"
      position="relative"
      _hover={{ bg: danger ? "#FEF2F2" : "#F4F4F5" }}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onClick();
      }}
    >
      <Text fontSize="sm" color={danger ? "#B91C1C" : "#111827"}>
        {label}
      </Text>
      {indicator}
    </HStack>
  );
}

function ConversationContextMenu({
  open,
  position,
  unread,
  muted,
  blocked,
  readIndicator,
  muteIndicator,
  blockIndicator,
  onClose,
  onReadStateAction,
  onToggleMute,
  onBlockAction,
}: {
  open: boolean;
  position: { x: number; y: number } | null;
  unread: boolean;
  muted: boolean;
  blocked: boolean;
  readIndicator?: ReactNode;
  muteIndicator?: ReactNode;
  blockIndicator?: ReactNode;
  onClose: () => void;
  onReadStateAction: () => void;
  onToggleMute: () => void;
  onBlockAction: () => void;
}) {
  return (
    <AnimatePresence>
      {open && position && (
        <>
          <Box position="fixed" inset={0} zIndex={58} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={transition}
            style={{
              position: "fixed",
              left: position.x,
              top: position.y,
              zIndex: 59,
            }}
          >
            <Box
              w="220px"
              bg="white"
              borderWidth="1px"
              borderColor="#E4E4E7"
              borderRadius="lg"
              boxShadow="0 18px 48px rgba(24, 24, 27, 0.16)"
              p={2}
            >
              <ConversationSettingsMenu
                unread={unread}
                muted={muted}
                blocked={blocked}
                readIndicator={readIndicator}
                muteIndicator={muteIndicator}
                blockIndicator={blockIndicator}
                onReadStateAction={onReadStateAction}
                onToggleMute={onToggleMute}
                onBlockAction={onBlockAction}
              />
              <ConversationMenuItem label="Archive chat" onClick={onClose} />
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SendNoticeContextMenu({
  open,
  position,
  indicator,
  onClose,
  onSendNotice,
  onSendMessage,
}: {
  open: boolean;
  position: { x: number; y: number } | null;
  indicator?: ReactNode;
  onClose: () => void;
  onSendNotice: () => void;
  onSendMessage: () => void;
}) {
  const menuLeft = position ? Math.max(16, position.x - 148) : 16;
  const menuTop = position ? Math.max(16, position.y - 106) : 16;

  return (
    <AnimatePresence>
      {open && position && (
        <>
          <Box position="fixed" inset={0} zIndex={60} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={transition}
            style={{
              position: "fixed",
              left: menuLeft,
              top: menuTop,
              zIndex: 61,
            }}
          >
            <Box
              w="184px"
              bg="white"
              borderWidth="1px"
              borderColor="#E4E4E7"
              borderRadius="14px"
              boxShadow="0 14px 34px rgba(24, 24, 27, 0.14)"
              overflow="visible"
              position="relative"
            >
              <HStack
                as="button"
                w="100%"
                h="46px"
                gap={3}
                cursor="pointer"
                px={3.5}
                justify="flex-start"
                position="relative"
                borderTopRadius="14px"
                _hover={{ bg: "#F7FAFA" }}
                onClick={(event) => {
                  event.stopPropagation();
                  onSendNotice();
                }}
              >
                <Box color="#176E78" flexShrink={0}>
                  <Megaphone size={17} strokeWidth={2.2} />
                </Box>
                <Text fontSize="14px" fontWeight="medium" color="#18181B">
                  Send admin notice
                </Text>
                {indicator}
              </HStack>
              <Box borderTopWidth="1px" borderTopColor="#E4E4E7" />
              <HStack
                as="button"
                w="100%"
                h="46px"
                gap={3}
                cursor="pointer"
                px={3.5}
                justify="flex-start"
                borderBottomRadius="14px"
                _hover={{ bg: "#F7FAFA" }}
                onClick={(event) => {
                  event.stopPropagation();
                  onSendMessage();
                }}
              >
                <Box color="#2AA8E0" flexShrink={0}>
                  <Send size={18} strokeWidth={2.3} />
                </Box>
                <Text fontSize="14px" fontWeight="medium" color="#18181B">
                  Send
                </Text>
              </HStack>
              <Box
                position="absolute"
                right="22px"
                bottom="-7px"
                w="14px"
                h="14px"
                bg="white"
                borderRightWidth="1px"
                borderBottomWidth="1px"
                borderColor="#E4E4E7"
                transform="rotate(45deg)"
              />
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ConversationNotices({
  muted,
  blocked,
  adminBanner,
  adminNoticeText,
  adminNoticeDismissed,
  onDismissAdminNotice,
}: {
  muted: boolean;
  blocked: boolean;
  adminBanner: boolean;
  adminNoticeText: string;
  adminNoticeDismissed: boolean;
  onDismissAdminNotice: () => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {adminBanner && !adminNoticeDismissed && (
        <Notice tone="admin" key="admin">
          <HStack align="flex-start" justify="space-between" gap={3}>
            <HStack align="flex-start" gap={3} minW={0}>
              <Megaphone size={17} />
              <Box minW={0}>
                <Text fontWeight="semibold" fontSize="sm">
                  UniConnected Admin
                </Text>
                <Text fontSize="sm">{adminNoticeText}</Text>
              </Box>
            </HStack>
            <IconButton
              aria-label="Dismiss admin notice"
              size="xs"
              variant="ghost"
              color="#176E78"
              flexShrink={0}
              onClick={onDismissAdminNotice}
            >
              <X size={14} />
            </IconButton>
          </HStack>
        </Notice>
      )}
      {muted && (
        <Notice tone="muted" key="muted">
          <Text fontSize="sm">
            Notifications are muted for this conversation.
          </Text>
        </Notice>
      )}
      {blocked && (
        <Notice tone="blocked" key="blocked">
          <Text fontSize="sm">
            This user is blocked. The conversation is closed to new messages.
          </Text>
        </Notice>
      )}
    </AnimatePresence>
  );
}

function Notice({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "admin" | "muted" | "blocked";
}) {
  const palette = {
    admin: { bg: "#E9F7F6", border: "#D3EFEA", color: "#176E78" },
    muted: { bg: "#F4F4F5", border: "#E4E4E7", color: "#52525B" },
    blocked: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={transition}
      style={{ overflow: "hidden" }}
    >
      <Box
        px={{ base: 4, md: 5 }}
        py={3}
        bg={palette.bg}
        color={palette.color}
        borderBottomWidth="1px"
        borderColor={palette.border}
      >
        {children}
      </Box>
    </motion.div>
  );
}

function FloatingGuidePanel({
  caseDefinition,
  stepIndex,
  isComplete,
  activity,
  onReset,
  onStepBack,
}: {
  caseDefinition: CaseDefinition;
  stepIndex: number;
  isComplete: boolean;
  activity: string[];
  onReset: () => void;
  onStepBack: () => void;
}) {
  const currentStep = isComplete ? null : caseDefinition.steps[stepIndex];

  return (
    <Box
      position="absolute"
      left={3}
      right={3}
      bottom={3}
      zIndex={4}
      bg="rgba(255, 255, 255, 0.96)"
      borderWidth="1px"
      borderColor="#E4E4E7"
      borderRadius="xl"
      boxShadow="0 18px 48px rgba(24, 24, 27, 0.14)"
      overflow="hidden"
      backdropFilter="blur(12px)"
    >
      <Box px={4} py={3} borderBottomWidth="1px" borderColor="#E4E4E7">
        <HStack justify="space-between" align="center">
          <Text fontSize="12px" fontWeight="semibold" color="#71717A">
            Prototype guide
          </Text>
          <Text color="#71717A" fontSize="12px">
            {Math.min(stepIndex + 1, caseDefinition.steps.length)} /{" "}
            {caseDefinition.steps.length}
          </Text>
        </HStack>
        <HStack gap={1.5} mt={2}>
          {caseDefinition.steps.map((step, index) => (
            <Box
              key={`${step.target}-${index}`}
              h="4px"
              flex={1}
              borderRadius="full"
              bg={
                index < stepIndex
                  ? caseDefinition.accent
                  : index === stepIndex && !isComplete
                    ? hexToRgba(caseDefinition.accent, 0.45)
                    : "#E4E4E7"
              }
            />
          ))}
        </HStack>
      </Box>

      <Box px={4} py={3}>
        {isComplete ? (
          <Box>
            <Text color="#166534" fontWeight="semibold" fontSize="sm">
              Workflow complete
            </Text>
            <Text mt={1} color="#166534" fontSize="12px">
              The selected case has been demonstrated on the full Task 3 UI.
            </Text>
            <Button mt={3} size="xs" variant="outline" onClick={onReset}>
              <HStack gap={1.5}>
                <RotateCcw size={12} />
                <Text>Replay</Text>
              </HStack>
            </Button>
          </Box>
        ) : currentStep ? (
          <Box>
            <Text
              color={caseDefinition.accent}
              fontSize="12px"
              fontWeight="semibold"
            >
              Step {stepIndex + 1}
            </Text>
            <Text mt={1} color="#18181B" fontWeight="semibold" fontSize="sm">
              {currentStep.title}
            </Text>
            <Text mt={1} color="#52525B" fontSize="12px">
              {currentStep.instruction}
            </Text>
            <HStack mt={3} gap={2}>
              <Button
                size="xs"
                variant="outline"
                disabled={stepIndex === 0}
                onClick={onStepBack}
              >
                Back
              </Button>
              <Text color="#71717A" fontSize="11px">
                Only the action to click is pulsing.
              </Text>
            </HStack>
          </Box>
        ) : null}
      </Box>

      <Box px={4} py={3} borderTopWidth="1px" borderColor="#E4E4E7">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="semibold" fontSize="12px">
            Backend trace
          </Text>
          <Clock3 size={13} color="#71717A" />
        </HStack>
        <Stack gap={1.5} maxH="120px" overflowY="auto">
          {activity.length === 0 ? (
            <Text color="#71717A" fontSize="12px">
              Waiting for the first action.
            </Text>
          ) : (
            activity.slice(-4).map((item) => (
              <Box
                key={item}
                borderWidth="1px"
                borderColor="#E4E4E7"
                borderRadius="md"
                px={2}
                py={1.5}
                bg="#FAFAFA"
              >
                <Text color="#3F3F46" fontSize="11px" fontWeight="medium">
                  {item}
                </Text>
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function BlockConfirmDialog({
  open,
  accent,
  confirmIndicator,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  accent: string;
  confirmIndicator?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <WorkspaceDialog>
          <Box p={5}>
            <HStack color="#B91C1C" gap={2}>
              <Ban size={18} />
              <Text fontSize="sm" fontWeight="semibold">
                Block user
              </Text>
            </HStack>
            <Heading as="h3" mt={3} fontSize="22px">
              Close this conversation?
            </Heading>
            <Text mt={3} color="#52525B" fontSize="sm">
              Blocking prevents both participants from continuing this
              conversation. This is different from archive, which only hides a
              conversation from the inbox.
            </Text>
          </Box>
          <HStack
            justify="flex-end"
            px={5}
            py={4}
            borderTopWidth="1px"
            borderColor="#E4E4E7"
            bg="#FAFAFA"
          >
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              bg={accent}
              color="white"
              _hover={{ bg: accent }}
              position="relative"
              onClick={onConfirm}
            >
              <HStack gap={2}>
                <Text>Confirm block</Text>
                {confirmIndicator}
              </HStack>
            </Button>
          </HStack>
        </WorkspaceDialog>
      )}
    </AnimatePresence>
  );
}

function ReportDialog({
  open,
  category,
  detail,
  accent,
  submitIndicator,
  onCategoryChange,
  onDetailChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  category: string;
  detail: string;
  accent: string;
  submitIndicator?: ReactNode;
  onCategoryChange: (value: string) => void;
  onDetailChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const categories = [
    "Off-platform contact request",
    "Harassment or abuse",
    "Spam or scam",
    "Inappropriate work request",
    "Other safety concern",
  ];

  return (
    <AnimatePresence>
      {open && (
        <WorkspaceDialog>
          <Box px={5} py={4} borderBottomWidth="1px" borderColor="#E4E4E7">
            <HStack justify="space-between" align="flex-start" gap={4}>
              <Box>
                <HStack color="#B64033" gap={2}>
                  <Flag size={18} />
                  <Text fontSize="sm" fontWeight="semibold">
                    Report message
                  </Text>
                </HStack>
                <Heading as="h3" mt={2} fontSize="22px">
                  Tell UniConnected what happened
                </Heading>
              </Box>
              <Button size="sm" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </HStack>
          </Box>

          <Stack gap={4} px={5} py={5}>
            <Box
              bg="#FEF2F2"
              borderWidth="1px"
              borderColor="#FECACA"
              color="#7F1D1D"
              borderRadius="lg"
              px={3}
              py={3}
            >
              <Text fontSize="12px" fontWeight="semibold">
                Message being reported
              </Text>
              <Text mt={1} fontSize="sm">
                &quot;Could you also send your personal phone number?&quot;
              </Text>
            </Box>

            <Box>
              <Text color="#18181B" fontSize="sm" fontWeight="semibold" mb={2}>
                Category
              </Text>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={2}>
                {categories.map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    justifyContent="flex-start"
                    bg={category === item ? "#18181B" : "white"}
                    color={category === item ? "white" : "#18181B"}
                    borderWidth="1px"
                    borderColor={category === item ? "#18181B" : "#D4D4D8"}
                    _hover={{ bg: category === item ? "#27272A" : "#F4F4F5" }}
                    onClick={() => onCategoryChange(item)}
                  >
                    {item}
                  </Button>
                ))}
              </Grid>
            </Box>

            <Box>
              <Text color="#18181B" fontSize="sm" fontWeight="semibold" mb={2}>
                Details optional
              </Text>
              <Textarea
                value={detail}
                placeholder="Add any context for the moderation team..."
                minH="112px"
                resize="none"
                borderColor="#D4D4D8"
                onChange={(event) => onDetailChange(event.target.value)}
              />
            </Box>
          </Stack>

          <HStack
            justify="space-between"
            px={5}
            py={4}
            borderTopWidth="1px"
            borderColor="#E4E4E7"
            bg="#FAFAFA"
          >
            <Text color="#71717A" fontSize="12px">
              Creates a moderation record and notifies admins.
            </Text>
            <HStack gap={2}>
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                bg={accent}
                color="white"
                _hover={{ bg: accent }}
                position="relative"
                onClick={onSubmit}
              >
                <HStack gap={2}>
                  <Text>Submit report</Text>
                  {submitIndicator}
                </HStack>
              </Button>
            </HStack>
          </HStack>
        </WorkspaceDialog>
      )}
    </AnimatePresence>
  );
}

function WorkspaceDialog({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "rgba(24, 24, 27, 0.34)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={transition}
        style={{ width: "min(560px, 100%)" }}
      >
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="#E4E4E7"
          borderRadius="xl"
          boxShadow="0 28px 80px rgba(24, 24, 27, 0.28)"
          overflow="hidden"
        >
          {children}
        </Box>
      </motion.div>
    </motion.div>
  );
}

function AdminNoticeRow({ text }: { text: string }) {
  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Box
        maxW="660px"
        bg="#E9F7F6"
        borderWidth="1px"
        borderColor="#D3EFEA"
        borderRadius="xl"
        px={4}
        py={3}
      >
        <HStack align="flex-start" gap={3}>
          <Box color="#176E78" pt="2px">
            <Megaphone size={17} />
          </Box>
          <Box>
            <Text fontSize="12px" fontWeight="semibold" color="#176E78">
              {adminUser.full_name}
            </Text>
            <Text mt={1} color="#27272A" fontSize="sm">
              {text}
            </Text>
          </Box>
        </HStack>
      </Box>
    </Box>
  );
}

function getActivityLog(state: {
  unread: boolean;
  muted: boolean;
  blocked: boolean;
  reported: boolean;
  edited: boolean;
  deleted: boolean;
  sendNoticeMenuOpen: boolean;
  adminBanner: boolean;
  adminInlineMessage: boolean;
  adminNoticeDismissed: boolean;
  adminReplyCount: number;
  blockConfirmOpen: boolean;
  reportDialogOpen: boolean;
  reportCategory: string;
  reportDetail: string;
}) {
  const entries: string[] = [];

  if (state.unread) {
    entries.push("conversation_read_state: current user has unread follow-up");
  }
  if (state.muted) {
    entries.push("conversation_muted_by: Student A muted this thread");
  }
  if (state.blockConfirmOpen) {
    entries.push("block confirmation opened in the chat workspace");
  }
  if (state.blocked) {
    entries.push("conversation.is_blocked=true; send endpoint rejects writes");
  }
  if (state.reportDialogOpen) {
    entries.push("report dialog opened with category and optional details");
  }
  if (state.reported) {
    entries.push(
      `moderation_report row created: ${state.reportCategory}${
        state.reportDetail.trim() ? " with reporter notes" : ""
      }; admin notification queued`
    );
  }
  if (state.edited) {
    entries.push("message.is_edited=true; edited_at timestamp recorded");
  }
  if (state.deleted) {
    entries.push("message.is_soft_deleted=true; placeholder remains in thread");
  }
  if (state.sendNoticeMenuOpen) {
    entries.push("admin permission menu opened from composer Send control");
  }
  if (state.adminBanner) {
    entries.push("conversation.active_notice_id returned; notice bar pinned");
  }
  if (state.adminNoticeDismissed) {
    entries.push("current user dismissed active notice bar locally");
  }
  if (state.adminInlineMessage) {
    entries.push("admin_notice message appended at the bottom of group thread");
  }
  if (state.adminReplyCount > 0) {
    entries.push(`${state.adminReplyCount} group reply message(s) appended`);
  }

  return entries;
}
