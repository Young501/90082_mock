"use client";

import { Box, Text, Field, Flex, VStack } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { Control, useController } from "react-hook-form";
import { useAuthStore } from "@/store";
import { ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { ButtonV2 } from "../ui/ButtonV2";

const ACCEPT = "image/png,image/jpeg";
const ALLOWED_TYPES = ["image/png", "image/jpeg"];
const MAX_SIZE_MB = 8;
const HELP_TEXT = ".png or .jpg files up to 8MB. Recommended size is 72 x 72";

interface ImageUploadFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  error?: string;
  required?: boolean;
  description?: "profile_picture" | "logo_url";
  onRemove?: () => void;
}

export const ImageUploadField = ({
  name,
  label,
  control,
  error,
  required,
  description,
  onRemove,
}: ImageUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getUserProfilePictureUrl, getLogoUrl, getUserType } = useAuthStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const userType = getUserType();
  const { field } = useController({ name, control });

  useEffect(() => {
    if (field.value instanceof File) {
      const url = URL.createObjectURL(field.value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [field.value]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large (max ${MAX_SIZE_MB}MB)`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. ${HELP_TEXT}`;
    }
    return null;
  };

  const handleFileChange = (file: File) => {
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    field.onChange(file);
  };

  const getPreviewSrc = () =>
    previewUrl ||
    (typeof field.value === "string" ? field.value : null) ||
    (description === "logo_url" ? getLogoUrl() : getUserProfilePictureUrl());

  const displaySrc = getPreviewSrc();

  return (
    <Field.Root invalid={!!error}>
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
      <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
          accept={ACCEPT}
          style={{ display: "none" }}
        />

        <Flex align="center" gap={4} flexWrap="wrap">
          <Box
            w="60px"
            h="60px"
            borderRadius="full"
            border="1px solid"
            borderColor="profile.500"
            bg={!displaySrc ? "profile.500" : "transparent"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            flexShrink={0}
            cursor="pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {field.value && displaySrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob URLs and dynamic store URLs
              <img
                src={displaySrc}
                alt="Preview"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <ImageIcon size={40} color="white" strokeWidth={1.5} />
            )}
          </Box>

          <VStack align="flex-start" gap={2}>
            <ButtonV2
              variant="secondary"
              borderColor={userType === "organisation" ? "#D3EFEA" : "#D6EDFB"}
              color="profile.500"
              borderRadius="lg"
              size="sm"
              fontWeight="500"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload photo
            </ButtonV2>
            <Text fontSize="xs" color="#A1A1AA">
              {HELP_TEXT}
            </Text>
          </VStack>
        </Flex>
      </>
      {error && <Field.ErrorText mt={2}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
