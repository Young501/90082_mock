import React from "react";
import {
  Box,
  VStack,
  Button,
  Input,
  Textarea,
  Text,
  Heading,
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
  recipientEmail,
  recipientName,
  profileType,
  onBack,
  companyName,
}: ContactPageProps) {
  const { user } = useAuthStore();
  const contactMutation = useContactUser();
  const { data: acceptedOpportunities } = useAcceptedOpportunities();

  const getDefaultSubject = () => {
    if (profileType === "partner") {
      return `New message from [${user?.email || "User"}] via UniConnected`;
    } else {
      return `New message from [${companyName || user?.email || "User"}] via UniConnected`;
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
      to: recipientEmail,
      reply_to: user?.email || "",
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
        to: data.to,
        reply_to: data.reply_to,
        subject: data.subject || "",
        message: data.message,
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
      <Box
        maxW="600px"
        mx="auto"
        p={6}
        display="flex"
        flexDirection="column"
      >

        <Box display="flex" w="full" justifyContent={{ base: "start", lg: "space-between" }} flexDirection="row" alignItems="center" mb={6}>
            <Button variant="ghost"  onClick={onBack} p={0} alignSelf="flex-start">
              <Image src="/assets/arrowbackicon.svg" alt="Back" width={12} height={12} />
            </Button>
          <Heading size="lg" color="#282F68">
            Contact {recipientName}
          </Heading>
          <Box w="40px" display={{ base: "none", lg: "block" }} />
        </Box>

        <Box flex={1} display="flex" justifyContent="center" alignItems="flex-start">
          <Box w="full" >
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack align="stretch" gap={6}>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    To:
                  </Text>
                  <Input
                    {...register("to")}
                    readOnly
                    bg="gray.50"
                    color="gray.600"
                  />
                  {errors.to && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.to.message}
                    </Text>
                  )}
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
                  <Button variant="outline" onClick={onBack}>
                    Cancel
                  </Button>
                  <Button
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
