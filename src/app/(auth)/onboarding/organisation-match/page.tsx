"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { OrganisationMatchPage } from "../OrganisationMatchPage";
import { Organisation } from "@/types/shared";
import { Box, Text, Spinner } from "@chakra-ui/react";
import Loader from "@/components/Loader";

export default function OrganisationMatchPageRoute() {
  const router = useRouter();
  const { getTempOrganisation, clearTempOrganisation } = useAuthStore();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tempOrg = getTempOrganisation();

    if (!tempOrg) {
      setError("No organisation data found");
      setIsLoading(false);
      return;
    }

    setOrganisation(tempOrg);
    setIsLoading(false);
  }, [getTempOrganisation]);

  const handleConfirm = () => {
    const { setUserType } = useAuthStore.getState();
    setUserType("organisation");
    router.push("/onboarding");
  };

  if (isLoading) {
    return <Loader type="page" text="Loading organisation details..." />;
  }

  if (error || !organisation) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        h="100vh"
        gap={4}
      >
        <Text color="red.500">{error || "Organisation not found"}</Text>
        <Text
          color="blue.500"
          cursor="pointer"
          onClick={() => {
            clearTempOrganisation();
            router.push("/onboarding/");
          }}
        >
          Continue to onboarding
        </Text>
      </Box>
    );
  }

  return (
    <OrganisationMatchPage
      organisation={organisation}
      onConfirm={handleConfirm}
    />
  );
}
