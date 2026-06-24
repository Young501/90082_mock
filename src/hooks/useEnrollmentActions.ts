"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { QuestionnaireFormRef } from "@/components/questionnaire/QuestionnaireForm";
import { getErrorMessage } from "@/utils/apiErrorHandling";
import { getQuestionnaireSections } from "@/utils/opportunityQuestionnaire";
import { useResolveTaxonomyLabelsToCodes } from "@/hooks/useResolveTaxonomyLabelsToCodes";
import { useOpportunityParticipant } from "@/services/shared";
import { useUpdateOpportunityParticipant } from "@/services/updateParticipant";

export interface UseEnrollmentActionsParams {
  opportunityId: number;
  questionnaire?: unknown;
  userType?: string;
  isEnrolled: boolean;
  isHidden?: boolean;
  university?: { slug?: string; name?: string } | null;
  onUnenrollSuccess?: () => void;
}

export function useEnrollmentActions({
  opportunityId,
  questionnaire,
  userType,
  isEnrolled,
  isHidden = false,
  university,
  onUnenrollSuccess,
}: UseEnrollmentActionsParams) {
  const [isEditEnrollmentOpen, setIsEditEnrollmentOpen] = useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false);
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  const [editAnswers, setEditAnswers] = useState<Record<string, any>>({});
  const editFormRef = useRef<QuestionnaireFormRef>(null);

  const {
    data: participantRecord,
    isLoading: isParticipantLoading,
    error: participantError,
  } = useOpportunityParticipant(opportunityId, isEnrolled);
  const updateParticipantMutation = useUpdateOpportunityParticipant();
  const {
    resolve: resolveTaxonomyLabelsToCodes,
    isResolving: isResolvingEditAnswers,
  } = useResolveTaxonomyLabelsToCodes();

  const questionnaireSections = useMemo(
    () => getQuestionnaireSections(questionnaire, userType),
    [questionnaire, userType]
  );
  const hasQuestionnaire = questionnaireSections.length > 0;

  const handleAnswersChange = useCallback((values: Record<string, any>) => {
    setEditAnswers(values);
  }, []);

  const handleOpenEditEnrollment = useCallback(async () => {
    const rawAnswers = participantRecord?.data?.questionnaire_answers ?? {};

    // Backend returns an array of { field, label, value } entries, or
    // (in older shapes) an object keyed by field — unwrap to flat { field: value } for the form
    const entries = Array.isArray(rawAnswers)
      ? rawAnswers.map((entry: any) => [entry?.field, entry])
      : Object.entries(rawAnswers);

    const flatAnswers = Object.fromEntries(
      entries
        .filter(([key]) => key != null)
        .map(([key, entry]) => {
          const isEntryObject =
            entry && typeof entry === "object" && "value" in entry;
          return [key, isEntryObject ? (entry as any).value : entry];
        })
    );

    try {
      const resolved = await resolveTaxonomyLabelsToCodes(
        questionnaireSections,
        flatAnswers,
        university?.slug
      );
      setEditAnswers(resolved);
    } catch {
      setEditAnswers(flatAnswers);
    }
    setIsEditEnrollmentOpen(true);
  }, [
    participantRecord?.data?.questionnaire_answers,
    questionnaireSections,
    resolveTaxonomyLabelsToCodes,
    university?.slug,
  ]);

  const handleSaveEnrollmentAnswers = useCallback(async () => {
    if (!editFormRef.current) return;
    const isValid = await editFormRef.current.validate();
    if (!isValid) return;

    const data = editFormRef.current.getValues();
    try {
      await updateParticipantMutation.mutateAsync({
        opportunityId,
        questionnaireAnswers: data,
      });
      toast.success("Enrollment answers saved!");
      setIsEditEnrollmentOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save answers"));
    }
  }, [opportunityId, updateParticipantMutation]);

  const handleUnenrollClick = useCallback(
    () => setIsUnenrollDialogOpen(true),
    []
  );

  const confirmUnenroll = useCallback(async () => {
    try {
      await updateParticipantMutation.mutateAsync({
        opportunityId,
        accepted: false,
      });
      toast.success("Successfully unenrolled from opportunity!");
      setIsUnenrollDialogOpen(false);
      onUnenrollSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to unenroll"));
    }
  }, [opportunityId, updateParticipantMutation, onUnenrollSuccess]);

  const handleHideClick = useCallback(() => setIsHideDialogOpen(true), []);

  const confirmToggleHidden = useCallback(async () => {
    try {
      await updateParticipantMutation.mutateAsync({
        opportunityId,
        hidden: !isHidden,
      });
      toast.success(
        isHidden
          ? "Your profile is now visible to peers."
          : "Your profile is now hidden from peers."
      );
      setIsHideDialogOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update visibility"));
    }
  }, [opportunityId, updateParticipantMutation, isHidden]);

  return {
    participantRecord,
    isParticipantLoading,
    participantError,
    isEditEnrollmentOpen,
    setIsEditEnrollmentOpen,
    isUnenrollDialogOpen,
    setIsUnenrollDialogOpen,
    isHideDialogOpen,
    setIsHideDialogOpen,
    isHidden,
    editAnswers,
    handleAnswersChange,
    editFormRef,
    questionnaireSections,
    hasQuestionnaire,
    isResolvingEditAnswers,
    updateParticipantMutation,
    handleOpenEditEnrollment,
    handleSaveEnrollmentAnswers,
    handleUnenrollClick,
    confirmUnenroll,
    handleHideClick,
    confirmToggleHidden,
  };
}
