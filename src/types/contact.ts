export interface ContactPageProps {
  recipientEmail: string;
  recipientName: string;
  profileType: "student" | "partner";
  onBack: () => void;
  companyName?: string;
}

export interface ContactFormData {
  to: string;
  reply_to: string;
  subject: string;
  message: string;
}
