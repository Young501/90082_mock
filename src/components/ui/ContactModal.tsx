import React from "react";
import {
  Box,
  VStack,
  Button,
  Input,
  Textarea,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useContactUser } from "@/services/shared";
import { useAcceptedOpportunities } from "@/services/shared";
import { useAuthStore } from "@/store";
import { toast } from "react-toastify";
import { ContactModalProps, ContactFormData } from "@/types/contact";
import Image from "next/image";

const validationSchema = yup.object().shape({
  to: yup
    .string()
    .email("Invalid email")
    .required("Recipient email is required"),
  reply_to: yup
    .string()
    .email("Invalid email")
    .required("Your email is required"),
  subject: yup.string().default(""),
  message: yup
    .string()
    .required("Message is required")
    .min(1, "Message cannot be empty"),
});

export function ContactModal({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
}: ContactModalProps) {
  const { user } = useAuthStore();
  const contactMutation = useContactUser();
  const { data: acceptedOpportunities } = useAcceptedOpportunities();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      to: recipientEmail,
      reply_to: user?.email || "",
      subject: `New message from [${user?.email || "User"}] via UniConnected`,
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
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send message");
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="xl"
        p={6}
        maxW="500px"
        w="90%"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
        position="relative"
      >
        <Button
          position="absolute"
          top={4}
          right={4}
          size="sm"
          variant="ghost"
          onClick={onClose}
        >
          <Image src="/assets/cancel.svg" alt="Close" width={20} height={20} />
        </Button>

        <VStack align="stretch" gap={4}>
          <Heading size="lg" color="#282F68">
            Contact {recipientName}
          </Heading>

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack align="stretch" gap={4}>
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
                  rows={4}
                  placeholder="Type your message here..."
                />
                {errors.message && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.message.message}
                  </Text>
                )}
              </Box>

              <Box display="flex" gap={3} justifyContent="flex-end" mt={4}>
                <Button variant="outline" onClick={onClose}>
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
        </VStack>
      </Box>
    </Box>
  );
}
