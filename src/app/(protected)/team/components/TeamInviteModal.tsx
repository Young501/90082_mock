"use client";

import React, { useState } from "react";
import {
  Dialog,
  Portal,
  VStack,
  HStack,
  Text,
  Field,
  Input,
  IconButton,
  Select,
  createListCollection,
  Flex,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useOrganisationInviteSend } from "@/services/organisation";

const roleOptions = createListCollection({
  items: [
    { label: "Member", value: "member" },
    { label: "Admin", value: "admin" },
  ],
});

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

export function TeamInviteModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: TeamInviteModalProps) {
  const [email, setEmail] = useState("");
  const [platformRole, setPlatformRole] = useState<"member" | "admin">(
    "member"
  );
  const sendInvite = useOrganisationInviteSend();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    sendInvite.mutate(
      { email: email.trim(), platform_role: platformRole },
      {
        onSuccess: () => {
          setEmail("");
          setPlatformRole("member");
          onSuccess();
        },
        onError: (err) => {
          const status = (err as { response?: { status?: number } })?.response
            ?.status;
          if (status === 403) {
            onError(new Error("You don't have permission to send invites."));
          } else if (status === 400) {
            onError(err);
          } else {
            onError(err);
          }
        },
      }
    );
  };

  const handleClose = () => {
    setEmail("");
    setPlatformRole("member");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(d) => !d.open && handleClose()}
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
                  Invite Member
                </Dialog.Title>
                <IconButton
                  aria-label="Close"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                >
                  <X size={18} />
                </IconButton>
              </HStack>
            </Dialog.Header>
            <form onSubmit={handleSubmit}>
              <Dialog.Body overflow="visible" p={{ base: 4, md: 6 }}>
                <VStack align="stretch" gap={4}>
                  <Field.Root>
                    <Field.Label>Email address</Field.Label>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </Field.Root>
                  <Select.Root
                    value={[platformRole]}
                    onValueChange={(details) =>
                      setPlatformRole(
                        (details.value[0] ?? "member") as "member" | "admin"
                      )
                    }
                    collection={roleOptions}
                  >
                    <Select.Label>Role</Select.Label>
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select role" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {roleOptions.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </VStack>
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
                    fontSize="14px"
                    fontWeight="600"
                    onClick={handleClose}
                    color="black"
                  >
                    Cancel
                  </ButtonV2>
                  <ButtonV2
                    type="submit"
                    variant="primary"
                    isLoading={sendInvite.isPending}
                    disabled={!email.trim()}
                    h="36px"
                    fontSize="14px"
                  >
                    Send Invite
                  </ButtonV2>
                </Flex>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
