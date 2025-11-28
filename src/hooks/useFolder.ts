import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  useCreateFolder,
  useFolders,
  useUpdateFolder,
  useFolderMembersPaginated,
} from "@/services/folder";
import { CreateFolderRequest, Folder } from "@/types/folder";
import { createFolderSchema } from "@/utils/validationSchemas";

export function useFolderModal(opportunitySlug: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateFolderRequest>({
    resolver: yupResolver(createFolderSchema),
    mode: "onChange",
    defaultValues: {
      opportunity: opportunitySlug,
    },
  });

  const isEditMode = !!currentFolder;

  const onOpen = (folder?: Folder) => {
    if (folder) {
      setCurrentFolder(folder);
      setValue("name", folder.name);
      setValue("description", folder.description || "");
      setValue("opportunity", opportunitySlug);
    } else {
      setCurrentFolder(null);
      reset({ opportunity: opportunitySlug });
    }
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setCurrentFolder(null);
    reset();
  };

  const onSubmit = async (data: CreateFolderRequest) => {
    try {
      if (isEditMode && currentFolder) {
        await updateFolderMutation.mutateAsync({
          folderId: currentFolder.id.toString(),
          data: {
            name: data.name,
            description: data.description,
          },
        });

        toast.success("Folder updated successfully!");
      } else {
        await createFolderMutation.mutateAsync({
          ...data,
          opportunity: opportunitySlug,
        });
        toast.success("Folder created successfully!");
      }
      onClose();
    } catch (error: any) {
      const errorMessage = isEditMode
        ? error?.response?.data?.name?.[0] || "Failed to update folder"
        : error?.response?.data?.name?.[0] || "Failed to create folder";
      toast.error(errorMessage);
    }
  };

  return {
    isOpen,
    onOpen,
    onClose,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading: createFolderMutation.isPending || updateFolderMutation.isPending,
    currentFolder,
    isEditMode,
  };
}

export function useFolderManagement(opportunitySlug: string) {
  const { data: folders, isLoading: isLoadingFolders } = useFolders(opportunitySlug);
  const folderModal = useFolderModal(opportunitySlug);

  return {
    folders: folders || [],
    isLoadingFolders,
    folderModal,
  };
}

export function useFolderMembersManagement(folderId: string) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [memberType, setMemberType] = useState<"student" | "organisation" | undefined>(undefined);

  const { data: folderMembers, isLoading: isLoadingMembers } =
    useFolderMembersPaginated(folderId, currentPage, pageSize, memberType);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleMemberTypeChange = (type: "student" | "organisation" | undefined) => {
    setMemberType(type);
    setCurrentPage(1);
  };

  return {
    members: folderMembers?.results || [],
    totalCount: folderMembers?.count || 0,
    totalPages: Math.ceil((folderMembers?.count || 0) / pageSize),
    currentPage,
    pageSize,
    memberType,
    isLoadingMembers,
    handlePageChange,
    handlePageSizeChange,
    handleMemberTypeChange,
  };
}
