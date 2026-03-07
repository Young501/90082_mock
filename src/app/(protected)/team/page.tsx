"use client";

import React, { useMemo } from "react";
import {
  Box,
  Container,
  Text,
  VStack,
  HStack,
  Flex,
  Image,
  IconButton,
  SimpleGrid,
  Separator,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import Loader from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import {
  useOrganisationMembers,
  useOrganisationInvites,
  useOrganisationMemberMeV2,
  useOrganisationInviteRevoke,
  useOrganisationMemberUpdate,
} from "@/services/organisation";
import type {
  OrganisationMember,
  OrganisationPlatformRole,
} from "@/types/shared";
import type { OrganisationSentInvite } from "@/types/shared";
import { TeamInviteModal } from "./components/TeamInviteModal";
import { TeamMemberEditModal } from "./components/TeamMemberEditModal";
import { TeamRemoveMemberDialog } from "./components/TeamRemoveMemberDialog";
import { MenuPopover } from "@/components/ui/MenuPopover";
import {
  Plus,
  MoreVertical,
  User,
  Trash2,
  Mail,
  Check,
  UserCog,
} from "lucide-react";
import { getErrorMessage } from "@/utils/apiErrorHandling";
import { toast } from "react-toastify";

function getRoleLabel(role?: string): string {
  if (!role) return "—";
  const labels: Record<string, string> = {
    creator: "Creator",
    admin: "Admin",
    member: "Member",
  };
  return labels[role] ?? role;
}

function getMemberDisplayName(member: OrganisationMember): string {
  const parts = [member.first_name, member.last_name].filter(Boolean);
  return parts.length > 0
    ? parts.join(" ")
    : (member.full_name ?? "No name available");
}

function getInitials(name?: string, email?: string): string {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Role-based permission helpers per the spec */
function canSendInvite(role?: OrganisationPlatformRole): boolean {
  return role === "creator" || role === "admin";
}

function canRevokeInvite(role?: OrganisationPlatformRole): boolean {
  return role === "creator" || role === "admin";
}

function canChangeMemberRoleOrTitle(
  myRole: OrganisationPlatformRole | undefined,
  targetRole: OrganisationPlatformRole | undefined
): boolean {
  if (!myRole) return false;
  if (myRole === "creator") return true;
  if (myRole === "admin") return targetRole === "member";
  return false;
}

function canRemoveMember(
  myRole: OrganisationPlatformRole | undefined,
  targetRole: OrganisationPlatformRole | undefined,
  targetId: number,
  myMemberId?: number
): boolean {
  if (!myRole || targetId === myMemberId) return false;
  if (targetRole === "creator") return false;
  if (myRole === "creator") return true;
  if (myRole === "admin") return targetRole === "member";
  return false;
}

export default function TeamPage() {
  const router = useRouter();
  const userType = useAuthStore((s) => s.getUserType()) ?? "";
  const isOrganisation = userType === "organisation";

  const { platformRole } = useProfile(isOrganisation ? userType : "");
  const { data: memberMe } = useOrganisationMemberMeV2(isOrganisation);
  const { data: membersData, isLoading: membersLoading } =
    useOrganisationMembers(isOrganisation);
  const { data: invitesData } = useOrganisationInvites(
    "pending",
    isOrganisation
  );

  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [editMember, setEditMember] = React.useState<OrganisationMember | null>(
    null
  );
  const [removeMember, setRemoveMember] =
    React.useState<OrganisationMember | null>(null);
  const myMemberId = (memberMe as { id?: number })?.id;
  const myRole = (platformRole ??
    (memberMe as { platform_role?: OrganisationPlatformRole })
      ?.platform_role) as OrganisationPlatformRole | undefined;

  const members: OrganisationMember[] = useMemo(() => {
    const raw = membersData as
      | { results?: OrganisationMember[] }
      | OrganisationMember[]
      | undefined;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.results ?? [];
  }, [membersData]);

  const pendingInvites: OrganisationSentInvite[] = useMemo(() => {
    const raw = invitesData as
      | { results?: OrganisationSentInvite[] }
      | OrganisationSentInvite[]
      | undefined;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.results ?? [];
  }, [invitesData]);

  // Redirect non-organisation users
  React.useEffect(() => {
    if (!userType) return;
    if (userType !== "organisation") {
      router.replace("/home/");
    }
  }, [userType, router]);

  if (!isOrganisation) {
    return (
      <Container maxW="1512px" py={8} mx="auto">
        <Loader size="lg" />
      </Container>
    );
  }

  if (membersLoading) {
    return (
      <>
        <PageTitle title={PAGE_TITLES.TEAM} />
        <Container maxW="1512px" py={8} mx="auto">
          <VStack gap={4} minH="400px" justify="center">
            <Loader size="xl" />
            <Text>Loading team...</Text>
          </VStack>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageTitle title={PAGE_TITLES.TEAM} />
      <Box maxW="1512px" mx="auto">
        <Container maxW="100%" px={0}>
          <VStack align="stretch" gap={6}>
            <Text fontSize="2xl" fontWeight="bold" color="#000000">
              Team Members
            </Text>

            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              gap={4}
              w="full"
            >
              {canSendInvite(myRole) && (
                <AddMemberCard onClick={() => setInviteModalOpen(true)} />
              )}

              {members.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  myRole={myRole}
                  myMemberId={myMemberId}
                  canEdit={canChangeMemberRoleOrTitle(
                    myRole,
                    (member.platform_role ??
                      "member") as OrganisationPlatformRole
                  )}
                  canRemove={canRemoveMember(
                    myRole,
                    (member.platform_role ??
                      "member") as OrganisationPlatformRole,
                    member.id,
                    myMemberId
                  )}
                  onEdit={() => setEditMember(member)}
                  onRemove={() => setRemoveMember(member)}
                />
              ))}
            </SimpleGrid>

            {members.length === 0 && !canSendInvite(myRole) && (
              <Flex
                py={12}
                justify="center"
                align="center"
                color="gray.500"
                fontSize="sm"
              >
                No team members yet.
              </Flex>
            )}

            {pendingInvites.length > 0 && (
              <VStack align="stretch" gap={4} w="full">
                <Text fontSize="xl" fontWeight="bold" color="#000000">
                  Invites
                </Text>
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  gap={4}
                  w="full"
                >
                  {pendingInvites.map((invite) => (
                    <TeamInviteCard
                      key={invite.id}
                      invite={invite}
                      canManage={canRevokeInvite(myRole)}
                      onRevokeError={(err) =>
                        toast.error(
                          getErrorMessage(err, "Failed to revoke invite")
                        )
                      }
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>

      <TeamInviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => setInviteModalOpen(false)}
        onError={(err) =>
          toast.error(getErrorMessage(err, "Failed to send invite"))
        }
      />

      <TeamMemberEditModal
        member={editMember}
        onClose={() => setEditMember(null)}
        onSuccess={() => setEditMember(null)}
        onError={(err) =>
          toast.error(getErrorMessage(err, "Failed to update member"))
        }
      />

      <TeamRemoveMemberDialog
        member={removeMember}
        onClose={() => setRemoveMember(null)}
        onSuccess={() => setRemoveMember(null)}
        onError={(err) =>
          toast.error(getErrorMessage(err, "Failed to remove member"))
        }
      />
    </>
  );
}

function AddMemberCard({ onClick }: { onClick: () => void }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      bg="gray.50"
      border="1px solid #E4E4E7"
      borderRadius="12px"
      p={6}
      minH="180px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={3}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        bg: "gray.100",
        borderColor: "profile.500",
      }}
    >
      <Box
        w={12}
        h={12}
        borderRadius="4px"
        bg="#E9F7F6"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Plus color="#1F7F7B" size={24} />
      </Box>
      <Text fontSize="sm" fontWeight="500" color="#1F7F7B">
        Add new team member
      </Text>
    </Box>
  );
}

interface TeamMemberCardProps {
  member: OrganisationMember;
  myRole: OrganisationPlatformRole | undefined;
  myMemberId?: number;
  canEdit: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

function TeamMemberCard({
  member,
  myRole,
  canEdit,
  canRemove,
  onEdit,
  onRemove,
}: TeamMemberCardProps) {
  const updateMember = useOrganisationMemberUpdate();
  const displayName = getMemberDisplayName(member);
  const targetRole = (member.platform_role ??
    "member") as OrganisationPlatformRole;
  const canChangeRole = targetRole !== "creator";

  const handleMakeAdmin = () => {
    if (!canChangeRole) return;
    updateMember.mutate(
      { memberId: String(member.id), platform_role: "admin" },
      {
        onError: (err) =>
          toast.error(getErrorMessage(err, "Failed to update role")),
      }
    );
  };

  const handleMakeMember = () => {
    if (!canChangeRole) return;
    updateMember.mutate(
      { memberId: String(member.id), platform_role: "member" },
      {
        onError: (err) =>
          toast.error(getErrorMessage(err, "Failed to update role")),
      }
    );
  };

  const showMenu = canEdit || canRemove;

  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid #E4E4E7"
      p={5}
      position="relative"
      minH="180px"
      display="flex"
      flexDirection="column"
    >
      {showMenu && (
        <Box position="absolute" top={3} right={3} zIndex={1}>
          <MenuPopover
            placement="bottom-end"
            minW="180px"
            contentProps={{
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              py: 2,
            }}
            trigger={
              <IconButton variant="ghost" size="sm" aria-label="More options">
                <MoreVertical size={18} color="#71717A" />
              </IconButton>
            }
          >
            {canEdit && canChangeRole && (
              <>
                <Box
                  as="button"
                  w="full"
                  textAlign="left"
                  px={4}
                  py={2}
                  fontSize="14px"
                  fontWeight="500"
                  color="#2D3748"
                  borderRadius="md"
                  _hover={{ bg: "#F7FAFC" }}
                  onClick={handleMakeAdmin}
                >
                  <HStack gap={2} justify="space-between" w="full">
                    <HStack gap={2}>
                      <UserCog size={14} />
                      <Text>Make Admin</Text>
                    </HStack>
                    {targetRole === "admin" && (
                      <Check size={16} color="var(--profile-500)" />
                    )}
                  </HStack>
                </Box>
                <Box
                  as="button"
                  w="full"
                  textAlign="left"
                  px={4}
                  py={2}
                  fontSize="14px"
                  fontWeight="500"
                  color="#2D3748"
                  borderRadius="md"
                  _hover={{ bg: "#F7FAFC" }}
                  onClick={handleMakeMember}
                >
                  <HStack gap={2} justify="space-between" w="full">
                    <HStack gap={2}>
                      <UserCog size={14} />
                      <Text>Make Member</Text>
                    </HStack>
                    {targetRole === "member" && (
                      <Check size={16} color="var(--profile-500)" />
                    )}
                  </HStack>
                </Box>
              </>
            )}
            {canEdit && !canChangeRole && (
              <Box
                as="button"
                w="full"
                textAlign="left"
                px={4}
                py={2}
                fontSize="14px"
                fontWeight="500"
                color="#2D3748"
                borderRadius="md"
                _hover={{ bg: "#F7FAFC" }}
                onClick={onEdit}
              >
                <HStack gap={2}>
                  <UserCog size={14} />
                  <Text>Edit role / job title</Text>
                </HStack>
              </Box>
            )}
            {canRemove && (
              <Box
                as="button"
                w="full"
                textAlign="left"
                px={4}
                py={2}
                fontSize="14px"
                fontWeight="500"
                color="#DC2626"
                borderRadius="md"
                _hover={{ bg: "#FEF2F2" }}
                onClick={onRemove}
              >
                <HStack gap={2}>
                  <Trash2 size={14} />
                  <Text>Remove member</Text>
                </HStack>
              </Box>
            )}
          </MenuPopover>
        </Box>
      )}

      <VStack align="center" gap={2} flex={1}>
        <Box
          w={14}
          h={14}
          borderRadius="full"
          overflow="hidden"
          flexShrink={0}
          bg="profile.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {member.profile_picture_url ? (
            <Image
              src={member.profile_picture_url}
              alt={displayName}
              w="100%"
              h="100%"
              objectFit="cover"
            />
          ) : (
            <Text color="white" fontWeight="600" fontSize="sm">
              {getInitials(displayName, member.email)}
            </Text>
          )}
        </Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          color="#000000"
          textAlign="center"
          truncate
        >
          {displayName}
        </Text>
        <Text fontSize="sm" color="#52525B" textAlign="center">
          {member.job_title ?? "(No role available)"}
        </Text>
        <Box
          px={2}
          py={0.5}
          borderRadius="md"
          bg="#F4F4F5"
          color="#000000"
          fontSize="xs"
          fontWeight="500"
          boxShadow="0px 0px 1px 0px #D4D4D8 inset"
        >
          {getRoleLabel(member.platform_role)}
        </Box>
        <Box height="1px" width="full" bg="#E4E4E7" />
        {/* <Separator color="#E4E4E7" orientation="horizontal" /> */}
        <Text fontSize="xs" color="#A1A1AA">
          Member since{" "}
          {formatDate(member.joined_at ?? member.member_since) || "—"}
        </Text>
      </VStack>
    </Box>
  );
}

interface TeamInviteCardProps {
  invite: OrganisationSentInvite;
  canManage: boolean;
  onRevokeError: (err: unknown) => void;
}

function TeamInviteCard({
  invite,
  canManage,
  onRevokeError,
}: TeamInviteCardProps) {
  const revokeMutation = useOrganisationInviteRevoke();
  const inviteDate =
    invite.invited_at ?? invite.created_at ?? invite.expires_at;

  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid #E4E4E7"
      p={5}
      position="relative"
      minH="180px"
      display="flex"
      flexDirection="column"
    >
      {canManage && (
        <Box position="absolute" top={3} right={3} zIndex={1}>
          <MenuPopover
            placement="bottom-end"
            minW="200px"
            contentProps={{
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              py: 2,
            }}
            trigger={
              <IconButton variant="ghost" size="sm" aria-label="More options">
                <MoreVertical size={18} color="#71717A" />
              </IconButton>
            }
          >
            {/* <Box
              as="button"
              w="full"
              textAlign="left"
              px={4}
              py={2}
              fontSize="14px"
              fontWeight="500"
              color="#2D3748"
              borderRadius="md"
              _hover={{ bg: "#F7FAFC" }}
              onClick={handleResend}
            >
              <HStack gap={2}>
                <Mail size={14} />
                <Text>Resend invitation</Text>
              </HStack>
            </Box>
            <Box
              as="button"
              w="full"
              textAlign="left"
              px={4}
              py={2}
              fontSize="14px"
              fontWeight="500"
              color="#2D3748"
              borderRadius="md"
              _hover={{ bg: "#F7FAFC" }}
              onClick={handleMakeAdmin}
            >
              <HStack gap={2}>
                <User size={14} />
                <Text>Make Admin</Text>
              </HStack>
            </Box>
            <Box
              as="button"
              w="full"
              textAlign="left"
              px={4}
              py={2}
              fontSize="14px"
              fontWeight="500"
              color="#2D3748"
              borderRadius="md"
              _hover={{ bg: "#F7FAFC" }}
              onClick={handleMakeMember}
            >
              <HStack gap={2}>
                <User size={14} />
                <Text>Make Member</Text>
              </HStack>
            </Box> */}
            <Box
              as="button"
              w="full"
              textAlign="left"
              px={4}
              py={2}
              fontSize="14px"
              fontWeight="500"
              color="#DC2626"
              borderRadius="md"
              _hover={{ bg: "#FEF2F2" }}
              onClick={() => {
                revokeMutation.mutate(String(invite.id), {
                  onError: onRevokeError,
                });
              }}
            >
              <HStack gap={2}>
                <Trash2 size={14} />
                <Text>Revoke invite</Text>
              </HStack>
            </Box>
          </MenuPopover>
        </Box>
      )}

      <VStack align="center" gap={2} flex={1}>
        <Box
          w={14}
          h={14}
          borderRadius="full"
          bg="#E9F7F6"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="profile.500" fontWeight="600" fontSize="sm">
            {getInitials(undefined, invite.email)}
          </Text>
        </Box>
        <Text fontSize="lg" fontWeight="600" color="#000000" textAlign="center">
          (No name available)
        </Text>

        <Text fontSize="xs" color="#52525B" textAlign="center" lineClamp={1}>
          {invite.email}
        </Text>
        <Box
          px={2}
          py={0.5}
          borderRadius="md"
          bg="#F4F4F5"
          color="#000000"
          fontSize="xs"
          fontWeight="500"
          boxShadow="0px 0px 1px 0px #D4D4D8 inset"
        >
          {getRoleLabel(invite.platform_role)}
        </Box>
        <Box height="1px" width="full" bg="#E4E4E7" />
        {/* <Separator color="#E4E4E7" orientation="horizontal" /> */}
        {/* </Box> */}
        <Text fontSize="xs" color="#A1A1AA">
          Invite sent {formatDate(inviteDate) || "—"}
        </Text>
      </VStack>
    </Box>
  );
}
