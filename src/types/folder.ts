export interface Folder {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  members_count?: number;
}

export interface CreateFolderRequest {
  name: string;
  description: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
}

export interface FolderMember {
  id: string;
  folder_id: string;
  user_id: string;
  added_at: string;
}

export interface AddMemberToFolderRequest {
  user_id: string;
}

export interface FolderMembersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}
