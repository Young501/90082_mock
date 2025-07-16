import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  Folder,
  CreateFolderRequest,
  UpdateFolderRequest,
  FolderMember,
  AddMemberToFolderRequest,
  FolderMembersResponse,
} from "@/types/folder";

export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: (): Promise<Folder[]> =>
      apiRequest({ endpoint: API_ENDPOINTS.FOLDERS }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFolderRequest): Promise<Folder> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.CREATE_FOLDER,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useFolderDetail(folderId: string) {
  return useQuery({
    queryKey: ["folder", folderId],
    queryFn: (): Promise<Folder> =>
      apiRequest({ endpoint: API_ENDPOINTS.FOLDER_DETAIL(folderId) }),
    enabled: !!folderId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      data,
    }: {
      folderId: string;
      data: UpdateFolderRequest;
    }): Promise<Folder> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.UPDATE_FOLDER(folderId),
        body: data,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folder", data.id] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: string): Promise<void> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.DELETE_FOLDER(folderId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useFolderMembers(folderId: string) {
  return useQuery({
    queryKey: ["folder-members", folderId],
    queryFn: (): Promise<FolderMembersResponse> =>
      apiRequest({ endpoint: API_ENDPOINTS.FOLDER_MEMBERS(folderId) }),
    enabled: !!folderId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddMemberToFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      data,
    }: {
      folderId: string;
      data: AddMemberToFolderRequest;
    }): Promise<FolderMember> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ADD_MEMBER_TO_FOLDER(folderId),
        body: data,
      });
    },
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ["folder-members", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useRemoveMemberFromFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      userId,
    }: {
      folderId: string;
      userId: string;
    }): Promise<void> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.REMOVE_MEMBER_FROM_FOLDER(folderId, userId),
      });
    },
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ["folder-members", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
