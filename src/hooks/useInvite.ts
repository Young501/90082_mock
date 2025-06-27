import { useMutation, useQuery } from "@tanstack/react-query";
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

  const mutation = useMutation({
    mutationFn: ({
      opportunityId,
      token,
    }: {
      opportunityId: string;
      token: string;
    }) => acceptInvite(opportunityId, token),
    onSuccess: () => {
      setTimeout(() => {
        router.push("/home");
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
