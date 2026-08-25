"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Heading,
  HStack,
  IconButton,
  Stack,
  VStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { InputField, ButtonV2 } from "@/components/ui";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/auth";
import { loginValidationSchema } from "@/utils/validationSchemas";
import Link from "next/link";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { PageTitle } from "@/components/PageTitle";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, ShieldCheck, X } from "lucide-react";
import {
  mockOpportunities,
  mockStudentProfile,
  mockUserDetailsByType,
  mockUsersByType,
  setActiveUserType,
} from "@/mocks/mockData";
import { useAuthStore } from "@/store";
import type { UserProfile } from "@/types/shared";
import { CONTACT_EMAIL } from "@/utils/constants";

interface FormData {
  email: string;
  password: string;
}

const MotionBox = motion.create(Box);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationPrototype =
    searchParams.get("prototype") === "student-verification";
  const verificationCase = searchParams.get("case");
  const isExpiredVerification =
    verificationPrototype && verificationCase === "expired";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationModal, setVerificationModal] = useState<
    "success" | "deactivated" | null
  >(null);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setUserDetailsV2 = useAuthStore((state) => state.setUserDetailsV2);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const setAccessibleOpportunities = useAuthStore(
    (state) => state.setAccessibleOpportunities
  );
  const setCoordinatorOpportunities = useAuthStore(
    (state) => state.setCoordinatorOpportunities
  );
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const { handleLogin, isLoginLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(loginValidationSchema),
    mode: "onChange",
    defaultValues: {
      email: verificationPrototype ? mockUsersByType.student.email : "",
      password: verificationPrototype ? "student-verified" : "",
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  useEffect(() => {
    if (!verificationPrototype) return;
    reset({
      email: mockUsersByType.student.email,
      password: "student-verified",
    });
  }, [reset, verificationPrototype, verificationCase]);

  const establishStudentSession = () => {
    setActiveUserType("student");
    setAuthData("mock-token-student", mockUsersByType.student);
    setUserDetailsV2(mockUserDetailsByType.student);
    setUserProfile(mockStudentProfile as UserProfile);
    setAccessibleOpportunities(mockOpportunities);
    setCoordinatorOpportunities(mockOpportunities);
    setIsAuthenticated(true);
  };

  const onSubmit = async (data: FormData) => {
    if (verificationPrototype) {
      setIsLoading(true);
      window.setTimeout(() => {
        if (isExpiredVerification) {
          setVerificationModal("deactivated");
        } else {
          establishStudentSession();
          setVerificationModal("success");
          toast.success("Student status verified");
        }
        setIsLoading(false);
      }, 450);
      return;
    }

    try {
      setIsLoading(true);
      await handleLogin({
        email: data.email,
        password: data.password,
        callback: () => {
          toast.success("Login successful!");
        },
      });
    } catch {
      // Error handled in auth hook
    } finally {
      setIsLoading(false);
    }
  };

  const closePrototypeModal = () => {
    setVerificationModal(null);
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.LOGIN} />
      <Box w="100%" display="flex" alignItems="center" justifyContent="center">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          w="100%"
          maxW="640px"
          bg="white"
          borderRadius="2xl"
          p={{ base: 6, md: 10 }}
          boxShadow="xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
            <VStack align="stretch" gap={6}>
              <VStack align="stretch" gap={1} textAlign="left">
                <Heading
                  fontSize={{ base: "2xl", md: "4xl" }}
                  fontWeight="600"
                  color="#18181B"
                  lineHeight="1.2"
                >
                  Great to have you back
                </Heading>
              </VStack>

              <VStack
                align="stretch"
                gap={8}
                border={{ base: "none", md: "1px solid #E4E4E7" }}
                borderRadius="3xl"
                w="100%"
                p={{ base: 0, md: 8 }}
              >
                {verificationPrototype && (
                  <Box
                    borderWidth="1px"
                    borderColor="#D6EDFB"
                    bg="#F5FBFF"
                    borderRadius="xl"
                    px={4}
                    py={3}
                  >
                    <Flex align="flex-start" gap={3}>
                      <Box color="#1679AB" pt="2px">
                        <ShieldCheck size={18} />
                      </Box>
                      <Box>
                        <Text fontWeight="700" color="#18181B">
                          Student account verification
                        </Text>
                        <Text mt={1} fontSize="sm" color="#52525B">
                          Log in from this email link to confirm your student
                          account status.
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                )}

                <VStack align="stretch" gap={6}>
                  <InputField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message as string}
                    labelStyle="top"
                    placeholder="sarah.smith@student.unimelb.edu.au"
                    variant="signup"
                    inputStyles={{
                      borderRadius: "sm",
                      h: "48px",
                      _focus: {
                        outline: "none",
                      },
                    }}
                    startElement={
                      <Box display="flex" alignItems="center">
                        <Mail size={20} color="#9CA3AF" />
                      </Box>
                    }
                    {...register("email")}
                    value={emailValue || ""}
                  />

                  <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    error={errors.password?.message as string}
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    labelStyle="top"
                    placeholder="Enter password"
                    variant="signup"
                    {...register("password")}
                    value={passwordValue || ""}
                    inputStyles={{
                      borderRadius: "sm",
                      h: "48px",
                      _focus: {
                        outline: "none",
                      },
                    }}
                  />

                  <Flex justify="flex-end" w="100%">
                    <Text fontSize="sm" color="black" fontWeight="500">
                      Forgot password?{" "}
                      <Link
                        href="/reset-password/"
                        style={{
                          color: "#2AA8E0",
                          textDecoration: "underline",
                          fontWeight: 500,
                        }}
                      >
                        Reset
                      </Link>
                    </Text>
                  </Flex>
                </VStack>

                <VStack align="stretch" gap={5}>
                  <ButtonV2
                    type="submit"
                    variant="primary"
                    bg="#2AA8E0"
                    color="white"
                    disabled={isLoginLoading || isLoading}
                    isLoading={isLoading}
                    w="100%"
                    fontSize="lg"
                    fontWeight="600"
                    h={{ base: "48px", md: "64px" }}
                    borderRadius="xl"
                  >
                    Log in
                  </ButtonV2>

                  <Flex align="center" gap={2} w="100%">
                    <Box flex={1} h="1px" bg="gray.200" />
                    <Text fontSize="sm" color="gray.500" fontWeight="500">
                      Or log in with
                    </Text>
                    <Box flex={1} h="1px" bg="gray.200" />
                  </Flex>

                  <ButtonV2
                    type="button"
                    variant="secondary"
                    w="100%"
                    fontSize="lg"
                    fontWeight="600"
                    h={{ base: "48px", md: "64px" }}
                    borderRadius="xl"
                    onClick={() => {
                      toast.info("This feature is coming soon ...");
                    }}
                  >
                    Connect with university ID
                  </ButtonV2>
                </VStack>
              </VStack>

              <Flex justify="center" align="center" gap={2}>
                <Text fontSize="sm" color="black" fontWeight="500">
                  Don&apos;t have an account?
                </Text>
                <ButtonV2
                  variant="ghost"
                  onClick={() => router.push("/signup/")}
                  border="1px solid #D6EDFB"
                  h="40px"
                  borderRadius="xl"
                  fontSize="xs"
                  color="#1679AB"
                  py={2.5}
                  px={4}
                  _hover={{
                    textDecoration: "none",
                  }}
                >
                  Sign up
                </ButtonV2>
              </Flex>
            </VStack>
          </form>
        </MotionBox>
      </Box>
      {verificationModal && (
        <PrototypeVerificationModal
          type={verificationModal}
          onClose={closePrototypeModal}
          onSkip={() => router.push("/dashboard/")}
          onUpdateProfile={() => router.push("/profile/")}
        />
      )}
    </>
  );
}

function PrototypeVerificationModal({
  type,
  onClose,
  onSkip,
  onUpdateProfile,
}: {
  type: "success" | "deactivated";
  onClose: () => void;
  onSkip: () => void;
  onUpdateProfile: () => void;
}) {
  const isSuccess = type === "success";
  const accent = isSuccess ? "#176E43" : "#3F3F46";
  const soft = isSuccess ? "#E8F5EC" : "#F4F4F5";

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(15, 23, 42, 0.38)"
      zIndex={1400}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        w="100%"
        maxW="560px"
        overflow="hidden"
        borderWidth="1px"
        borderColor="#E4E4E7"
      >
        <Box bg={soft} px={{ base: 5, md: 6 }} py={{ base: 5, md: 6 }}>
          <Flex align="flex-start" justify="space-between" gap={4}>
            <HStack align="center" gap={3}>
              <Box
                w="42px"
                h="42px"
                borderRadius="14px"
                bg="white"
                color={accent}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 1px 0 rgba(15, 23, 42, 0.06)"
                flexShrink={0}
              >
                {isSuccess ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <ShieldCheck size={22} />
                )}
              </Box>
              <Stack gap={1}>
                <Badge
                  alignSelf="flex-start"
                  bg="white"
                  color={accent}
                  borderRadius="md"
                  px={2}
                  py={0.5}
                >
                  Student verification
                </Badge>
                <Heading as="h2" fontSize={{ base: "22px", md: "24px" }}>
                  {isSuccess
                    ? "Student status verified"
                    : "Account deactivated"}
                </Heading>
              </Stack>
            </HStack>
            <IconButton
              aria-label="Close verification dialog"
              variant="ghost"
              size="sm"
              color="#52525B"
              flexShrink={0}
              onClick={onClose}
            >
              <X size={18} />
            </IconButton>
          </Flex>

          <Text mt={4} color="#374151" lineHeight="1.6">
            {isSuccess
              ? "Your student account has been confirmed for this verification cycle."
              : "Your account has been deactivated. Please contact UniConnected to recover access."}
          </Text>
        </Box>

        <Stack gap={4} px={{ base: 5, md: 6 }} py={{ base: 5, md: 6 }}>
          {isSuccess ? (
            <Box
              borderWidth="1px"
              borderColor="#E4E4E7"
              borderRadius="xl"
              bg="#FAFBFC"
              px={4}
              py={4}
            >
              <Text fontWeight="800">
                Would you like to update your profile?
              </Text>
              <Text mt={1.5} fontSize="sm" color="#52525B" lineHeight="1.55">
                You can review your course, availability, location, and student
                profile now, or skip and continue to your dashboard.
              </Text>
            </Box>
          ) : (
            <Box
              borderWidth="1px"
              borderColor="#E4E4E7"
              borderRadius="xl"
              bg="#FAFBFC"
              px={4}
              py={4}
            >
              <Text fontWeight="800" color="#18181B">
                Contact UniConnected
              </Text>
              <Text mt={1.5} fontSize="sm" color="#52525B" lineHeight="1.55">
                Email{" "}
                <Link
                  href={`mailto:${CONTACT_EMAIL}`}
                  style={{
                    color: "#18181B",
                    fontWeight: 800,
                    textDecoration: "underline",
                  }}
                >
                  {CONTACT_EMAIL}
                </Link>{" "}
                to request account recovery.
              </Text>
            </Box>
          )}
        </Stack>

        <Flex
          justify="flex-end"
          gap={2}
          px={{ base: 5, md: 6 }}
          py={4}
          borderTopWidth="1px"
          borderColor="#E4E4E7"
          bg="#FAFBFC"
          flexWrap="wrap"
        >
          {isSuccess ? (
            <>
              <ButtonV2 variant="secondary" h="38px" px={4} onClick={onSkip}>
                Skip
              </ButtonV2>
              <ButtonV2
                variant="primary"
                h="38px"
                px={4}
                onClick={onUpdateProfile}
              >
                Update profile
              </ButtonV2>
            </>
          ) : (
            <>
              <ButtonV2 variant="secondary" h="38px" px={4} onClick={onClose}>
                Close
              </ButtonV2>
              <ButtonV2
                variant="primary"
                h="38px"
                px={4}
                onClick={() => {
                  window.location.href = `mailto:${CONTACT_EMAIL}`;
                }}
              >
                Email UniConnected
              </ButtonV2>
            </>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
