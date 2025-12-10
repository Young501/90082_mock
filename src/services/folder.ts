import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  Folder,
  FolderDetail,
  CreateFolderRequest,
  UpdateFolderRequest,
  AddMemberToFolderRequest,
  AddMemberToFolderResponse,
  FolderMembersResponse,
} from "@/types/folder";

export function useFolders(opportunitySlug: string | undefined) {
  return useQuery({
    queryKey: ["folders", opportunitySlug],
    queryFn: (): Promise<Folder[]> =>
      apiRequest({ endpoint: API_ENDPOINTS.FOLDERS(opportunitySlug!) }),
    enabled: !!opportunitySlug,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
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
      queryClient.refetchQueries({ queryKey: ["folders", variables.opportunity] });
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

export function useFolderMembersPaginated(
  folderId: string | undefined,
  page: number = 1,
  pageSize: number = 20,
  memberType?: "student" | "organisation"
) {
  return useQuery({
    queryKey: ["folder-members", folderId, page, pageSize, memberType],
    queryFn: (): Promise<FolderMembersResponse> =>
      apiRequest({
        endpoint: API_ENDPOINTS.FOLDER_MEMBERS(folderId!),
        params: {
          page,
          page_size: pageSize,
          ...(memberType && { member_type: memberType }),
        },
      }),
    enabled: !!folderId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
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
    }): Promise<AddMemberToFolderResponse> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ADD_MEMBER_TO_FOLDER(folderId),
        body: data,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: ["folder-members", variables.folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder", variables.folderId] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useRemoveMemberFromFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      memberId,
    }: {
      folderId: string;
      memberId: number;
    }): Promise<void> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.REMOVE_MEMBER_FROM_FOLDER(folderId, memberId.toString()),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: ["folder-members", variables.folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder", variables.folderId] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
