"use client";
import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/store";
import { useOnboardingPages } from "@/services/shared";
import {
  Box,
  Text,
  Button,
  Spinner,
  Flex,
  Avatar,
  Progress,
} from "@chakra-ui/react";
import { User, Book, Info, Award, Eye, LucideIcon } from "lucide-react";

interface OnboardingPage {
  title: string;
  short_title?: string;
  [key: string]: any;
}

interface OnboardingData {
  onboarding_pages: OnboardingPage[];
}

interface UserProfile {
  first_name?: string;
  last_name?: string;
  location?: string;
  faculty?: string;
  course_name?: string;
  skills?: string[];
  credentials?: string[];
  profile_picture_url?: string;
  [key: string]: any;
}

interface Tab {
  title: string;
  icon: LucideIcon;
}

const Profile = () => {
  const { user, getUserProfile } = useAuthStore();
  const userProfile: UserProfile | null = getUserProfile();
  const [activeTab, setActiveTab] = useState<number>(0);

  const userType: string = user?.user_types?.[0] || "";

  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingPages(userType);

  const getTabIcon = (title: string): LucideIcon => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("about") || lowerTitle.includes("personal"))
      return User;
    if (lowerTitle.includes("degree") || lowerTitle.includes("education"))
      return Book;
    if (lowerTitle.includes("skill") || lowerTitle.includes("credential"))
      return Award;
    return Info;
  };

  const tabs: Tab[] = useMemo(() => {
    if (!onboardingData?.onboarding_pages) return [];

    const onboardingTabs: Tab[] = onboardingData.onboarding_pages.map(
      (page: OnboardingPage) => ({
        title: page.short_title || page.title || "Untitled",
        icon: getTabIcon(page.short_title || page.title),
      })
    );

    onboardingTabs.push({
      title: "Profile Preview",
      icon: Eye,
    });

    return onboardingTabs;
  }, [onboardingData]);

  const calculateProfileCompletion = (): number => {
    if (!userProfile) return 0;

    const fields: (keyof UserProfile)[] = [
      "first_name",
      "last_name",
      "location",
      "faculty",
      "course_name",
      "skills",
      "credentials",
    ];

    const filledFields = fields.filter((field) => {
      const value = userProfile[field];
      return (
        value &&
        (Array.isArray(value)
          ? value.length > 0
          : value.toString().trim() !== "")
      );
    });

    return Math.round((filledFields.length / fields.length) * 100);
  };

  if (isOnboardingLoading) {
    return (
      <Box p={6} maxW="1280px" mx="auto" mt="126px">
        <Spinner size="lg" />
      </Box>
    );
  }

  const completionPercentage = calculateProfileCompletion();

  return (
    <Box p={6} maxW="1280px" mx="auto" mt="126px">
      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Sidebar */}
        <Box
          bg="white"
          borderRadius="xl"
          p={6}
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          minW={{ lg: "320px" }}
          h="fit-content"
        >
          {/* Profile Header */}
          <Box mb={6}>
            <Flex align="center" gap={4} mb={4}>
              <Avatar.Root size="lg">
                <Avatar.Image src={userProfile?.profile_picture_url} />
                <Avatar.Fallback>
                  {userProfile?.first_name?.charAt(0)}
                </Avatar.Fallback>
              </Avatar.Root>
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {userProfile?.first_name} {userProfile?.last_name}
                </Text>
                <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                  {userType}
                </Text>
              </Box>
            </Flex>

            {/* Profile Completion */}
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" color="gray.600">
                  Profile Completion
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {completionPercentage}%
                </Text>
              </Flex>
              <Progress.Root
                value={completionPercentage}
                max={100}
                size="sm"
                borderRadius="full"
                colorPalette="blue"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
          </Box>

          {/* Navigation Tabs */}
          <Box>
            {tabs.map((tab: Tab, index: number) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={index}
                  variant={activeTab === index ? "solid" : "ghost"}
                  colorPalette={activeTab === index ? "blue" : "gray"}
                  justifyContent="flex-start"
                  onClick={() => setActiveTab(index)}
                  size="md"
                  fontWeight="medium"
                  w="full"
                  mb={2}
                >
                  <Box as={IconComponent} width={16} height={16} mr={2} />
                  {tab.title}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          bg="white"
          borderRadius="xl"
          p={6}
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          flex={1}
        >
          <Text fontSize="xl" fontWeight="bold" mb={6} color="gray.800">
            {tabs[activeTab]?.title || "Tab Details"}
          </Text>

          {activeTab === tabs.length - 1 ? (
            // Profile Preview Content
            <Box>
              <Text mb={4}>Profile Preview Content</Text>
              {userProfile && (
                <Box>
                  <Box mb={3}>
                    <Text>
                      <Text as="span" fontWeight="bold">
                        Name:
                      </Text>{" "}
                      {userProfile.first_name} {userProfile.last_name}
                    </Text>
                  </Box>
                  <Box mb={3}>
                    <Text>
                      <Text as="span" fontWeight="bold">
                        Location:
                      </Text>{" "}
                      {userProfile.location}
                    </Text>
                  </Box>
                  <Box mb={3}>
                    <Text>
                      <Text as="span" fontWeight="bold">
                        Faculty:
                      </Text>{" "}
                      {userProfile.faculty}
                    </Text>
                  </Box>
                  <Box mb={3}>
                    <Text>
                      <Text as="span" fontWeight="bold">
                        Course:
                      </Text>{" "}
                      {userProfile.course_name}
                    </Text>
                  </Box>
                  <Box mb={3}>
                    <Text>
                      <Text as="span" fontWeight="bold">
                        Skills:
                      </Text>{" "}
                      {userProfile.skills?.join(", ")}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            // Onboarding Content
            <Box>
              <Text mb={4}>Content for {tabs[activeTab]?.title}</Text>
              {onboardingData?.onboarding_pages?.[activeTab] && (
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Page Data:
                  </Text>
                  <Box
                    bg="gray.50"
                    p={4}
                    borderRadius="md"
                    fontSize="sm"
                    maxH="400px"
                    overflowY="auto"
                  >
                    <Text as="pre" whiteSpace="pre-wrap">
                      {JSON.stringify(
                        onboardingData.onboarding_pages[activeTab],
                        null,
                        2
                      )}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Profile;
