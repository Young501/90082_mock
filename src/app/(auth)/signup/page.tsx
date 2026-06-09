"use client";

import { useState, useEffect } from "react";
import { Box, Heading, VStack, Text, Flex, Checkbox } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { InputField, ButtonV2 } from "@/components/ui";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail } from "lucide-react";
import { PROFILE_HOVER_COLORS } from "@/theme/theme";
import {
  baseAuthSchema,
  studentAuthValidationSchema,
  organisationAuthValidationSchema,
} from "@/utils/validationSchemas";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { toast } from "react-toastify";
// import { userTypesData } from "@/utils/constants";

interface FormData {
  email: string;
  password: string;
  confirm_password: string;
  student_terms_and_conditions?: boolean;
  organisation_terms_and_conditions?: boolean;
  privacy_policy: boolean;
}

const VALID_USER_TYPES = ["student", "organisation", "coordinator"];

const MotionBox = motion.create(Box);

const SignupPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const { handleSignup } = useAuth();

  useEffect(() => {
    const userTypeParam = searchParams.get("user-type");

    if (!userTypeParam || !VALID_USER_TYPES.includes(userTypeParam)) {
      router.replace("/user-type/");
      return;
    }

    setUserType(userTypeParam);
  }, [searchParams, router]);

  const validationSchema =
    userType === "organisation"
      ? organisationAuthValidationSchema
      : userType === "student"
        ? studentAuthValidationSchema
        : baseAuthSchema;

  const emailParam = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema as any),
    mode: "onChange",
    defaultValues: {
      email: emailParam,
      password: "",
      confirm_password: "",
      student_terms_and_conditions: false,
      organisation_terms_and_conditions: false,
      // privacy_policy: false,
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirm_password");
  const studentTermsAndConditions = watch("student_terms_and_conditions");
  const organisationTermsAndConditions = watch(
    "organisation_terms_and_conditions"
  );

  const onSubmit = async (data: FormData) => {
    if (!userType) return;

    try {
      setIsLoading(true);

      await handleSignup({
        email: data.email,
        password: data.password,
        user_types: [userType],
        callback: () => {
          router.push(
            `/verify-email/sent/?email=${encodeURIComponent(data.email)}`
          );
        },
      });
    } catch {
      // Error handled in auth hook
    } finally {
      setIsLoading(false);
    }
  };

  const isStudent = userType === "student";
  const isOrganisation = userType === "organisation";
  // const userTypeConfig = userTypesData.find((t) => t.key === userType);

  return (
    <>
      <PageTitle title={PAGE_TITLES.SIGNUP} />
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
                  Create your account
                </Heading>
                {isStudent && (
                  <Text fontSize="md" color="black" lineHeight="1.5">
                    You are signing up as a{" "}
                    <Text as="span" fontWeight="700" color="#2AA8E0">
                      Student
                    </Text>
                  </Text>
                )}
                {isOrganisation && (
                  <Text fontSize="md" color="#18181B">
                    Create an account to connect with talented students
                  </Text>
                )}
                {/* {userType === "coordinator" && (
                  <Text fontSize="md" color="black" lineHeight="1.5">
                    You are signing up as a{" "}
                    <Text as="span" fontWeight="700" color="#002157">
                      Coordinator
                    </Text>
                  </Text>
                )} */}
              </VStack>

              <VStack
                align="stretch"
                gap={8}
                border={{ base: "none", md: "1px solid #E4E4E7" }}
                borderRadius="3xl"
                w="100%"
                p={{ base: 0, md: 8 }}
              >
                <VStack align="stretch" gap={6}>
                  <InputField
                    label={isOrganisation ? "Work Email Address" : "Email"}
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message as string}
                    labelStyle="top"
                    placeholder={
                      isOrganisation
                        ? "you@company.com"
                        : "sarah.smith@student.unimelb.edu.au"
                    }
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
                    autoComplete="new-password"
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

                  <InputField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    error={errors.confirm_password?.message as string}
                    showPasswordToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    labelStyle="top"
                    placeholder="Enter password"
                    variant="signup"
                    {...register("confirm_password")}
                    value={confirmPasswordValue || ""}
                    inputStyles={{
                      borderRadius: "sm",
                      h: "48px",
                      _focus: {
                        outline: "none",
                      },
                    }}
                  />
                </VStack>

                <VStack align="stretch" gap={5}>
                  {/* {userType === "coordinator" && (
                  <VStack align="stretch" gap={1}>
                    <Checkbox.Root
                      colorPalette="blue"
                      color="black"
                      {...register("privacy_policy")}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label fontSize="sm" fontWeight="400">
                        I agree to the{" "}
                        <Link
                          href="/legal/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#002157",
                            textDecoration: "underline",
                            fontWeight: 500,
                          }}
                        >
                          Privacy Policy
                        </Link>
                      </Checkbox.Label>
                    </Checkbox.Root>
                    {errors.privacy_policy && (
                      <Text color="red.500" fontSize="sm">
                        {errors.privacy_policy.message as string}
                      </Text>
                    )}
                  </VStack>
                )} */}

                  <ButtonV2
                    type="submit"
                    variant="primary"
                    bg={isOrganisation ? "#3AADA8" : "#2AA8E0"}
                    color="white"
                    disabled={isLoading}
                    isLoading={isLoading}
                    w="100%"
                    fontSize="lg"
                    fontWeight="600"
                    h={{ base: "48px", md: "64px" }}
                    borderRadius="xl"
                    _hover={{
                      bg: isOrganisation
                        ? PROFILE_HOVER_COLORS.organisation
                        : PROFILE_HOVER_COLORS.student,
                    }}
                  >
                    Create account
                  </ButtonV2>

                  {isStudent && (
                    <>
                      <Flex align="center" gap={2} w="100%">
                        <Box flex={1} h="1px" bg="gray.200" />
                        <Text fontSize="sm" color="gray.500" fontWeight="500">
                          Or sign up with
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
                    </>
                  )}

                  <VStack
                    align="stretch"
                    gap={6}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {isStudent && (
                      <VStack align="stretch" justifyContent="center" gap={1}>
                        <Checkbox.Root
                          colorPalette="#2AA8E0"
                          color="black"
                          {...register("student_terms_and_conditions")}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control
                            bg={
                              studentTermsAndConditions
                                ? "#2AA8E0"
                                : "transparent"
                            }
                            border="1px solid #E4E4E7"
                            color={
                              studentTermsAndConditions ? "white" : undefined
                            }
                          />
                          <Checkbox.Label fontSize="xs" fontWeight="700">
                            I agree to the{" "}
                            <Link
                              href="/legal/terms-student"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#2AA8E0",
                                textDecoration: "underline",
                                fontWeight: 500,
                              }}
                            >
                              Terms & Conditions
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/legal/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#2AA8E0",
                                textDecoration: "underline",
                                fontWeight: 500,
                              }}
                            >
                              Privacy Policy
                            </Link>
                          </Checkbox.Label>
                        </Checkbox.Root>
                        {errors.student_terms_and_conditions && (
                          <Text
                            color="red.500"
                            fontSize="sm"
                            textAlign="center"
                          >
                            {
                              errors.student_terms_and_conditions
                                .message as string
                            }
                          </Text>
                        )}
                      </VStack>
                    )}

                    {isOrganisation && (
                      <>
                        <VStack align="stretch" gap={1}>
                          <Checkbox.Root
                            colorPalette="#3AADA8"
                            color="black"
                            {...register("organisation_terms_and_conditions")}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control
                              bg={
                                organisationTermsAndConditions
                                  ? "#3AADA8"
                                  : "transparent"
                              }
                              border="1px solid #E4E4E7"
                              color={
                                organisationTermsAndConditions
                                  ? "white"
                                  : undefined
                              }
                            />
                            <Checkbox.Label fontSize="xs" fontWeight="700">
                              I agree to the{" "}
                              <Link
                                href="/legal/terms-organisation"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#3AADA8",
                                  textDecoration: "underline",
                                  fontWeight: 500,
                                }}
                              >
                                Terms & Conditions
                              </Link>
                              {""} and{" "}
                              <Link
                                href="/legal/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#3AADA8",
                                  textDecoration: "underline",
                                  fontWeight: 500,
                                }}
                              >
                                Privacy Policy
                              </Link>
                            </Checkbox.Label>
                          </Checkbox.Root>
                          {errors.organisation_terms_and_conditions && (
                            <Text
                              color="red.500"
                              fontSize="xs"
                              textAlign="center"
                            >
                              {
                                errors.organisation_terms_and_conditions
                                  .message as string
                              }
                            </Text>
                          )}
                        </VStack>
                      </>
                    )}
                  </VStack>
                </VStack>
              </VStack>

              <Flex justify="center" align="center" gap={2} pt={2}>
                <Text fontSize="sm" color="black" fontWeight="500">
                  Have an account?
                </Text>
                <ButtonV2
                  variant="ghost"
                  onClick={() => router.push("/login/")}
                  border={isStudent ? "1px solid #D6EDFB" : "1px solid #D3EFEA"}
                  h="40px"
                  borderRadius="xl"
                  fontSize="xs"
                  color={isStudent ? "#1679AB" : "#3AADA8"}
                  py={2.5}
                  px={4}
                  _hover={{
                    textDecoration: "none",
                  }}
                >
                  Log in
                </ButtonV2>
              </Flex>
            </VStack>
          </form>
        </MotionBox>
      </Box>
    </>
  );
};

export default SignupPage;
