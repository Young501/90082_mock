export const getPageTitle = (
  title: string,
  suffix: string = "Uniconnected"
) => {
  return `${title} | ${suffix}`;
};

export const PAGE_TITLES = {
  LOGIN: "Login | Uniconnected",
  SIGNUP: "Signup | Uniconnected",
  DASHBOARD: "Dashboard | Uniconnected",
  DISCOVER: "Discover | Uniconnected",
  PROFILE: "Profile | Uniconnected",
  FOLDERS: "Folders | Uniconnected",
  INBOX: "Inbox | Uniconnected",
  USER_TYPE: "User Type | Uniconnected",
  ONBOARDING: "Onboarding | Uniconnected",
  VERIFY_EMAIL: "Verify Email | Uniconnected",
  RESET_PASSWORD: "Reset Password | Uniconnected",
  INVITE: "Invite | Uniconnected",
  INVITE_STUDENTS: "Invite Students | Uniconnected",
  INVITE_PARTNERS: "Invite Partners | Uniconnected",
  ONBOARDING_SUCCESS: "Onboarding Success | Uniconnected",
  VERIFY_EMAIL_FAILED: "Verify Email Failed | Uniconnected",
  VERIFY_EMAIL_SENT: "Verify Email Sent | Uniconnected",
  VERIFY_EMAIL_SUCCESS: "Verify Email Success | Uniconnected",
  MANAGE_STUDENTS: "Manage Students | Uniconnected",
  MANAGE_PARTNERS: "Manage Partners | Uniconnected",
  MATCH: "Match | Uniconnected",
} as const;
