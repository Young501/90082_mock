"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import { Send, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useInviteV2 } from "@/services/shared";
import { validateContent, getContentValidationMessage } from "@/utils/contentValidation";
import { EmailCustomizationPreview } from "@/app/(protected)/dashboard/manage/invite/component/EmailCustomizationPreview";

interface ResendFormProps {
  email: string;
  participantName?: string;
  userType: "student" | "organisation";
  opportunityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ResendForm: React.FC<ResendFormProps> = ({
  email,
  participantName,
  userType,
  opportunityId,
  onSuccess,
  onCancel,
}) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteV2 = useInviteV2();

  const fieldBorder = { border: "1px solid", borderColor: "#E4E4E7" };

  const handleSubmit = async () => {
    if (!opportunityId) { toast.error("No opportunity found."); return; }

    if (subject.trim()) {
      const result = validateContent(subject);
      if (result.status === "error") { toast.error(`Subject: ${getContentValidationMessage(result.type)}`); return; }
    }
    if (body.trim()) {
      const result = validateContent(body);
      if (result.status === "error") { toast.error(`Body: ${getContentValidationMessage(result.type)}`); return; }
    }

    setIsSubmitting(true);
    try {
      const response = await inviteV2.mutateAsync({
        opportunityId,
        userType,
        emails: [email],
        customEmail: subject || body ? { subject, body } : undefined,
      });
      const sent = response.invitations_sent || 0;
      const failed: Array<{ email: string; reason: string }> = response.failed_invitations ?? [];
      if (sent > 0 && failed.length === 0) {
        toast.success("Invitation resent successfully");
      } else if (failed.length > 0) {
        toast.error(failed.map((f) => `${f.email}: ${f.reason}`).join("\n"), { autoClose: 10000 });
      }
      onSuccess?.();
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.failed_invitations?.length > 0) {
        const failed: Array<{ email: string; reason: string }> = data.failed_invitations;
        toast.error(failed.map((f) => `${f.email}: ${f.reason}`).join("\n"), { autoClose: 10000 });
      } else {
        toast.error(data?.detail || "Failed to resend invitation.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="white" borderRadius="12px" {...fieldBorder} p={{ base: 5, md: 8 }} w="100%" maxW="1512px">
      <VStack gap={8} align="stretch">

        {/* Recipient — locked */}
        <VStack align="stretch" gap={2}>
          <Text fontSize="sm" fontWeight="600" color="#3F3F46">Recipient</Text>
          <HStack
            bg="#F4F4F5"
            border="1px solid #E4E4E7"
            borderRadius="8px"
            px={3}
            py={2}
            gap={2}
            w="fit-content"
          >
            <Mail size={14} color="#71717A" />
            <Text fontSize="sm" color="#18181B">
              {participantName ? `${participantName} — ` : ""}{email}
            </Text>
          </HStack>
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
              <ButtonV2 variant="secondary" onClick={onCancel} h="44px" px={6} fontSize="sm" disabled={isSubmitting}>
                Cancel
              </ButtonV2>
            )}
            <ButtonV2
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              h="44px"
              px={6}
              fontSize="sm"
            >
              <HStack gap={2}>
                <Send size={16} />
                <span>Resend Invitation</span>
              </HStack>
            </ButtonV2>
          </HStack>
        </Box>

      </VStack>
    </Box>
  );
};
