"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Textarea,
  Input,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { Plus, X, Mail, Send, Users, Eye, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { Tooltip } from "@/components/ui/tooltip";
import { useInvitePreview, useInvitePreviewRefresh, useInviteV2 } from "@/services/shared";
import { isDisallowedDomain } from "@/utils/constants";
import { validateContent, getContentValidationMessage } from "@/utils/contentValidation";

interface Counts {
  added: number;
  duplicates: number;
  invalid: number;
  disallowedDomain: number;
}

interface InvitationFormProps {
  userType: "student" | "organisation";
  opportunityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PreviewTab = "email" | "message";

export const InvitationForm: React.FC<InvitationFormProps> = ({
  userType,
  opportunityId,
  onSuccess,
  onCancel,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [body, setBody] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("email");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [isRefreshingPreview, setIsRefreshingPreview] = useState(false);

  const { data: preview, isLoading: previewLoading } = useInvitePreview(opportunityId, userType);
  const previewRefresh = useInvitePreviewRefresh();
  const inviteV2 = useInviteV2();

  useEffect(() => {
    if (preview) {
      setSubject(preview.subject);
      setBody(preview.body);
      setRenderedHtml(preview.rendered_html);
      setPreviewMessage(preview.message);
    }
  }, [preview]);

  useEffect(() => {
    if (!preview || (!subject && !body)) return;
    const timer = setTimeout(async () => {
      setIsRefreshingPreview(true);
      try {
        const result = await previewRefresh.mutateAsync({ opportunityId, userType, subject, body });
        setRenderedHtml(result.rendered_html);
        setPreviewMessage(result.message);
      } finally {
        setIsRefreshingPreview(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, body]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const removeEmail = (emailToRemove: string) =>
    setEmails(emails.filter((e) => e !== emailToRemove));

  const processEmailInput = () => {
    if (!emailInput.trim()) return;
    const incoming = emailInput.split(/[\n,;]/).map((e) => e.trim()).filter(Boolean);
    const counts: Counts = { added: 0, duplicates: 0, invalid: 0, disallowedDomain: 0 };

    for (const email of incoming) {
      const valid = validateEmail(email);
      const disallowed = userType === "organisation" && valid && isDisallowedDomain(email);
      if (valid && !disallowed) {
        if (emails.includes(email)) counts.duplicates++;
        else { setEmails((prev) => [...prev, email]); counts.added++; }
      } else {
        if (disallowed) counts.disallowedDomain++;
        else counts.invalid++;
      }
    }
    setEmailInput("");
    if (counts.added > 0) toast.success(`${counts.added} email${counts.added > 1 ? "s" : ""} added`);
    if (counts.invalid > 0) toast.warning(`${counts.invalid} invalid email${counts.invalid > 1 ? "s" : ""} ignored`);
    if (counts.disallowedDomain > 0) toast.warning(`${counts.disallowedDomain} personal domain email${counts.disallowedDomain > 1 ? "s" : ""} ignored`);
    if (counts.duplicates > 0) toast.info(`${counts.duplicates} duplicate${counts.duplicates > 1 ? "s" : ""} skipped`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); processEmailInput(); }
  };

  const validateField = (value: string, setError: (msg: string) => void): boolean => {
    if (!value.trim()) { setError(""); return true; }
    const result = validateContent(value);
    if (result.status === "error") {
      setError(getContentValidationMessage(result.type));
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (emails.length === 0) { toast.error("Please add at least one email address"); return; }
    if (!opportunityId) { toast.error("No opportunity found."); return; }
    const subjectOk = validateField(subject, setSubjectError);
    const bodyOk = validateField(body, setBodyError);
    if (!subjectOk || !bodyOk) return;
    setIsSubmitting(true);
    try {
      const response = await inviteV2.mutateAsync({
        opportunityId, userType, emails,
        customEmail: subject || body ? { subject, body } : undefined,
      });
      const sent = response.invitations_sent || 0;
      const failed: Array<{ email: string; reason: string }> = response.failed_invitations ?? [];
      if (sent > 0 && failed.length === 0) toast.success(`${sent} invitation${sent > 1 ? "s" : ""} sent`);
      else if (sent > 0) {
        toast.success(`${sent} sent, ${failed.length} failed`);
        toast.error(failed.map((f) => `${f.email}: ${f.reason}`).join("\n"), { autoClose: 10000 });
      } else {
        toast.error("All invitations failed");
        if (failed.length) toast.error(failed.map((f) => `${f.email}: ${f.reason}`).join("\n"), { autoClose: 10000 });
      }
      setEmails([]); setEmailInput(""); onSuccess?.();
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.invitations_sent >= 0 && data?.failed_invitations?.length > 0) {
        if (data.invitations_sent > 0) toast.success(`${data.invitations_sent} sent`);
        const failed: Array<{ email: string; reason: string }> = data.failed_invitations;
        toast.error(failed.map((f) => `${f.email}: ${f.reason}`).join("\n"), { autoClose: 10000 });
      } else {
        toast.error(data?.detail || "Failed to send invitations.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldBorder = { border: "1px solid", borderColor: "#E4E4E7" };
  const fieldFocus = { borderColor: "#1679AB", boxShadow: "0 0 0 1px #1679AB" };

  return (
    <Box bg="white" borderRadius="12px" {...fieldBorder} p={{ base: 5, md: 8 }} w="100%" maxW="1512px">
      <VStack gap={8} align="stretch">

        {/* Centered header */}
        <VStack gap={1.5} align="center" textAlign="center">
          <HStack gap={2} justify="center">
            <Users size={22} color="#2CA9DF" />
            <Text fontSize={{ base: "20px", md: "26px" }} fontWeight="700" color="#18181B">
              Invite {userType === "student" ? "Students" : "Organisations"}
            </Text>
          </HStack>
          <Text fontSize="sm" color="#71717A" maxW="480px">
            Enter emails below and customise the invitation message. A live preview updates on the right.
            {userType === "organisation" && " Personal email domains are not accepted."}
          </Text>
        </VStack>

        {/* Two-column: LEFT = all inputs, RIGHT = preview */}
        <Flex direction={{ base: "column", lg: "row" }} gap={8} align="flex-start">

          {/* ── LEFT: all editable fields ── */}
          <VStack flex="1" align="stretch" gap={6} minW={0}>

            {/* Email input */}
            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="600" color="#3F3F46">Recipients</Text>
              <Text fontSize="xs" color="#A1A1AA">
                One per line, or separated by commas / semicolons
              </Text>
              <Textarea
                ref={textareaRef}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. john@university.edu, jane@company.com"
                resize="vertical"
                rows={4}
                borderRadius="8px"
                {...fieldBorder}
                _focus={fieldFocus}
                fontSize="sm"
                bg="#F4F4F5"
              />
              <HStack justify="flex-end">
                <ButtonV2
                  variant="secondary"
                  onClick={processEmailInput}
                  disabled={!emailInput.trim()}
                  h="38px"
                  px={4}
                  fontSize="sm"
                >
                  <HStack gap={1}><Plus size={15} /><span>Add</span></HStack>
                </ButtonV2>
              </HStack>

              {/* Added emails */}
              {emails.length > 0 && (
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between">
                    <HStack gap={1.5}>
                      <Mail size={14} color="#71717A" />
                      <Text fontSize="xs" fontWeight="600" color="#52525B">
                        Added ({emails.length})
                      </Text>
                    </HStack>
                    <Text
                      fontSize="xs"
                      color="#EF4444"
                      cursor="pointer"
                      fontWeight="500"
                      onClick={() => { setEmails([]); setEmailInput(""); }}
                    >
                      Clear all
                    </Text>
                  </HStack>
                  <Box {...fieldBorder} borderRadius="8px" p={2.5} bg="#F4F4F5" maxH="160px" overflowY="auto">
                    <Flex wrap="wrap" gap={1.5}>
                      {emails.map((email, i) => (
                        <HStack
                          key={i}
                          bg="white"
                          border="1px solid #E4E4E7"
                          borderRadius="6px"
                          px={2}
                          py={0.5}
                          gap={1}
                          maxW="280px"
                        >
                          <Tooltip content={email}>
                            <Text
                              fontSize="xs"
                              color="#18181B"
                              style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                              maxW="220px"
                            >
                              {email}
                            </Text>
                          </Tooltip>
                          <IconButton
                            aria-label="Remove"
                            onClick={() => removeEmail(email)}
                            variant="ghost"
                            size="xs"
                            color="#A1A1AA"
                            minW="auto" h="14px" w="14px"
                            _hover={{ color: "#EF4444" }}
                          >
                            <X size={11} />
                          </IconButton>
                        </HStack>
                      ))}
                    </Flex>
                  </Box>
                </VStack>
              )}
            </VStack>

            {/* Email customisation */}
            <VStack align="stretch" gap={3}>
              <Box>
                <Text fontSize="sm" fontWeight="600" color="#3F3F46">Customise invitation email</Text>
                <Text fontSize="xs" color="#A1A1AA" mt={0.5}>Optional — leave blank to use the default template</Text>
              </Box>

              {previewLoading ? (
                <Flex justify="center" py={6}><Spinner size="sm" color="#1679AB" /></Flex>
              ) : (
                <VStack align="stretch" gap={3}>
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="xs" fontWeight="500" color="#71717A">Subject</Text>
                    <Input
                      value={subject}
                      onChange={(e) => { setSubject(e.target.value); validateField(e.target.value, setSubjectError); }}
                      onBlur={() => validateField(subject, setSubjectError)}
                      borderRadius="8px"
                      border="1px solid"
                      borderColor={subjectError ? "#EF4444" : "#E4E4E7"}
                      _focus={{ borderColor: subjectError ? "#EF4444" : "#1679AB", boxShadow: `0 0 0 1px ${subjectError ? "#EF4444" : "#1679AB"}` }}
                      fontSize="sm"
                      bg="#F4F4F5"
                      h="40px"
                    />
                    {subjectError && <Text fontSize="xs" color="#EF4444">{subjectError}</Text>}
                  </VStack>
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="xs" fontWeight="500" color="#71717A">Message body</Text>
                    <Textarea
                      value={body}
                      onChange={(e) => { setBody(e.target.value); validateField(e.target.value, setBodyError); }}
                      onBlur={() => validateField(body, setBodyError)}
                      resize="vertical"
                      rows={6}
                      borderRadius="8px"
                      border="1px solid"
                      borderColor={bodyError ? "#EF4444" : "#E4E4E7"}
                      _focus={{ borderColor: bodyError ? "#EF4444" : "#1679AB", boxShadow: `0 0 0 1px ${bodyError ? "#EF4444" : "#1679AB"}` }}
                      fontSize="sm"
                      bg="#F4F4F5"
                    />
                    {bodyError
                      ? <Text fontSize="xs" color="#EF4444">{bodyError}</Text>
                      : <Text fontSize="xs" color="#A1A1AA">Plain text — blank lines become paragraph breaks</Text>
                    }
                  </VStack>
                </VStack>
              )}
            </VStack>
          </VStack>

          {/* ── RIGHT: preview only ── */}
          <VStack
            w={{ base: "100%", lg: "560px" }}
            flexShrink={0}
            align="stretch"
            gap={3}
            borderLeft={{ base: "none", lg: "1px solid #E4E4E7" }}
            pl={{ base: 0, lg: 8 }}
            borderTop={{ base: "1px solid #E4E4E7", lg: "none" }}
            pt={{ base: 6, lg: 0 }}
          >
            <Text fontSize="sm" fontWeight="600" color="#3F3F46">Preview</Text>

            {/* Tab switcher */}
            <HStack gap={0} borderRadius="8px" {...fieldBorder} overflow="hidden" w="fit-content">
              {(["email", "message"] as PreviewTab[]).map((tab) => (
                <Box
                  key={tab}
                  as="button"
                  px={3}
                  py={1.5}
                  fontSize="xs"
                  fontWeight="500"
                  bg={previewTab === tab ? "#EAF6FD" : "white"}
                  color={previewTab === tab ? "#1679AB" : "#71717A"}
                  borderRight={tab === "email" ? "1px solid #E4E4E7" : "none"}
                  onClick={() => setPreviewTab(tab)}
                  display="flex"
                  alignItems="center"
                  gap="6px"
                  _hover={{ bg: previewTab === tab ? "#EAF6FD" : "#F4F4F5" }}
                >
                  {tab === "email" ? <Eye size={12} /> : <MessageSquare size={12} />}
                  <span>{tab === "email" ? "Email" : "In-app"}</span>
                </Box>
              ))}
            </HStack>

            {/* Email preview iframe */}
            {previewTab === "email" && (
              <Box {...fieldBorder} borderRadius="8px" overflow="hidden" h="480px" position="relative">
                {(previewLoading || isRefreshingPreview) && (
                  <Flex
                    position="absolute" top={2} right={2} zIndex={1}
                    bg="white" borderRadius="6px" px={2} py={1} gap={1.5}
                    align="center" boxShadow="sm" border="1px solid #E4E4E7"
                  >
                    <Spinner size="xs" color="#1679AB" />
                    <Text fontSize="xs" color="#71717A">
                      {previewLoading ? "Loading…" : "Updating…"}
                    </Text>
                  </Flex>
                )}
                {renderedHtml ? (
                  <iframe
                    srcDoc={renderedHtml}
                    sandbox="allow-same-origin"
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Email preview"
                  />
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <Text fontSize="sm" color="#A1A1AA">No preview available</Text>
                  </Flex>
                )}
              </Box>
            )}

            {/* In-app message preview */}
            {previewTab === "message" && (
              <Box {...fieldBorder} borderRadius="8px" p={4} bg="#F9F9F9" minH="120px" maxH="480px" overflowY="auto">
                {previewMessage ? (
                  <>
                    <Text fontSize="sm" color="#3F3F46" whiteSpace="pre-wrap">{previewMessage}</Text>
                    <Text fontSize="xs" color="#A1A1AA" mt={3}>
                      Received as an in-app message by existing platform users.
                    </Text>
                  </>
                ) : (
                  <Text fontSize="sm" color="#A1A1AA">No in-app message configured.</Text>
                )}
              </Box>
            )}
          </VStack>
        </Flex>

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
              disabled={emails.length === 0}
              h="44px"
              px={6}
              fontSize="sm"
            >
              <HStack gap={2}>
                <Send size={16} />
                <span>Send{emails.length > 0 ? ` (${emails.length})` : ""} Invitations</span>
              </HStack>
            </ButtonV2>
          </HStack>
        </Box>

      </VStack>
    </Box>
  );
};
