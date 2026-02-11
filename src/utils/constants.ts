import { UserTypeData } from "@/types/auth";
import { User, Building2 } from "lucide-react";

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
