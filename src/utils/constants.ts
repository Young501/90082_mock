import { UserTypeData } from "@/types/auth";

export const FREE_TRIAL_DAYS = 7;

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
    name: "STUDENT",
    color: "#DC2626",
    bgColor: "#DC2626",
    shadowColor: "rgba(220, 38, 38, 0.25)",
  },
  {
    key: "alumni",
    name: "ALUMNI",
    color: "#EAB308",
    bgColor: "#EAB308",
    shadowColor: "rgba(234, 179, 8, 0.15)",
  },
  {
    key: "academic",
    name: "ACADEMIC",
    color: "#173DA6",
    bgColor: "#183DA6",
    shadowColor: "rgba(23, 61, 166, 0.36)",
  },
  {
    key: "organisation",
    name: "ORGANISATION",
    color: "#089C3F",
    bgColor: "#089C3F",
    shadowColor: "rgba(8, 156, 63, 0.25)",
  },
];
