'use client'

import { Progress, Box, Heading, Text } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect } from 'react'
import { useOnboardingSubmission } from '@/api'
import { useOnboardingLogic } from '@/hooks/useOnboardingLogic'
import { createPageSchema } from '@/utils/validationSchemas'
import { FieldRenderer } from './FieldRenderer'
import { Button } from '@/components/ui/Button'
import { Question } from '@/types/onboarding'

interface Props {
  userType: string
  token: string
}

export const OnboardingSteps = ({ userType, token }: Props) => {
  const {
    currentPage,
    isLoading,
    error,
    progressPercent,
    isFirstPage,
    isLastPage,
    goToPreviousPage,
    goToNextPage,
    redirectToHome
  } = useOnboardingLogic()

  const [submitError, setSubmitError] = useState<string>('')
  const [showValidationError, setShowValidationError] = useState<boolean>(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const submissionMutation = useOnboardingSubmission(userType)

  const schema = createPageSchema(currentPage?.questions || [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
    clearErrors,
    unregister,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  })

  const getAllPossibleFields = (questions: Question[]): string[] => {
    const fields: string[] = []
    questions.forEach(question => {
      fields.push(question.field)
      if (question.followup_question) {
        Object.values(question.followup_question).forEach(followup => {
          fields.push(...getAllPossibleFields([followup]))
        })
      }
    })
    return fields
  }

  const getCurrentVisibleFields = (questions: Question[], formValues: Record<string, any>): string[] => {
    const fields: string[] = []

    const processQuestion = (question: Question) => {
      fields.push(question.field)

      if (question.followup_question && formValues[question.field]) {
        const values = Array.isArray(formValues[question.field])
          ? formValues[question.field]
          : [formValues[question.field]]

        values.forEach((val: string) => {
          const followup = question.followup_question![val]
          if (followup) {
            processQuestion(followup)
          }
        })
      }
    }

    questions.forEach(processQuestion)
    return fields
  }

  const getChildFields = (question: Question): string[] => {
    const fields: string[] = []
    if (question.followup_question) {
      Object.values(question.followup_question).forEach(followup => {
        fields.push(followup.field)
        fields.push(...getChildFields(followup))
      })
    }
    return fields
  }

  const cleanupInvisibleFields = async (): Promise<void> => {
    if (!currentPage) return

    const currentValues = getValues()
    const visibleFields = getCurrentVisibleFields(currentPage.questions, currentValues)
    const allPossibleFields = getAllPossibleFields(currentPage.questions)

    const invisibleFields = allPossibleFields.filter(field => !visibleFields.includes(field))

    invisibleFields.forEach(field => {
      unregister(field)
      clearErrors(field)
    })

    await new Promise(resolve => setTimeout(resolve, 10))
  }

  const performValidationWithoutGhosts = async (): Promise<boolean> => {
    if (!currentPage) return false

    await cleanupInvisibleFields()

    const currentValues = getValues()
    const visibleFields = getCurrentVisibleFields(currentPage.questions, currentValues)

    const isValid = await trigger(visibleFields)
    return isValid
  }

  useEffect(() => {
    const currentValues = getValues()
    setFormData(prev => ({ ...prev, ...currentValues }))

    setShowValidationError(false)
    setHasAttemptedSubmit(false)
    setSubmitError('')

    reset()
  }, [currentPage?.id, getValues, reset])

  useEffect(() => {
    if (currentPage && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        Object.entries(formData).forEach(([field, value]) => {
          if (value !== undefined) {
            setValue(field, value, { shouldValidate: false })
          }
        })
      }, 10)

      return () => clearTimeout(timeoutId)
    }
  }, [currentPage?.id, setValue, formData])

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const hasErrors = Object.keys(errors).length > 0
      setShowValidationError(hasErrors)
    }
  }, [errors, hasAttemptedSubmit])

  const onNext = async () => {
    setHasAttemptedSubmit(true)

    try {
      const isValid = await performValidationWithoutGhosts()

      if (isValid) {
        setShowValidationError(false)
        setSubmitError('')
        goToNextPage()
      } else {
        setShowValidationError(true)
      }
    } catch {
      setShowValidationError(true)
    }
  }

  const onSubmit = async () => {
    setHasAttemptedSubmit(true)

    try {
      const isValid = await performValidationWithoutGhosts()

      if (!isValid) {
        setShowValidationError(true)
        return
      }

      const currentValues = getValues()
      const allData = { ...formData, ...currentValues }

      await submissionMutation.mutateAsync(allData)
      alert('Profile created successfully!')
      redirectToHome()
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error ||
        error?.response?.data?.detail ||
        'Submission failed'
      setSubmitError(errorMsg)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLastPage) {
      onNext()
    }
  }

  if (isLoading) return <Text p={8}>Loading onboarding...</Text>
  if (error) return <Text color="red.500" p={8}>{error}</Text>
  if (!currentPage) return <Text>No onboarding page found.</Text>

  const hasFormErrors = Object.keys(errors).length > 0

  return (
    <Box p={6}>
      <Box mb={6}>
        <Text fontSize="sm" mb={1}>
          Progress: {progressPercent}%
        </Text>
        <Progress.Root
          value={progressPercent}
          max={100}
        >
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>

      <Text fontSize="sm" color="gray.600" mb={4}>
        Required fields are marked with{' '}
        <Text as="span" color="red.500">*</Text>
      </Text>

      <Heading size="md" mb={4}>
        {currentPage.guide}
      </Heading>

      <form onSubmit={handleFormSubmit}>
        {currentPage.questions.map((question) => (
          <FieldRenderer
            key={question.field}
            question={question}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
          />
        ))}

        {showValidationError && hasFormErrors && (
          <Alert.Root status="error" mb={4}>
            <Alert.Indicator />
            <Alert.Title>
              Please follow the instructions to fill the form.
            </Alert.Title>
          </Alert.Root>
        )}

        {submitError && (
          <Alert.Root status="error" mb={4}>
            <Alert.Indicator />
            <Alert.Title>
              {submitError}
            </Alert.Title>
          </Alert.Root>
        )}

        <Box mt={6} display="flex" justifyContent="space-between">
          {!isFirstPage && (
            <Button
              type="button"
              onClick={goToPreviousPage}
              variant="secondary"
            >
              Previous
            </Button>
          )}

          {isLastPage ? (
            <Button
              type="button"
              onClick={onSubmit}
              variant="primary"
              isLoading={submissionMutation.isPending}
            >
              Submit
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
            >
              Next
            </Button>
          )}
        </Box>
      </form>
    </Box>
  )
}