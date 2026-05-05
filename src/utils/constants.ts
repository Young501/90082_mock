import { UserTypeData } from "@/types/auth";
import {
  User,
  Building2,
  Instagram,
  Linkedin,
  X,
  Facebook,
} from "lucide-react";

export const DISALLOWED_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
];

export const isDisallowedDomain = (email: string): boolean => {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return DISALLOWED_DOMAINS.includes(domain);
};

export const userTypesData: UserTypeData[] = [
  {
    key: "student",
    name: "Student",
    description: "Personal account to manage all you activities.",
    icon: User,
    iconSize: 24,
    color: "#2AA8E0",
    borderColor: "#D6EDFB",
    bgColor: "#EAF6FD",
  },
  {
    key: "organisation",
    name: "Organisation",
    description: "Own or belong to a company, this is for you.",
    icon: Building2,
    iconSize: 24,
    color: "#3AADA8",
    bgColor: "#E9F7F6",
    borderColor: "#D3EFEA",
  },
];

export const CONTACT_EMAIL = "contactus@uniconnected.com";

export const SOCIAL_MEDIA_LINKS = [
  // {
  //   name: "Facebook",
  //   icon: Facebook,
  //   link: "https://www.facebook.com/uniconnected",
  // },
  // {
  //   name: "Twitter",
  //   icon: X,
  //   link: "https://www.twitter.com/uniconnected",
  // },
  {
    name: "LinkedIn",
    icon: Linkedin,
    link: "https://www.linkedin.com/company/uniconnected",
  },
  // {
  //   name: "Instagram",
  //   icon: Instagram,
  //   link: "https://www.instagram.com/uniconnected",
  // },
];

/** required fields for onboarding completion  */
export const STUDENT_ONBOARDING_REQUIRED_FIELDS = [
  "faculty",
  "course_stream",
] as const;

export const ORGANISATION_MEMBER_REQUIRED_FIELDS = ["job_title"] as const;

export const ORGANISATION_REQUIRED_FIELDS = ["name"] as const;

export const SPAM_MAX_CONSECUTIVE_CHARS = 5 as const;

export const SPAM_CAPS_THRESHOLD = 10 as const;
