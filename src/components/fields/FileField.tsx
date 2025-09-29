import {
  Box,
  Text,
  Field,
  Button,
  Link,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Control, Controller } from "react-hook-form";
import Image from "next/image";
import { useAuthStore } from "@/store";
import { FileText, Upload, Download, Edit, X } from "lucide-react";
import { toast } from "react-toastify";

export type FileFieldType = "image" | "resume";

export interface FileFieldConfig {
  accept: string;
  allowedTypes: string[];
  maxSize: number; // MB
  emptyText: string;
  helpText: string;
  showPreview: boolean;
}

interface FileFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  fileType: FileFieldType;
  error?: string;
  required?: boolean;
  config?: Partial<FileFieldConfig>;
  labelPosition?: "top" | "bottom";
  description?: string;
}

// Default configurations for different file types
const DEFAULT_CONFIGS: Record<FileFieldType, FileFieldConfig> = {
  image: {
    accept: "image/png,image/jpeg",
    allowedTypes: ["image/png", "image/jpeg"],
    maxSize: 5, // MB
    emptyText: "📸 Click to upload image",
    helpText: "Supports: PNG, JPEG (max 5MB)",
    showPreview: true,
  },
  resume: {
    accept: "application/pdf",
    allowedTypes: ["application/pdf"],
    maxSize: 10, // MB
    emptyText: "📄 Click to upload resume",
    helpText: "Supports: PDF only (max 10MB)",
    showPreview: false,
  },
};

export const FileField = ({
  name,
  label,
  control,
  fileType,
  error,
  required,
  config: customConfig,
  labelPosition = "top",
  description,
}: FileFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = { ...DEFAULT_CONFIGS[fileType], ...customConfig };
  const { getUserProfilePictureUrl, getLogoUrl } = useAuthStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > config.maxSize * 1024 * 1024) {
      return `File is too large (max ${config.maxSize}MB)`;
    }

    if (!config.allowedTypes.includes(file.type)) {
      return `Invalid file type. ${config.helpText}`;
    }

    return null;
  };

  const handleFileChange = (file: File, onChange: (value: any) => void) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onChange(file);

    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  const cleanupPreviewUrl = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      cleanupPreviewUrl();
    };
  }, [cleanupPreviewUrl]);

  return (
    <Field.Root invalid={!!error} style={{ alignItems: "center" }}>
      {label && labelPosition === "top" && (
        <Field.Label>
          {label}
          {required && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </Field.Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          useEffect(() => {
            if (
              field.value instanceof File &&
              !previewUrl &&
              config.showPreview
            ) {
              const fileUrl = URL.createObjectURL(field.value);
              setPreviewUrl(fileUrl);
            }
          }, [field.value]);

          const handleRemoveFile = () => {
            cleanupPreviewUrl();
            field.onChange(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          };

          return (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    cleanupPreviewUrl();
                    handleFileChange(file, field.onChange);
                  }
                }}
                accept={config.accept}
                style={{ display: "none" }}
              />

              {fileType === "resume" && field.value ? (
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  width="100%"
                  bg="gray.50"
                  borderColor="#A2DDF0"
                >
                  <Flex direction="column" gap={3}>
                    <Flex align="center" justify="space-between">
                      <Flex align="center" gap={2}>
                        <FileText size={24} />
                        <Text
                          fontWeight="medium"
                          maxWidth="200px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {field.value instanceof File
                            ? field.value.name // effective on file change only actual file value doesnt exist on prepopulated fields
                            : "Resume.pdf"}
                        </Text>
                      </Flex>
                      <IconButton
                        aria-label="Remove file"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={handleRemoveFile}
                      />
                    </Flex>

                    <Flex justify="space-between" mt={2}>
                      <Link
                        href={
                          previewUrl ||
                          (typeof field.value === "string" ? field.value : "#")
                        }
                        target="_blank"
                        _hover={{ textDecoration: "none" }}
                      >
                        <Button size="sm" variant="outline">
                          View Resume
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="solid"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change File
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              ) : fileType === "image" && field.value ? (
                <Box
                  borderRadius="full"
                  p={4}
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Box>
                    {config.showPreview ? (
                      <Box display="flex" justifyContent="center">
                        <Image
                          src={
                            previewUrl ||
                            (description === "logo_url"
                              ? getLogoUrl()
                              : getUserProfilePictureUrl()) ||
                            (typeof field.value === "string"
                              ? field.value
                              : "/assets/imgplaceholder.png")
                          }
                          alt="Preview"
                          width={200}
                          height={200}
                          style={{
                            objectFit: "cover",
                            borderRadius: "50%",
                            width: "200px",
                            height: "200px",
                          }}
                        />
                      </Box>
                    ) : (
                      <Text color="blue.500">
                        📄{" "}
                        {field.value instanceof File
                          ? field.value.name
                          : "File selected"}
                      </Text>
                    )}
                    <Text fontSize="sm" color="gray.600">
                      Click to change file
                    </Text>
                  </Box>
                </Box>
              ) : (
                <Box
                  borderRadius={fileType === "image" ? "full" : "md"}
                  p={4}
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Box>
                    {description === "profile_picture_url" ||
                    description === "logo_url" ? (
                      <Box display="flex" justifyContent="center">
                        <Image
                          src="/assets/imgplaceholder.png"
                          alt="Placeholder"
                          width={200}
                          height={200}
                          style={{
                            objectFit: "cover",
                            borderRadius: "50%",
                            width: "200px",
                            height: "200px",
                          }}
                        />
                      </Box>
                    ) : description === "resume_url" ? (
                      <Box display="flex" justifyContent="center">
                        <Image
                          src="/assets/resume.png"
                          alt="Placeholder"
                          width={350}
                          height={350}
                          style={{
                            maxWidth: "588px",
                          }}
                        />
                      </Box>
                    ) : (
                      <Text>{config.emptyText}</Text>
                    )}

                    <Text fontSize="sm" color="gray.500" mt={2}>
                      {config.helpText}
                    </Text>
                  </Box>
                </Box>
              )}
            </>
          );
        }}
      />
      {label && labelPosition === "bottom" && (
        <Field.Label>
          <span style={{ textAlign: "center", display: "block" }}>{label}</span>
          {required && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </Field.Label>
      )}
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
