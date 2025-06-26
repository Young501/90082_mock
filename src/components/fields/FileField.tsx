import { Box, Text, Field } from "@chakra-ui/react";
import { useRef } from "react";
import { Control, Controller } from "react-hook-form";
import { imgplaceholder, resume } from "@/assets";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";

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
  const setProfileImageUrl = useAuthStore((state) => state.setProfileImageUrl);
  const setLogoUrl = useAuthStore((state) => state.setLogoUrl);

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
      alert(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onChange(file);

    const fileUrl = URL.createObjectURL(file);
    if (description === "profile_picture") {
      setProfileImageUrl(fileUrl);
    } else if (description === "logo") {
      setLogoUrl(fileUrl);
    }
  };

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
        render={({ field }) => (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleFileChange(file, field.onChange);
                }
              }}
              accept={config.accept}
              style={{ display: "none" }}
            />

            <Box
              borderRadius="full"
              p={4}
              textAlign="center"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {field.value ? (
                <Box>
                  {config.showPreview ? (
                    <Box display="flex" justifyContent="center">
                      <Image
                        src={URL.createObjectURL(field.value)}
                        alt="Preview"
                        width={200}
                        height={200}
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  ) : (
                    <Text color="blue.500">📄 {field.value.name}</Text>
                  )}
                  <Text fontSize="sm" color="gray.600">
                    Click to change file
                  </Text>
                </Box>
              ) : (
                <Box>
                  {description === "profile_picture" ||
                  description === "logo" ? (
                    <Box display="flex" justifyContent="center">
                      <Image
                        src={imgplaceholder}
                        alt="Placeholder"
                        width={200}
                        height={200}
                        style={{
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    </Box>
                  ) : description === "resume" ? (
                    <Box display="flex" justifyContent="center">
                      <Image
                        src={resume}
                        alt="Placeholder"
                        width={400}
                        height={400}
                        style={{
                          maxWidth: "588px",
                        }}
                      />
                    </Box>
                  ) : (
                    <Text>{config.emptyText}</Text>
                  )}

                  <Text fontSize="sm" color="gray.500">
                    {config.helpText}
                  </Text>
                </Box>
              )}
            </Box>
          </>
        )}
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
