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
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useContactUser } from "@/services/shared";
import { useAcceptedOpportunities } from "@/services/shared";
import { useAuthStore } from "@/store";
import { toast } from "react-toastify";
import { ContactPageProps, ContactFormData } from "@/types/contact";
import Image from "next/image";
import { emailContactValidationSchema } from "@/utils/validationSchemas";

export function ContactPage({
  recipientId,
  recipientName,
  profileType,
  onBack,
  organisationName,
  organisationContact,
  organisationId,
}: ContactPageProps) {
  const { userProfile, user } = useAuthStore();
  const contactMutation = useContactUser();
  const { data: acceptedOpportunities } = useAcceptedOpportunities();

  const getDefaultSubject = () => {
    const fullName = `${userProfile?.first_name} ${userProfile?.last_name}`;
    if (profileType === "organisation") {
      return `New message from ${fullName || "User"} via UniConnected`;
    } else {
      return `New message from ${organisationName || "User"} via UniConnected`;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(emailContactValidationSchema),
    defaultValues: {
      user_id: recipientId,
      reply_to: organisationContact || user?.email || "",
      subject: getDefaultSubject(),
      message: "",
    },
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    const currentOpportunityId = acceptedOpportunities?.[0]?.id;

    if (!currentOpportunityId) {
      toast.error("No opportunity found. Please join an opportunity first.");
      return;
    }

    try {
      await contactMutation.mutateAsync({
        opportunityId: currentOpportunityId.toString(),
        reply_to: data.reply_to,
        subject: data.subject || "",
        message: data.message,
        ...(profileType === "student"
          ? { user_id: data.user_id }
          : { organisation_id: organisationId }),
      });

      toast.success("Message sent successfully!");
      reset();
      onBack();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send message");
    }
  };

  return (
    <Box
      position="fixed"
      top={{ base: "80px", lg: "126px" }}
      left={0}
      right={0}
      bottom={0}
      bg="white"
      zIndex={1000}
      overflow="auto"
    >
      <Box maxW="600px" mx="auto" p={6} display="flex" flexDirection="column">
        <Heading size="lg" color="#282F68" mb={6} textAlign="center">
          Contact {recipientName}
        </Heading>

        <Box
          flex={1}
          display="flex"
          justifyContent="center"
          alignItems="flex-start"
        >
          <Box w="full">
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="hidden"
                {...register("user_id")}
                value={recipientId}
              />
              <VStack align="stretch" gap={6}>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    To:
                  </Text>
                  <Input
                    value={recipientName}
                    readOnly
                    bg="gray.50"
                    color="gray.600"
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Reply-To:
                  </Text>
                  <Input {...register("reply_to")} />
                  {errors.reply_to && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.reply_to.message}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Subject:
                  </Text>
                  <Input {...register("subject")} />
                  {errors.subject && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.subject.message}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Message: *
                  </Text>
                  <Textarea
                    {...register("message")}
                    rows={8}
                    placeholder="Type your message here..."
                  />
                  {errors.message && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.message.message}
                    </Text>
                  )}
                </Box>

                <Box display="flex" gap={3} justifyContent="flex-end" mt={6}>
                  <Button
                    variant="outline"
                    onClick={onBack}
                    _active={{
                      transform: "scale(0.98)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    _hover={{
                      bg: "#2CA9DF/80",
                    }}
                    _active={{
                      transform: "scale(0.98)",
                    }}
                    type="submit"
                    bg="#2CA9DF"
                    color="white"
                    loading={contactMutation.isPending}
                    disabled={contactMutation.isPending}
                  >
                    Send Message
                  </Button>
                </Box>
              </VStack>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
