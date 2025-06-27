import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getOpportunityDetail, acceptInvite } from "@/services/invite";
import { useInviteStore } from "@/store";

export const useOpportunityDetail = (opportunityId: string) => {
  return useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: () => getOpportunityDetail(opportunityId),
    enabled: !!opportunityId,
    retry: 1,
  });
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
    onSuccess: (data) => {
      setAccepting(false);

      router.push("/home");
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
