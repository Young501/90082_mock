export interface ContactPageProps {
  recipientId: number;
  recipientName: string;
  profileType: "student" | "partner";
  onBack: () => void;
  companyName?: string;
}

export interface ContactFormData {
  user_id: number;
  reply_to: string;
  subject: string;
  message: string;
}
