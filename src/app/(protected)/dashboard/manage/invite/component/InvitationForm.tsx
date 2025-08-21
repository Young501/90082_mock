"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Textarea,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { Plus, X, Mail, Users, Send } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/tooltip";
import { useInviteParticipants } from "@/services/shared";
import { useAuthStore } from "@/store/authStore";
import { isDisallowedDomain } from "@/utils/constants";

interface InvitationFormProps {
  userType: "student" | "partner";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const InvitationForm: React.FC<InvitationFormProps> = ({
  userType,
  onSuccess,
  onCancel,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  const opportunityId = coordinatorOpportunities[0] || "";

  const inviteParticipants = useInviteParticipants();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateOrganizationEmail = (email: string) => {
    if (!validateEmail(email)) return false;

    if (userType === "partner") {
      if (isDisallowedDomain(email)) {
        return false;
      }
    }

    return true;
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const processEmailInput = () => {
    if (!emailInput.trim()) return;

    const emailList = emailInput
      .split(/[\n,;]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    let addedCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let disallowedDomainCount = 0;

    emailList.forEach((email) => {
      if (validateOrganizationEmail(email)) {
        if (!emails.includes(email)) {
          setEmails((prev) => [...prev, email]);
          addedCount++;
        } else {
          duplicateCount++;
        }
      } else {
        if (userType === "partner" && validateEmail(email)) {
          if (isDisallowedDomain(email)) {
            disallowedDomainCount++;
          } else {
            invalidCount++;
          }
        } else {
          invalidCount++;
        }
      }
    });

    setEmailInput("");

    if (addedCount > 0) {
      toast.success(
        `${addedCount} email${addedCount > 1 ? "s" : ""} added successfully`
      );
    }
    if (invalidCount > 0) {
      toast.warning(
        `${invalidCount} invalid email${invalidCount > 1 ? "s" : ""} ignored`
      );
    }
    if (disallowedDomainCount > 0) {
      toast.warning(
        `${disallowedDomainCount} email${disallowedDomainCount > 1 ? "s" : ""} with personal domains ignored. Please use work email addresses for organisation invitations.`
      );
    }
    if (duplicateCount > 0) {
      toast.info(
        `${duplicateCount} duplicate email${duplicateCount > 1 ? "s" : ""} skipped`
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processEmailInput();
    }
  };

  const handleSubmit = async () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    if (!opportunityId) {
      toast.error("No opportunity found. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const invitations = emails.map((email) => ({
        email: email.trim(),
        role: userType,
      }));

      const response = await inviteParticipants.mutateAsync({
        opportunityId,
        invitations,
      });

      const invitationsSent = response.invitations_sent || 0;
      const failedInvitations = response.failed_invitations.length || [];

      if (invitationsSent > 0 && failedInvitations.length === 0) {
        toast.success(
          `Invitations sent successfully to ${invitationsSent} ${userType === "student" ? "student(s)" : "organisation(s)"}`
        );
      } else if (invitationsSent > 0 && failedInvitations > 0) {
        toast.success(
          `${invitationsSent} invitation${invitationsSent > 1 ? "s" : ""} sent successfully, ${failedInvitations} failed`
        );

        const failedInvitationsList = response.failed_invitations.map(
          (invitation: string) => {
            const [email, reason] = invitation.split(": ");
            return `${email}: ${reason}`;
          }
        );

        toast.error(
          `Failed invitations:\n${failedInvitationsList.join("\n")}`,
          {
            autoClose: 10000,
            closeOnClick: false,
            pauseOnHover: true,
          }
        );
        console.log(failedInvitationsList);
      } else if (invitationsSent === 0 && failedInvitations > 0) {
        toast.error(
          `All invitations failed. ${failedInvitations} ${userType === "student" ? "student(s)" : "organisation(s)"}, Already Invited`
        );

        const failedInvitationsList = response.failed_invitations.map(
          (invitation: string) => {
            const [email, reason] = invitation.split(": ");
            return `${email}: ${reason}`;
          }
        );
        toast.error(`Failed invitations:\n${failedInvitationsList.join("\n")}`);
        console.log(failedInvitationsList);
      } else {
        toast.success(
          response.detail ||
            `Invitations sent successfully to ${emails.length} ${userType === "student" ? "student(s)" : "organisation(s)"}`
        );
      }

      setEmails([]);
      setEmailInput("");
      onSuccess?.();
    } catch (error: any) {
      if (error?.response?.status === 400 && error?.response?.data) {
        const responseData = error.response.data;

        if (
          responseData.invitations_sent === 0 &&
          responseData.failed_invitations?.length > 0
        ) {
          const failedInvitationsList = responseData.failed_invitations.map(
            (invitation: string) => {
              const [email, reason] = invitation.split(": ");
              return `${email}: ${reason}`;
            }
          );

          toast.error(
            `All invitations failed. ${responseData.failed_invitations.length} ${userType === "student" ? "student(s)" : "organisation(s)"} already invited.`
          );
          toast.error(
            `Failed invitations:\n${failedInvitationsList.join("\n")}`,
            {
              autoClose: 10000,
              closeOnClick: false,
              pauseOnHover: true,
            }
          );
        } else if (
          responseData.invitations_sent > 0 &&
          responseData.failed_invitations?.length > 0
        ) {
          toast.success(
            `${responseData.invitations_sent} invitation${responseData.invitations_sent > 1 ? "s" : ""} sent successfully, ${responseData.failed_invitations.length} failed`
          );

          const failedInvitationsList = responseData.failed_invitations.map(
            (invitation: string) => {
              const [email, reason] = invitation.split(": ");
              return `${email}: ${reason}`;
            }
          );

          toast.error(
            `Failed invitations:\n${failedInvitationsList.join("\n")}`,
            {
              autoClose: 10000,
              closeOnClick: false,
              pauseOnHover: true,
            }
          );
        } else {
          toast.error(
            responseData.detail ||
              "Failed to send invitations. Please try again."
          );
        }
      } else {
        toast.error(
          error?.detail || "Failed to send invitations. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAll = () => {
    setEmails([]);
    setEmailInput("");
  };

  return (
    <Box
      bg="white"
      borderRadius={{ base: "16px", md: "20px", lg: "24px" }}
      p={{ base: 4, sm: 5, md: 6, lg: 8 }}
      boxShadow="0px 8px 32px rgba(0, 0, 0, 0.12)"
      minW={{ base: "100%", md: "600px", lg: "800px" }}
      maxW={{ base: "100%", md: "700px", lg: "800px" }}
      mx="auto"
      border="1px solid"
      borderColor="gray.200"
      w="100%"
    >
      <VStack gap={{ base: 6, md: 7, lg: 8 }} align="stretch">
        <Box textAlign="center">
          <HStack justify="center" mb={{ base: 2, md: 3 }}>
            <Users size={24} color="#2CA9DF" />
            <Text
              fontSize={{ base: "20px", sm: "24px", md: "28px", lg: "36px" }}
              fontWeight="700"
              color="#1A202C"
              lineHeight={{ base: "1.2", md: "1.3" }}
            >
              Invite {userType === "student" ? "Students" : "Organisations"}
            </Text>
          </HStack>
          <Text
            fontSize={{ base: "14px", sm: "15px", md: "16px" }}
            color="#718096"
            maxW={{ base: "100%", md: "500px" }}
            mx="auto"
            px={{ base: 2, md: 0 }}
            lineHeight={{ base: "1.4", md: "1.5" }}
          >
            Add email addresses to send invitations. You can enter one email or
            paste multiple emails separated by commas, semicolons, or new lines.
          </Text>
        </Box>

        <Box>
          <HStack mb={{ base: 3, md: 4 }} gap={2}>
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight="600"
              color="#1A202C"
            >
              Enter Email (s)
            </Text>
          </HStack>

          <Box
            border="2px solid"
            borderColor="gray.200"
            borderRadius={{ base: "12px", md: "16px" }}
            p={{ base: 3, md: 4 }}
            bg="gray.50"
          >
            <VStack gap={{ base: 2, md: 3 }} align="stretch">
              <Textarea
                ref={textareaRef}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email addresses (one per line, or separated by commas/semicolons)..."
                resize="vertical"
                rows={4}
                borderRadius={{ base: "8px", md: "12px" }}
                border="2px solid"
                borderColor="#E2E8F0"
                _focus={{
                  borderColor: "#2CA9DF",
                  boxShadow: "0 0 0 1px #2CA9DF",
                }}
                fontSize={{ base: "14px", md: "16px" }}
                bg="white"
                minH={{ base: "80px", md: "100px" }}
              />
              <HStack justify="flex-end">
                <Button
                  onClick={processEmailInput}
                  disabled={!emailInput.trim()}
                  size={{ base: "sm", md: "sm" }}
                  color="white"
                  variant="primary"
                  borderRadius="8px"
                  h={{ base: "40px", md: "50px" }}
                  fontSize={{ base: "14px", md: "18px" }}
                  px={{ base: 3, md: 4 }}
                >
                  <HStack gap={{ base: 1, md: 2 }}>
                    <Plus size={18} />
                    <span>Add Emails</span>
                  </HStack>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>

        {emails.length > 0 && (
          <Box>
            <HStack
              justify="space-between"
              mb={{ base: 3, md: 4 }}
              flexWrap={{ base: "wrap", md: "nowrap" }}
            >
              <HStack gap={2} mb={{ base: 2, md: 0 }}>
                <Mail size={20} color="#2CA9DF" />
                <Text
                  fontSize={{ base: "16px", md: "18px" }}
                  fontWeight="600"
                  color="#1A202C"
                >
                  Email Addresses ({emails.length})
                </Text>
              </HStack>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                color="red.500"
                _hover={{ bg: "red.50" }}
                fontSize={{ base: "12px", md: "14px" }}
                px={{ base: 2, md: 3 }}
              >
                Clear All
              </Button>
            </HStack>

            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius={{ base: "12px", md: "16px" }}
              p={{ base: 3, md: 4 }}
              bg="gray.50"
              maxH={{ base: "200px", md: "300px" }}
              overflowY="auto"
            >
              <Flex wrap="wrap" gap={{ base: 1, md: 2 }} justify="start">
                {emails.map((email, index) => (
                  <Badge
                    key={index}
                    px={{ base: 2, md: 3 }}
                    py={{ base: 1, md: 2 }}
                    borderRadius="full"
                    bg="#2CA9DF"
                    color="white"
                    fontSize={{ base: "12px", md: "14px" }}
                    fontWeight="500"
                    display="flex"
                    alignItems="center"
                    maxW={{ base: "100%", sm: "280px", md: "300px" }}
                    gap={{ base: 1, md: 2 }}
                    w={{ base: "100%", sm: "auto" }}
                    justifyContent={{ base: "space-between", sm: "flex-start" }}
                  >
                    <Tooltip content={email}>
                      <Text
                        maxW={{ base: "calc(100% - 30px)", sm: "250px" }}
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                        fontSize={{ base: "12px", md: "14px" }}
                      >
                        {email}
                      </Text>
                    </Tooltip>
                    <IconButton
                      aria-label="Remove email"
                      onClick={() => removeEmail(email)}
                      variant="ghost"
                      size="xs"
                      color="white"
                      _hover={{ bg: "rgba(255,255,255,0.2)" }}
                      minW="auto"
                      w={{ base: "24px", md: "auto" }}
                      h={{ base: "24px", md: "auto" }}
                    >
                      <X size={14} />
                    </IconButton>
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Box>
        )}

        <Box
          borderTop="1px solid"
          borderColor="gray.200"
          pt={{ base: 4, md: 6 }}
        >
          <HStack gap={{ base: 2, md: 4 }} justify="center">
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Sending Invitations"
              disabled={emails.length === 0}
              color="white"
              variant="primary"
              borderRadius="8px"
              h={{ base: "50px", md: "60px" }}
              fontSize={{ base: "14px", md: "16px" }}
              px={{ base: 4, md: 6 }}
              w={{ base: "100%", sm: "auto" }}
            >
              <HStack gap={{ base: 1, md: 2 }}>
                <Send size={20} />
                <span>Send Invitations ({emails.length})</span>
              </HStack>
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};
