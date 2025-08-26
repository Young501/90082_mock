export interface ContactPageProps {
  recipientId: number;
  recipientName: string;
  profileType: "student" | "organisation";
  onBack: () => void;
  companyName?: string;
  organisationId?: string;
}

export interface ContactFormData {
  user_id: number;
  reply_to: string;
  subject: string;
  message: string;
}
