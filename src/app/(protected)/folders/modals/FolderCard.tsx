import React, { useState } from "react";
import {
  Box,
  Text,
  HStack,
  IconButton,
  Menu,
  Portal,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { Folder } from "@/types/folder";
import { DeleteModal } from "./DeleteModal";

interface FolderCardProps {
  folder: Folder;
  onEdit?: (folder: Folder) => void;
  onDelete?: (folderId: string) => void;
  onClick?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <Box
      bg="white"
      borderRadius="16px"
      px={6}
      pb={6}
      pt={12}
      boxShadow="-4px 4px 10.9px 4px #0000003D"
      border="1px solid #E0E0E0"
      transition="all 0.2s"
      cursor="pointer"
      position="relative"
      w="100%"
      maxW="350px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      onClick={onClick}
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "-4px 6px 15px 4px #0000004D",
      }}
    >
      {(onEdit || onDelete) && (
        <Box position="absolute" top={4} right={4} zIndex={10}>
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                p={0}
                minW="auto"
                h="auto"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Box
                  bg="#D9D9D9"
                  borderRadius="50%"
                  p="12px"
                  display="flex"
                  gap={1}
                  flexDirection="column"
                  w="60px"
                  h="60px"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box bg="#7E7E7E" w="9px" h="9px" borderRadius="50%" />
                  <Box bg="#7E7E7E" w="9px" h="9px" borderRadius="50%" />
                  <Box bg="#7E7E7E" w="9px" h="9px" borderRadius="50%" />
                </Box>
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content
                  bg="white"
                  border="1px solid #E2E8F0"
                  borderRadius="8px"
                  boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  py={2}
                  minW="140px"
                >
                  {onEdit && (
                    <Menu.Item
                      value="edit"
                      onClick={() => onEdit?.(folder)}
                      _hover={{ bg: "#F7FAFC" }}
                      px={4}
                      py={2}
                      fontSize="14px"
                      fontWeight="500"
                      color="#2D3748"
                    >
                      <Box display="flex" alignItems="center" gap={3}>
                        <i
                          className="fa-solid fa-edit"
                          style={{ color: "#2CA9DF", fontSize: "16px" }}
                        />
                        <Text>Edit Folder</Text>
                      </Box>
                    </Menu.Item>
                  )}
                  {onEdit && onDelete && (
                    <Menu.Separator borderColor="#E2E8F0" />
                  )}
                  {onDelete && (
                    <Menu.Item
                      value="delete"
                      onClick={() => setDeleteModalOpen(true)}
                      _hover={{ bg: "#FEF2F2" }}
                      px={4}
                      py={2}
                      fontSize="14px"
                      fontWeight="500"
                      color="#DC2626"
                    >
                      <Box display="flex" alignItems="center" gap={3}>
                        <i
                          className="fa-solid fa-trash"
                          style={{ color: "#DC2626", fontSize: "16px" }}
                        />
                        <Text>Delete Folder</Text>
                      </Box>
                    </Menu.Item>
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Box>
      )}

      <VStack justify="center" align="center" w="100%" gap={4}>
        <Box>
          <Image
            src="/assets/folderimage.png"
            alt="Folder"
            width={160}
            height={160}
          />
        </Box>
        <Text fontSize="18px" fontWeight="600" color="#000000" mb={2}>
          {folder.name}
        </Text>
      </VStack>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={() => onDelete?.(folder.id)}
      />
    </Box>
  );
};
