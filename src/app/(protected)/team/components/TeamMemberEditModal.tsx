"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  Portal,
  VStack,
  HStack,
  Field,
  Input,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useOrganisationMemberUpdate } from "@/services/organisation";
import type { OrganisationMember } from "@/types/shared";

interface TeamMemberEditModalProps {
  member: OrganisationMember | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

export function TeamMemberEditModal({
  member,
  onClose,
  onSuccess,
  onError,
}: TeamMemberEditModalProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [platformRole, setPlatformRole] = useState<"member" | "admin">(
    "member"
  );

  const updateMember = useOrganisationMemberUpdate();

  const targetRole = (member?.platform_role ?? "member") as string;
  const canChangeRole = targetRole !== "creator";

  useEffect(() => {
    if (member) {
      setJobTitle(member.job_title ?? "");
      setPlatformRole(
        (member.platform_role === "admin" ? "admin" : "member") as
          | "member"
          | "admin"
      );
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    const payload: {
      memberId: string;
      platform_role?: "member" | "admin";
      job_title?: string;
    } = {
      memberId: String(member.id),
    };
    if (canChangeRole) payload.platform_role = platformRole;
    payload.job_title = jobTitle.trim() || undefined;

    updateMember.mutate(payload, {
      onSuccess,
      onError: (err) => {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 403) {
          onError(
            new Error("You don't have permission to change this member.")
          );
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
                  Edit{" "}
                  {([member.first_name, member.last_name]
                    .filter(Boolean)
                    .join(" ") ||
                    member.full_name) ??
                    "Member"}
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
            <form onSubmit={handleSubmit}>
              <Dialog.Body p={{ base: 4, md: 6 }}>
                <VStack align="stretch" gap={4}>
                  {canChangeRole && (
                    <Field.Root>
                      <Field.Label>Role</Field.Label>
                      <select
                        value={platformRole}
                        onChange={(e) =>
                          setPlatformRole(e.target.value as "member" | "admin")
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E4E4E7",
                          fontSize: "14px",
                        }}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </Field.Root>
                  )}
                  <Field.Root>
                    <Field.Label>Job title</Field.Label>
                    <Input
                      placeholder="e.g. Marketing Manager"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </Field.Root>
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
                    onClick={onClose}
                    h="36px"
                    fontSize="14px"
                    fontWeight="600"
                    color="black"
                  >
                    Cancel
                  </ButtonV2>
                  <ButtonV2
                    type="submit"
                    variant="primary"
                    isLoading={updateMember.isPending}
                    h="36px"
                    fontSize="14px"
                    fontWeight="600"
                  >
                    Save Changes
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
