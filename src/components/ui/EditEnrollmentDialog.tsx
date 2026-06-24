"use client";

import React from "react";
import {
  Dialog,
  Portal,
  Flex,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { ButtonV2 } from "./ButtonV2";
import {
  QuestionnaireForm,
  QuestionnaireFormRef,
  QuestionnaireSection,
} from "@/components/questionnaire/QuestionnaireForm";
import { X } from "lucide-react";

interface EditEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  sections: QuestionnaireSection[];
  initialValues: Record<string, any>;
  onAnswersChange: (values: Record<string, any>) => void;
  onSave: () => void | Promise<void>;
  isSaving: boolean;
  formRef: React.RefObject<QuestionnaireFormRef | null>;
  university?: { slug?: string; name?: string } | null;
}

export function EditEnrollmentDialog({
  open,
  onOpenChange,
  sections,
  initialValues,
  onAnswersChange,
  onSave,
  isSaving,
  formRef,
  university,
}: EditEnrollmentDialogProps) {
  const hasQuestionnaire = sections.length > 0;
  const handleClose = () => onOpenChange({ open: false });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details)}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" style={{ zIndex: 10000 }} />
        <Dialog.Positioner zIndex={10000}>
          <Dialog.Content
            maxW="682px"
            maxH="90vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            zIndex={10000}
          >
            <Dialog.Header borderBottom="1px solid #E5E7EB" pb={4}>
              <Flex justify="space-between" align="center" w="full">
                <Dialog.Title fontSize="2xl" fontWeight="600" color="#111827">
                  Edit Enrollment Answers
                </Dialog.Title>
                <IconButton
                  aria-label="Close"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                >
                  <X size={16} color="#6B7280" />
                </IconButton>
              </Flex>
            </Dialog.Header>

            <Dialog.Body overflowY="auto" py={4}>
              {hasQuestionnaire ? (
                <QuestionnaireForm
                  ref={formRef}
                  sections={sections}
                  initialValues={initialValues}
                  onAnswersChange={onAnswersChange}
                  university={university}
                  props={{ p: 0, border: "none" }}
                />
              ) : (
                <Text fontSize="sm" color="#6B7280" textAlign="center" py={6}>
                  No questionnaire available for this opportunity.
                </Text>
              )}
            </Dialog.Body>

            <Dialog.Footer borderTop="1px solid #E5E7EB" pt={4}>
              <HStack gap={3} w="full" justify="flex-end">
                <ButtonV2
                  variant="ghost"
                  color="#6B7280"
                  border="1px solid #E5E7EB"
                  borderRadius="xl"
                  h="44px"
                  fontSize="sm"
                  px={4}
                  onClick={handleClose}
                >
                  Cancel
                </ButtonV2>
                <ButtonV2
                  variant="secondary"
                  h="44px"
                  fontSize="sm"
                  px={5}
                  isLoading={isSaving}
                  onClick={onSave}
                >
                  Save an Update
                </ButtonV2>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
