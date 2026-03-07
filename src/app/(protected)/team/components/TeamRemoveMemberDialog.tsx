"use client";

import React from "react";
import {
  Dialog,
  Portal,
  VStack,
  HStack,
  Text,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useOrganisationMemberRemove } from "@/services/organisation";
import type { OrganisationMember } from "@/types/shared";

interface TeamRemoveMemberDialogProps {
  member: OrganisationMember | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

export function TeamRemoveMemberDialog({
  member,
  onClose,
  onSuccess,
  onError,
}: TeamRemoveMemberDialogProps) {
  const removeMember = useOrganisationMemberRemove();

  const handleConfirm = () => {
    if (!member) return;

    removeMember.mutate(String(member.id), {
      onSuccess,
      onError: (err) => {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 403) {
          onError(
            new Error("You don't have permission to remove this member.")
          );
        } else if (status === 400) {
          onError(err);
        } else if (status === 404) {
          onError(new Error("Member not found."));
        } else {
          onError(err);
        }
      },
    });
  };

  if (!member) return null;

  return (
    <Dialog.Root
      open={!!member}
      onOpenChange={(d) => !d.open && onClose()}
      placement="center"
    >
      <Portal>
        <Dialog.Positioner
          zIndex={9999}
          style={{ backdropFilter: "blur(4px)" }}
        >
          <Dialog.Content maxW={{ base: "90%", md: "480px" }} zIndex={10000}>
            <Dialog.Header p={{ base: 4, md: 6 }}>
              <HStack justify="space-between" w="full" align="center">
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  Remove Member
                </Dialog.Title>
                <IconButton
                  aria-label="Close"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X size={18} />
                </IconButton>
              </HStack>
            </Dialog.Header>
            <Dialog.Body p={{ base: 4, md: 6 }}>
              <Text fontSize="sm" color="#52525B">
                Are you sure you want to remove{" "}
                <Text as="span" fontWeight="600">
                  {[member.first_name, member.last_name]
                    .filter(Boolean)
                    .join(" ") ?? "this member"}
                </Text>{" "}
                from the team? They will lose access to the organisation.
              </Text>
            </Dialog.Body>
            <Dialog.Footer p={{ base: 4, md: 6 }}>
              <Flex
                direction={{ base: "column", md: "row" }}
                gap={3}
                w="full"
                justify="flex-end"
              >
                <ButtonV2
                  variant="ghost"
                  borderRadius="8px"
                  h="36px"
                  fontSize="14px"
                  fontWeight="600"
                  color="black"
                  onClick={onClose}
                >
                  Cancel
                </ButtonV2>
                <ButtonV2
                  bg="#DC2626"
                  color="white"
                  _hover={{ bg: "#B91C1C" }}
                  onClick={handleConfirm}
                  isLoading={removeMember.isPending}
                  fontSize="14px"
                  h="36px"
                >
                  Remove Member
                </ButtonV2>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
