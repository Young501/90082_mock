import React from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Field,
  Input,
  Textarea,
  HStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CreateFolderRequest, Folder } from "@/types/folder";
import { X } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { InputField } from "@/components/fields/InputField";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<CreateFolderRequest>;
  errors: FieldErrors<CreateFolderRequest>;
  isLoading: boolean;
  folder?: Folder | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  errors,
  isLoading,
  folder,
}) => {
  if (!isOpen) return null;

  const isEditMode = !!folder;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="20px"
        w="90%"
        maxW="500px"
        p={6}
        boxShadow="0px 5.92px 11.84px 5.92px #00000040"
        onClick={(e) => e.stopPropagation()}
        position="relative"
      >
        <VStack align="stretch" gap={6}>
          <HStack justify="space-between" align="center">
            <Text
              fontSize="24px"
              fontWeight="bold"
              color="#000000"
              textAlign="left"
            >
              {isEditMode ? "Edit Folder" : "Create Folder"}
            </Text>

            <ButtonV2 variant="ghost" onClick={onClose} p={0}>
              <X size={24} color="#71717A" />
            </ButtonV2>
          </HStack>
          <form onSubmit={onSubmit}>
            <VStack align="stretch" gap={4}>
              <Field.Root invalid={!!errors.name}>
                <Field.Label fontSize="16px" fontWeight="500" color="#000000">
                  Name
                </Field.Label>
                <InputField
                  register={register("name")}
                  placeholder="Enter folder name"
                  inputProps={{ borderRadius: "xl" }}
                />
                {errors.name && (
                  <Field.ErrorText>{errors.name.message}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!errors.description}>
                <Field.Label fontSize="16px" fontWeight="500" color="#000000">
                  Description
                </Field.Label>
                <Textarea
                  {...register("description")}
                  placeholder="Enter folder description"
                  defaultValue={folder?.description || ""}
                  minH="80px"
                  borderRadius="xl"
                  border="1px solid #E4E4E7"
                  resize="vertical"
                />
                {errors.description && (
                  <Field.ErrorText>
                    {errors.description.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Box display="flex" gap={4} w="100%">
                <ButtonV2
                  variant="ghost"
                  h="40px"
                  border="1px solid #E4E4E7"
                  color="black"
                  borderRadius="xl"
                  onClick={onClose}
                  flex="1"
                >
                  Cancel
                </ButtonV2>
                <ButtonV2
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  flex="1"
                  h="40px"
                >
                  {isEditMode ? "Update" : "Create"}
                </ButtonV2>
              </Box>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};
