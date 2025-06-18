import { Box, Image, Text, Field } from '@chakra-ui/react'
import { useRef } from 'react'
import { Control, Controller } from 'react-hook-form'

export type FileFieldType = 'image' | 'resume'

export interface FileFieldConfig {
  accept: string
  allowedTypes: string[]
  maxSize: number // MB
  emptyText: string
  helpText: string
  showPreview: boolean
}

interface FileFieldProps {
  name: string
  label: string
  control: Control<any>
  fileType: FileFieldType
  error?: string
  required?: boolean
  config?: Partial<FileFieldConfig>
}

// Default configurations for different file types
const DEFAULT_CONFIGS: Record<FileFieldType, FileFieldConfig> = {
  image: {
    accept: 'image/png,image/jpeg',
    allowedTypes: ['image/png', 'image/jpeg'],
    maxSize: 5, // MB
    emptyText: '📸 Click to upload image',
    helpText: 'Supports: PNG, JPEG (max 5MB)',
    showPreview: true
  },
  resume: {
    accept: 'application/pdf',
    allowedTypes: ['application/pdf'],
    maxSize: 10, // MB
    emptyText: '📄 Click to upload resume',
    helpText: 'Supports: PDF only (max 10MB)',
    showPreview: false
  }
}

export const FileField = ({
  name,
  label,
  control,
  fileType,
  error,
  required,
  config: customConfig
}: FileFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const config = { ...DEFAULT_CONFIGS[fileType], ...customConfig }

  const validateFile = (file: File): string | null => {
    if (file.size > config.maxSize * 1024 * 1024) {
      return `File is too large (max ${config.maxSize}MB)`
    }

    if (!config.allowedTypes.includes(file.type)) {
      return `Invalid file type. ${config.helpText}`
    }

    return null
  }

  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && (
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        )}
      </Field.Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  const error = validateFile(file)
                  if (error) {
                    alert(error)
                    event.target.value = ''
                    return
                  }
                  field.onChange(file)
                }
              }}
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
              onClick={() => fileInputRef.current?.click()}
            >
              {field.value ? (
                <Box>
                  {config.showPreview ? (
                    <Image
                      src={URL.createObjectURL(field.value)}
                      alt="Preview"
                      maxH="200px"
                      mx="auto"
                      mb={2}
                    />
                  ) : (
                    <Text color="blue.500" mb={2}>
                      📄 {field.value.name}
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
          </>
        )}
      />
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  )
}