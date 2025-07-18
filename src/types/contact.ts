export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
}

export interface ContactFormData {
  to: string;
  reply_to: string;
  subject: string;
  message: string;
}
