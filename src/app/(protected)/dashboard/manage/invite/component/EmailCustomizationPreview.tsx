"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { Eye, MessageSquare } from "lucide-react";
import { useInvitePreview, useInvitePreviewRefresh } from "@/services/shared";
import {
  validateContent,
  getContentValidationMessage,
} from "@/utils/contentValidation";

type PreviewTab = "email" | "message";

interface EmailCustomizationPreviewProps {
  opportunityId: string;
  userType: "student" | "organisation";
  subject: string;
  onSubjectChange: (value: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
  isResend?: boolean;
}

export const EmailCustomizationPreview: React.FC<
  EmailCustomizationPreviewProps
> = ({
  opportunityId,
  userType,
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  isResend = false,
}) => {
  const [subjectError, setSubjectError] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("email");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [isRefreshingPreview, setIsRefreshingPreview] = useState(false);

  const { data: preview, isLoading: previewLoading } = useInvitePreview(
    opportunityId,
    userType,
    isResend
  );
  const previewRefresh = useInvitePreviewRefresh();

  useEffect(() => {
    if (preview) {
      setRenderedHtml(preview.rendered_html);
      setPreviewMessage(preview.message);
      if (preview.subject) onSubjectChange(preview.subject);
      if (preview.body) onBodyChange(preview.body);
    }
    // onSubjectChange and onBodyChange are stable setters — intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  useEffect(() => {
    if (!preview || (!subject && !body)) return;
    const timer = setTimeout(async () => {
      setIsRefreshingPreview(true);
      try {
        const result = await previewRefresh.mutateAsync({
          opportunityId,
          userType,
          subject,
          body,
          isResend,
        });
        setRenderedHtml(result.rendered_html);
        setPreviewMessage(result.message);
      } finally {
        setIsRefreshingPreview(false);
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, body]);

  const validateField = (
    value: string,
    setError: (msg: string) => void
  ): boolean => {
    if (!value.trim()) {
      setError("");
      return true;
    }
    const result = validateContent(value);
    if (result.status === "error") {
      setError(getContentValidationMessage(result.type));
      return false;
    }
    setError("");
    return true;
  };

  const fieldBorder = { border: "1px solid", borderColor: "#E4E4E7" };

  return (
    <Flex direction={{ base: "column", lg: "row" }} gap={8} align="flex-start">
      {/* LEFT: Customisation fields */}
      <VStack flex="1" align="stretch" gap={3} minW={0}>
        <Box>
          <Text fontSize="sm" fontWeight="600" color="#3F3F46">
            Customise invitation email
          </Text>
          <Text fontSize="xs" color="#A1A1AA" mt={0.5}>
            Optional — leave blank to use the default template
          </Text>
        </Box>

        {previewLoading ? (
          <Flex justify="center" py={6}>
            <Spinner size="sm" color="#1679AB" />
          </Flex>
        ) : (
          <VStack align="stretch" gap={3}>
            <VStack align="stretch" gap={1}>
              <Text fontSize="xs" fontWeight="500" color="#71717A">
                Subject
              </Text>
              <Input
                value={subject}
                onChange={(e) => {
                  onSubjectChange(e.target.value);
                  validateField(e.target.value, setSubjectError);
                }}
                onBlur={() => validateField(subject, setSubjectError)}
                borderRadius="8px"
                border="1px solid"
                borderColor={subjectError ? "#EF4444" : "#E4E4E7"}
                _focus={{
                  borderColor: subjectError ? "#EF4444" : "#1679AB",
                  boxShadow: `0 0 0 1px ${subjectError ? "#EF4444" : "#1679AB"}`,
                }}
                fontSize="sm"
                bg="#F4F4F5"
                h="40px"
              />
              {subjectError && (
                <Text fontSize="xs" color="#EF4444">
                  {subjectError}
                </Text>
              )}
            </VStack>
            <VStack align="stretch" gap={1}>
              <Text fontSize="xs" fontWeight="500" color="#71717A">
                Message body
              </Text>
              <Textarea
                value={body}
                onChange={(e) => {
                  onBodyChange(e.target.value);
                  validateField(e.target.value, setBodyError);
                }}
                onBlur={() => validateField(body, setBodyError)}
                resize="vertical"
                minH="390px"
                borderRadius="8px"
                border="1px solid"
                borderColor={bodyError ? "#EF4444" : "#E4E4E7"}
                _focus={{
                  borderColor: bodyError ? "#EF4444" : "#1679AB",
                  boxShadow: `0 0 0 1px ${bodyError ? "#EF4444" : "#1679AB"}`,
                }}
                fontSize="sm"
                bg="#F4F4F5"
              />
              {bodyError ? (
                <Text fontSize="xs" color="#EF4444">
                  {bodyError}
                </Text>
              ) : (
                <Text fontSize="xs" color="#A1A1AA">
                  Plain text — blank lines become paragraph breaks
                </Text>
              )}
            </VStack>
          </VStack>
        )}
      </VStack>

      {/* RIGHT: Preview */}
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
        <Text fontSize="sm" fontWeight="600" color="#3F3F46">
          Preview
        </Text>

        <HStack
          gap={0}
          borderRadius="8px"
          {...fieldBorder}
          overflow="hidden"
          w="fit-content"
        >
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
              {tab === "email" ? (
                <Eye size={12} />
              ) : (
                <MessageSquare size={12} />
              )}
              <span>{tab === "email" ? "Email" : "In-app"}</span>
            </Box>
          ))}
        </HStack>

        {previewTab === "email" && (
          <Box
            {...fieldBorder}
            borderRadius="8px"
            overflow="hidden"
            h="480px"
            position="relative"
          >
            {(previewLoading || isRefreshingPreview) && (
              <Flex
                position="absolute"
                top={2}
                right={2}
                zIndex={1}
                bg="white"
                borderRadius="6px"
                px={2}
                py={1}
                gap={1.5}
                align="center"
                boxShadow="sm"
                border="1px solid #E4E4E7"
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
                <Text fontSize="sm" color="#A1A1AA">
                  No preview available
                </Text>
              </Flex>
            )}
          </Box>
        )}

        {previewTab === "message" && (
          <Box
            {...fieldBorder}
            borderRadius="8px"
            p={4}
            bg="#F9F9F9"
            minH="120px"
            maxH="480px"
            overflowY="auto"
          >
            {previewMessage ? (
              <>
                <Text fontSize="sm" color="#3F3F46" whiteSpace="pre-wrap">
                  {previewMessage}
                </Text>
                <Text fontSize="xs" color="#A1A1AA" mt={3}>
                  Received as an in-app message by existing platform users.
                </Text>
              </>
            ) : (
              <Text fontSize="sm" color="#A1A1AA">
                No in-app message configured.
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Flex>
  );
};
