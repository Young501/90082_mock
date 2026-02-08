import React from "react";
import {
  Box,
  VStack,
  Input,
  Textarea,
  Text,
  Heading,
  Button,
  HStack,
  Grid,
  IconButton,
} from "@chakra-ui/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useGetOrCreateConversation,
  useSendMessage,
} from "@/services/messaging";
import { useAuthStore } from "@/store";
import { toast } from "react-toastify";
import { ContactFormData, ContactMember } from "@/types/messaging";
import { emailContactValidationSchema } from "@/utils/validationSchemas";
import { X } from "lucide-react";

interface ContactPageProps {
  recipientId: number;
  recipientName: string;
  profileType: "student" | "organisation";
  onBack: () => void;
  organisationName?: string;
  organisationContact?: string;
  organisationId?: string;
  members?: ContactMember[];
  acceptedOpportunityId?: string;
}

const defaultOtherUserId = (
  profileType: "student" | "organisation",
  recipientId: number,
  members?: ContactPageProps["members"]
): number => {
  const withId = members?.filter((m) => m.id != null) ?? [];
  if (profileType === "organisation" && withId.length) {
    return withId[0].id!;
  }
  return recipientId;
};

const recipientDisplayName = (
  profileType: "student" | "organisation",
  recipientName: string,
  members: ContactPageProps["members"],
  selectedMemberId: number | null
): string => {
  if (profileType === "student") return recipientName;
  if (!members?.length || selectedMemberId == null) return recipientName;
  const member = members.find((m) => m.id === selectedMemberId);
  if (!member) return recipientName;
  const name = [member.first_name, member.last_name].filter(Boolean).join(" ");
  return name
    ? `${name}${member.role ? ` (${member.role})` : ""}`
    : recipientName;
};

export function ContactPage({
  recipientId,
  recipientName,
  profileType,
  onBack,
  organisationName,
  organisationId,
  members,
  acceptedOpportunityId,
}: ContactPageProps) {
  const { userProfile, user, getUserType } = useAuthStore();
  const userType = getUserType();
  const getOrCreateConversation = useGetOrCreateConversation();
  const sendMessage = useSendMessage();

  const getDefaultSubject = () => {
    const fullName =
      `${userProfile?.first_name ?? ""} ${userProfile?.last_name ?? ""}`.trim();
    if (userType === "coordinator") {
      return "New message from Coordinator via UniConnected";
    }
    if (profileType === "organisation") {
      return `New message from ${fullName || "User"} via UniConnected`;
    }
    return `New message from ${organisationName || "User"} via UniConnected`;
  };

  const defaultOther = defaultOtherUserId(profileType, recipientId, members);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: yupResolver(emailContactValidationSchema),
    defaultValues: {
      other_user_id: defaultOther,
      subject: getDefaultSubject(),
      message: "",
    },
  });

  const selectedMemberId = watch("other_user_id");

  const isPending = getOrCreateConversation.isPending || sendMessage.isPending;

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    const otherUserId =
      profileType === "organisation" && (members?.length ?? 0) > 0
        ? data.other_user_id
        : recipientId;

    try {
      const conversation = await getOrCreateConversation.mutateAsync({
        other_user_id: otherUserId,
        ...(acceptedOpportunityId != null &&
          acceptedOpportunityId !== "" && {
            opportunity_id: parseInt(acceptedOpportunityId, 10),
          }),
      });

      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: data.message.trim(),
      });

      toast.success("Message sent successfully!");
      reset();
      onBack();
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : undefined);
      toast.error(detail || "Failed to send message");
    }
  };

  const fromLabel = (() => {
    const name =
      `${userProfile?.first_name ?? ""} ${userProfile?.last_name ?? ""}`.trim();
    const id = user?.id;
    if (name && id) return `${name} (User ID: ${id})`;
    if (name) return name;
    if (id) return `User ID: ${id}`;
    return "You";
  })();

  const selectableMembers = members?.filter((m) => m.id != null) ?? [];
  const showMemberDropdown =
    profileType === "organisation" && selectableMembers.length > 0;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="blackAlpha.600"
      p={4}
      onClick={(e) => e.target === e.currentTarget && onBack()}
    >
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="xl"
        maxW="512px"
        w="full"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
        p={6}
      >
        <VStack gap={2} align="start" w="full" mb={5}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            w="full"
          >
            <Heading size="xl" fontWeight="semibold" color="black">
              Message {recipientName}
            </Heading>
            <IconButton
              minW="fit-content"
              h="fit-content"
              variant="ghost"
              aria-label="Close"
              onClick={onBack}
            >
              <X size={24} color="#52525B" />
            </IconButton>
          </Box>
          <Text fontSize="sm" color="#52525B">
            Send a message to this{" "}
            {profileType === "organisation"
              ? "organisation. This is not a job application."
              : "person."}
          </Text>
        </VStack>

        <Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text mb="6px" fontWeight="medium" fontSize="sm">
                  From:
                </Text>
                <Input
                  value={fromLabel}
                  readOnly
                  bg="#F4F4F5"
                  size="sm"
                  h="40px"
                  py="10px"
                  px="12px"
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="normal"
                />
              </Box>

              <Box>
                <Text mb="6px" fontWeight="medium" fontSize="sm">
                  To:
                </Text>
                {showMemberDropdown ? (
                  <Controller
                    name="other_user_id"
                    control={control}
                    render={({ field }) => (
                      <Box
                        as="select"
                        width="100%"
                        padding="8px 12px"
                        // size="sm"
                        h="40px"
                        py="10px"
                        px="12px"
                        border="1px solid #E4E4E7"
                        borderRadius="xl"
                        fontWeight="normal"
                        fontSize="sm"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            Number((e.target as HTMLSelectElement).value)
                          )
                        }
                      >
                        {selectableMembers.map((m) => {
                          const name =
                            [m.first_name, m.last_name]
                              .filter(Boolean)
                              .join(" ") || "—";
                          const label = m.role ? `${name} (${m.role})` : name;
                          return (
                            <option key={m.id} value={m.id}>
                              {label}
                            </option>
                          );
                        })}
                      </Box>
                    )}
                  />
                ) : (
                  <Input
                    value={
                      profileType === "student"
                        ? recipientName
                        : recipientDisplayName(
                            profileType,
                            recipientName,
                            members ?? [],
                            selectedMemberId
                          )
                    }
                    readOnly
                    bg="#F4F4F5"
                    h="40px"
                    py="10px"
                    px="12px"
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="normal"
                  />
                )}
                {errors.other_user_id && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.other_user_id.message}
                  </Text>
                )}
              </Box>

              <Box>
                <Text mb="6px" fontWeight="medium" fontSize="sm">
                  Subject:
                </Text>
                <Input
                  {...register("subject")}
                  readOnly
                  bg="#F4F4F5"
                  h="40px"
                  py="10px"
                  px="12px"
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="normal"
                />
              </Box>

              <Box>
                <Text mb="6px" fontWeight="medium" fontSize="sm">
                  Message: *
                </Text>
                <Textarea
                  {...register("message")}
                  rows={6}
                  placeholder="Type your message here..."
                  h="84px"
                  py="10px"
                  px="12px"
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="normal"
                />
                {errors.message && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.message.message}
                  </Text>
                )}
              </Box>

              <Grid templateColumns="1fr 2fr" gap={3} pt={2} w="full">
                <Button
                  variant="outline"
                  onClick={onBack}
                  size="sm"
                  w="full"
                  h="40px"
                  py="10px"
                  px="12px"
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="normal"
                  bg="#F4F4F5"
                  _active={{ transform: "scale(0.98)" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="#2CA9DF"
                  color="white"
                  size="sm"
                  w="full"
                  h="40px"
                  py="10px"
                  px="12px"
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="normal"
                  loading={isPending}
                  disabled={isPending}
                  _hover={{ bg: "#2CA9DF", opacity: 0.9 }}
                  _active={{ transform: "scale(0.98)" }}
                >
                  Send Message
                </Button>
              </Grid>
            </VStack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
