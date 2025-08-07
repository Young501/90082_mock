export interface DashboardStats {
  students: {
    invited: number;
    accepted: number;
    messaged: number;
    matched: number;
  };
  partners: {
    invited: number;
    accepted: number;
    messaged: number;
    matched: number;
  };
}

interface MatchedWith {
  id: number;
  name?: string;
  user_type?: string;
  matched_at?: string;
  match_id?: number;
}

export interface Participant {
  id: number;
  name?: string;
  user_type?: string;
  accepted_status?: string;
  has_profile?: boolean;
  image_url?: string;
  match_info?: {
    is_matched: boolean;
    matched_with: MatchedWith | null;
  };
  messages?: [
    {
      id: number;
      sender: {
        id: number;
        name?: string;
        user_type?: string;
      };
      receiver: {
        id: number;
        name?: string;
        user_type?: string;
      };
      sent_at: string;
    },
  ];
}

export interface ParticipantsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Participant[];
}

export interface ParticipantsFilterParams {
  user_type?: string;
  text?: string;
  accepted_status?: string;
  matched?: string;
  page?: number;
  page_size?: number;
}

export interface MatchStudent {
  student_participant_id: string;
  partner_participant_id: string;
}
