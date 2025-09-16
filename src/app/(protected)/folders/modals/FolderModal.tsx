import React from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Field,
  Input,
  Textarea,
} from "@chakra-ui/react";
import Image from "next/image";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CreateFolderRequest, Folder } from "@/types/folder";

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
      zIndex={1000}
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
        <Button
          position="absolute"
          top={4}
          right={4}
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <Image src="/assets/cancel.svg" alt="Close" width={25} height={25} />
        </Button>

        <VStack align="stretch" gap={6} pt={4}>
          <Text
            fontSize="24px"
            fontWeight="bold"
            color="#000000"
            textAlign="left"
          >
            {isEditMode ? "Edit Folder" : "Create Folder"}
          </Text>

          <form onSubmit={onSubmit}>
            <VStack align="stretch" gap={4}>
              <Field.Root invalid={!!errors.name}>
                <Field.Label fontSize="16px" fontWeight="500" color="#000000">
                  Name
                </Field.Label>
                <Input
                  {...register("name")}
                  placeholder="Enter folder name"
                  defaultValue={folder?.name || ""}
                  h="50px"
                  borderRadius="8px"
                  border="1px solid #2CA9DF"
                  _focus={{
                    borderColor: "#2CA9DF",
                    boxShadow: "0 0 0 1px #2CA9DF",
                  }}
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
                  minH="100px"
                  borderRadius="8px"
                  border="1px solid #2CA9DF"
                  _focus={{
                    borderColor: "#2CA9DF",
                    boxShadow: "0 0 0 1px #2CA9DF",
                  }}
                  resize="vertical"
                />
                {errors.description && (
                  <Field.ErrorText>
                    {errors.description.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Box display="flex" gap={4} justifyContent="flex-end">
                <Button
                  type="submit"
                  mt={4}
                  bg="#282F68"
                  color="white"
                  borderRadius="8px"
                  h="40px"
                  fontSize="14px"
                  fontWeight="600"
                  loading={isLoading}
                  maxW="150px"
                  w="100%"
                >
                  {isEditMode ? "Update" : "Create"}
                </Button>
                {/* <Button
                  mt={4}
                  bg="transparent"
                  color="#000000"
                  borderRadius="8px"
                  h="40px"
                  fontSize="14px"
                  fontWeight="600"
                  onClick={onClose}
                  maxW="150px"
                  w="100%"
                  border="1px solid #000000"
                >
                  Cancel
                </Button> */}
              </Box>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};
