import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  Folder,
  FolderDetail,
  CreateFolderRequest,
  UpdateFolderRequest,
  FolderMemberRequest,
  AddMemberToFolderResponse,
  FolderMembersResponse,
} from "@/types/folder";

export function useFolders(
  opportunitySlug: string | undefined,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: ["folders", opportunitySlug],
    queryFn: (): Promise<Folder[]> =>
      apiRequest({ endpoint: API_ENDPOINTS.FOLDERS(opportunitySlug!) }),
    enabled: !!opportunitySlug && enabled,
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
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: ["folders", variables.opportunity],
      });
    },
  });
}

export function useFolderDetail(folderId: string | undefined) {
  return useQuery({
    queryKey: ["folder", folderId],
    queryFn: (): Promise<FolderDetail> =>
      apiRequest({ endpoint: API_ENDPOINTS.FOLDER_DETAIL(folderId!) }),
    enabled: !!folderId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
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
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: ["folders"] });
      queryClient.refetchQueries({ queryKey: ["folder", variables.folderId] });
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
      queryClient.refetchQueries({ queryKey: ["folders"] });
    },
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
      data: FolderMemberRequest;
    }): Promise<AddMemberToFolderResponse> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ADD_MEMBER_TO_FOLDER(folderId),
        body: data,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: ["folder-members", variables.folderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["folder", variables.folderId],
      });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useRemoveMemberFromFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      data,
    }: {
      folderId: string;
      data: FolderMemberRequest;
    }): Promise<void> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.REMOVE_MEMBER_FROM_FOLDER(folderId),
        body: data,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: ["folder-members", variables.folderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["folder", variables.folderId],
      });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity"] });
    },
  });
}
