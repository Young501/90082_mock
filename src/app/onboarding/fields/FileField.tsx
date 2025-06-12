import { Box, Image, Text } from '@chakra-ui/react';
import { FieldProps } from '../FieldRenderer';
import { useRef } from 'react';

// Field to file type mapping - all file upload fields must be defined here
const FIELD_TYPE_MAP: Record<string, 'image' | 'resume'> = {
  'profile_picture': 'image',
  'resume': 'resume',
  'logo': 'image',
};

// File type configurations
const FILE_CONFIG = {
  image: {
    accept: 'image/png,image/jpeg',
    allowedTypes: ['image/png', 'image/jpeg'] as string[],
    maxSize: 5, // MB
    emptyText: '📸 Click to upload image',
    helpText: 'Supports: PNG, JPEG (max 5MB)',
    showPreview: true
  },
  resume: {
    accept: 'application/pdf',
    allowedTypes: ['application/pdf'] as string[],
    maxSize: 10, // MB
    emptyText: '📄 Click to upload resume',
    helpText: 'Supports: PDF only (max 10MB)',
    showPreview: false
  }
};

export const FileField = ({ question, value, onChange }: FieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileType = FIELD_TYPE_MAP[question.field];
  if (!fileType) {
    console.error(`File field '${question.field}' is not defined in FIELD_TYPE_MAP`);
    return <Text color="red.500">File field configuration missing</Text>;
  }

  const config = FILE_CONFIG[fileType];

  const validateFile = (file: File): string | null => {
    if (file.size > config.maxSize * 1024 * 1024) {
      return `File is too large (max ${config.maxSize}MB)`;
    }

    if (!config.allowedTypes.includes(file.type)) {
      return `Invalid file type. ${config.helpText}`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        event.target.value = '';
        return;
      }
      onChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayValue = value as File | undefined;

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={config.accept}
        style={{ display: 'none' }}
      />

      <Box
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="md"
        p={4}
        textAlign="center"
        cursor="pointer"
        _hover={{ borderColor: 'blue.400' }}
        onClick={handleClick}
      >
        {displayValue ? (
          <Box>
            {config.showPreview ? (
              <Image
                src={URL.createObjectURL(displayValue)}
                alt="Preview"
                maxH="200px"
                mx="auto"
                mb={2}
              />
            ) : (
              <Text color="blue.500" mb={2}>
                📄 {displayValue.name}
              </Text>
            )}
            <Text fontSize="sm" color="gray.600">
              Click to change file
            </Text>
          </Box>
        ) : (
          <Box>
            <Text mb={2}>
              {config.emptyText}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {config.helpText}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};