import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getOpportunityDetail, acceptInvite } from "@/services/invite";

export const useOpportunityDetail = (opportunityId: string) => {
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const query = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: () => getOpportunityDetail(opportunityId),
    enabled: !!opportunityId,
    retry: 1,
  });

  return {
    ...query,
    isLoading: query.isLoading || minLoadingTime,
  };
};

export const useAcceptInvite = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      opportunityId,
      token,
      questionnaire_answers,
    }: {
      opportunityId: string;
      token: string;
      questionnaire_answers?: Record<string, any>;
    }) => acceptInvite(opportunityId, token, questionnaire_answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accepted-opportunities"] });
      setTimeout(() => {
        router.push("/discover");
      }, 3000);
    },
  });

  const getFormattedError = () => {
    if (!mutation.isError || !mutation.error) {
      return null;
    }

    const error = mutation.error as any;

    return error?.response?.data?.detail || "Failed to accept invitation";
  };

  return {
    ...mutation,
    formattedError: getFormattedError(),
  };
};
