"use client";

import { Box, Text, Field, Flex } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Upload, FileText } from "lucide-react";
import { toast } from "react-toastify";

const ACCEPT = "application/pdf,image/jpeg,image/jpg";
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg"];
const MAX_SIZE_MB = 5;
const HELP_TEXT = "pdf, .jpg up to 5MB";

interface DocumentUploadFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  error?: string;
  required?: boolean;
  onRemove?: () => void;
}

export const DocumentUploadField = ({
  name,
  label,
  control,
  error,
  required,
  onRemove,
}: DocumentUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large (max ${MAX_SIZE_MB}MB)`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. ${HELP_TEXT}`;
    }
    return null;
  };

  const handleFile = (file: File, onChange: (value: any) => void) => {
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent, onChange: (value: any) => void) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file, onChange);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <Field.Root invalid={!!error} style={{ width: "100% !important" }}>
      {label && (
        <Field.Label
          fontSize="sm"
          fontWeight="500"
          color="black"
          display="block"
        >
          {label}
          {required && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </Field.Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file, field.onChange);
              }}
              accept={ACCEPT}
              style={{ display: "none" }}
            />

            {field.value ? (
              <Box
                borderWidth="1px"
                borderRadius="md"
                p={4}
                width="100%"
                // bg="gray.50"
                borderColor="#E4E4E7"
              >
                <Flex align="center" gap={3}>
                  <FileText size={24} color="#71717A" />
                  <Text fontSize="sm" fontWeight="500" flex={1}>
                    {field.value instanceof File
                      ? field.value.name
                      : "Document"}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="#2AA8E0"
                    cursor="pointer"
                    fontWeight="500"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Text>
                </Flex>
              </Box>
            ) : (
              <Box
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={isDragging ? "#2AA8E0" : "#E4E4E7"}
                borderRadius="md"
                p={8}
                width="100%"
                height={{ base: "180px", md: "233px" }}
                textAlign="center"
                cursor="pointer"
                bg={isDragging ? "#F0F9FF" : "white"}
                transition="all 0.2s"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => handleDrop(e, field.onChange)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Flex direction="column" align="center" gap={2}>
                  <Upload size={15} color="#27272A" />
                  <Text fontSize="sm" fontWeight="500" color="black">
                    Drag and drop here to upload
                  </Text>
                  <Text fontSize="sm" color="black">
                    or{" "}
                    <Text
                      as="span"
                      fontWeight="600"
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      click to browse from your device
                    </Text>{" "}
                    ({HELP_TEXT})
                  </Text>
                </Flex>
              </Box>
            )}
          </>
        )}
      />
      {error && <Field.ErrorText mt={2}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
