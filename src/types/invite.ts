export interface InviteAcceptRequest {
  token: string;
}

export interface InviteAcceptResponse {
  detail: string;
}

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
