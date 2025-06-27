import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getOpportunityDetail, acceptInvite } from "@/services/invite";
import { useInviteStore } from "@/store";

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
  const { setAccepting, setAcceptError } = useInviteStore();

  return useMutation({
    mutationFn: ({
      opportunityId,
      token,
    }: {
      opportunityId: string;
      token: string;
    }) => acceptInvite(opportunityId, token),
    onMutate: () => {
      setAccepting(true);
      setAcceptError(null);
    },
    onSuccess: () => {
      setAccepting(false);
      setTimeout(() => {
        router.push("/home");
      }, 3000);
    },
    onError: (error: any) => {
      setAccepting(false);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to accept invitation";
      setAcceptError(errorMessage);
    },
  });
};
