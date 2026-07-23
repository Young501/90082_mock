"use client";

import React, { useEffect, useState } from "react";
import { Box, VStack, HStack, Text, IconButton, Flex } from "@chakra-ui/react";
import { Send, Mail, X } from "lucide-react";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { Tooltip } from "@/components/ui/tooltip";
import { useInviteV2 } from "@/services/shared";
import {
  validateContent,
  getContentValidationMessage,
} from "@/utils/contentValidation";
import { EmailCustomizationPreview } from "@/app/(protected)/dashboard/manage/invite/component/EmailCustomizationPreview";

interface ResendFormProps {
  emails: string[];
  participantName?: string;
  userType: "student" | "organisation";
  opportunityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ResendForm: React.FC<ResendFormProps> = ({
  emails,
  participantName,
  userType,
  opportunityId,
  onSuccess,
  onCancel,
}) => {
  const [recipients, setRecipients] = useState<string[]>(emails);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailsKey = emails.join(",");
  useEffect(() => {
    setRecipients(emails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailsKey]);

  const removeRecipient = (emailToRemove: string) =>
    setRecipients((prev) => prev.filter((e) => e !== emailToRemove));

  const inviteV2 = useInviteV2();

  const fieldBorder = { border: "1px solid", borderColor: "#E4E4E7" };

  const handleSubmit = async () => {
    if (!opportunityId) {
      toast.error("No opportunity found.");
      return;
    }

    if (recipients.length === 0) {
      toast.error("No pending recipients found.");
      return;
    }

    if (subject.trim()) {
      const result = validateContent(subject);
      if (result.status === "error") {
        toast.error(`Subject: ${getContentValidationMessage(result.type)}`);
        return;
      }
    }
    if (body.trim()) {
      const result = validateContent(body);
      if (result.status === "error") {
        toast.error(`Body: ${getContentValidationMessage(result.type)}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await inviteV2.mutateAsync({
        opportunityId,
        userType,
        emails: recipients,
        customEmail: subject || body ? { subject, body } : undefined,
      });
      const sent = response.invitations_sent || 0;
      const failed: Array<{ email: string; reason: string }> =
        response.failed_invitations ?? [];
      if (sent > 0 && failed.length === 0) {
        toast.success(
          recipients.length > 1
            ? `Reminder sent to ${sent} recipient${sent === 1 ? "" : "s"}`
            : "Invitation resent successfully"
        );
      } else if (failed.length > 0) {
        toast.error(failed.map((f) => `${f.email}: ${f.reason}`).join("\n"), {
          autoClose: 10000,
        });
      }
      onSuccess?.();
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.failed_invitations?.length > 0) {
        const failed: Array<{ email: string; reason: string }> =
          data.failed_invitations;
        toast.error(failed.map((f) => `${f.email}: ${f.reason}`).join("\n"), {
          autoClose: 10000,
        });
      } else {
        toast.error(data?.detail || "Failed to resend invitation.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="12px"
      {...fieldBorder}
      p={{ base: 5, md: 8 }}
      w="100%"
      maxW="1512px"
    >
      <VStack gap={8} align="stretch">
        {/* Recipient(s) — removable */}
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="600" color="#3F3F46">
              {recipients.length > 1
                ? `Recipients (${recipients.length})`
                : "Recipient"}
            </Text>
            {recipients.length > 1 && (
              <Text
                fontSize="xs"
                color="#EF4444"
                cursor="pointer"
                fontWeight="500"
                onClick={() => setRecipients([])}
              >
                Clear all
              </Text>
            )}
          </HStack>
          <Box
            border="1px solid #E4E4E7"
            borderRadius="8px"
            p={2.5}
            bg="#F4F4F5"
            maxH="180px"
            overflowY="auto"
          >
            <Flex wrap="wrap" gap={1.5}>
              {recipients.map((e) => (
                <HStack
                  key={e}
                  bg="white"
                  border="1px solid #E4E4E7"
                  borderRadius="6px"
                  px={2}
                  py={0.5}
                  gap={1}
                  maxW="280px"
                >
                  <Mail size={12} color="#71717A" />
                  <Tooltip content={e}>
                    <Text
                      fontSize="xs"
                      color="#18181B"
                      style={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                      maxW="220px"
                    >
                      {recipients.length === 1 &&
                      participantName &&
                      participantName !== e
                        ? `${participantName} — ${e}`
                        : e}
                    </Text>
                  </Tooltip>
                  <IconButton
                    aria-label="Remove recipient"
                    onClick={() => removeRecipient(e)}
                    variant="ghost"
                    size="xs"
                    color="#A1A1AA"
                    minW="auto"
                    h="14px"
                    w="14px"
                    _hover={{ color: "#EF4444" }}
                  >
                    <X size={11} />
                  </IconButton>
                </HStack>
              ))}
              {recipients.length === 0 && (
                <Text fontSize="sm" color="#A1A1AA" px={1}>
                  No recipients selected.
                </Text>
              )}
            </Flex>
          </Box>
        </VStack>

        <Box borderTop="1px solid #E4E4E7" />

        {/* Customisation + Preview */}
        <EmailCustomizationPreview
          opportunityId={opportunityId}
          userType={userType}
          subject={subject}
          onSubjectChange={setSubject}
          body={body}
          onBodyChange={setBody}
          isResend
        />

        {/* Footer actions */}
        <Box borderTop="1px solid #E4E4E7" pt={6}>
          <HStack gap={3} justify="flex-end">
            {onCancel && (
              <ButtonV2
                variant="secondary"
                onClick={onCancel}
                h="44px"
                px={6}
                fontSize="sm"
                disabled={isSubmitting}
              >
                Cancel
              </ButtonV2>
            )}
            <ButtonV2
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={recipients.length === 0}
              h="44px"
              px={6}
              fontSize="sm"
            >
              <HStack gap={2}>
                <Send size={16} />
                <span>
                  {recipients.length > 1
                    ? `Send Reminder to ${recipients.length}`
                    : "Resend Invitation"}
                </span>
              </HStack>
            </ButtonV2>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};
