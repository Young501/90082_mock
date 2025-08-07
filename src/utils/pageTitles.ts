export const getPageTitle = (title: string, suffix: string = 'Unniconnected') => {
  return `${title} | ${suffix}`;
};

export const PAGE_TITLES = {
  LOGIN: 'Login | Unniconnected',
  SIGNUP: 'Signup | Unniconnected',
  DASHBOARD: 'Dashboard | Unniconnected',
  DISCOVER: 'Discover | Unniconnected',
  PROFILE: 'Profile | Unniconnected',
  FOLDERS: 'Folders | Unniconnected',
  INBOX: 'Inbox | Unniconnected',
  USER_TYPE: 'User Type | Unniconnected',
  ONBOARDING: 'Onboarding | Unniconnected',
  VERIFY_EMAIL: 'Verify Email | Unniconnected',
  RESET_PASSWORD: 'Reset Password | Unniconnected',
  INVITE: 'Invite | Unniconnected',
  INVITE_STUDENTS: 'Invite Students | Unniconnected',
  INVITE_PARTNERS: 'Invite Partners | Unniconnected',
  ONBOARDING_SUCCESS: 'Onboarding Success | Unniconnected',
  VERIFY_EMAIL_FAILED: 'Verify Email Failed | Unniconnected',
  VERIFY_EMAIL_SENT: 'Verify Email Sent | Unniconnected',
  VERIFY_EMAIL_SUCCESS: 'Verify Email Success | Unniconnected',
  MANAGE_STUDENTS: 'Manage Students | Unniconnected',
  MANAGE_PARTNERS: 'Manage Partners | Unniconnected',
  MATCH: 'Match | Unniconnected',
} as const; 