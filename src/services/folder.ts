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
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["folders"] });
    },
  });
}

export function useFolderDetail(folderId: string) {
  return useQuery({
    queryKey: ["folder", folderId],
    queryFn: (): Promise<Folder> =>
      apiRequest({ endpoint: API_ENDPOINTS.FOLDER_DETAIL(folderId) }),
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
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["folders"] });
      queryClient.refetchQueries({ queryKey: ["folder", data.id] });
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
  folderId: string,
  page: number = 1,
  pageSize: number = 20,
  memberType?: string
) {
  return useQuery({
    queryKey: ["folder-members", folderId, page, pageSize, memberType],
    queryFn: (): Promise<FolderMembersResponse> =>
      apiRequest({
        endpoint: API_ENDPOINTS.FOLDER_MEMBERS(folderId),
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
    }): Promise<FolderMember> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ADD_MEMBER_TO_FOLDER(folderId),
        body: data,
      });
    },
    onSuccess: (_, { folderId }) => {
      queryClient.refetchQueries({ queryKey: ["folder-members", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
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
      queryClient.refetchQueries({ queryKey: ["folder-members", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
