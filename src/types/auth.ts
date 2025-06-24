export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  user_types: string[];
}

export interface PasswordResetData {
  email: string;
}

export interface EmailVerificationData {
  token: string;
}

export interface EmailVerificationResponse {
  detail: string;
}

export interface UserTypeData {
  key: string;
  name: string;
  color: string;
  bgColor: string;
  shadowColor: string;
}