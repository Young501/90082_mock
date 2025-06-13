'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingPages, useAuth } from '@/api'
import { API_ENDPOINTS, apiRequest } from '@/utils/api'
import { submitOnboardingAnswers } from './utils'

// ==== Define Type ====

type FollowupQuestionMap = {
    [selectedOption: string]: Question
}

export type Question = {
    field: string
    label: string
    type:
        | 'text'
        | 'select'
        | 'url'
        | 'multi-select'
        | 'file'
        | 'location'
        | 'number'
    required?: boolean
    options?: string[]
    option?: string[]
    max_selection?: number
    followup_question?: FollowupQuestionMap
    upload_endpoint?: string
}

export type Page = {
    id: number
    guide: string
    questions: Question[]
    follow_by?: number
}

export type AnswerValue = string | number | string[] | File | undefined

type AnswerMap = {
    [field: string]: AnswerValue
}

type OnboardingContextType = {
    currentPageId: number
    pages: Page[]
    answers: AnswerMap
    currentPage?: Page
    loading: boolean
    error: string | null
    hasAttemptedValidation: boolean
    fieldErrors: { [field: string]: string[] }
    setAnswer: (_field: string, _value: AnswerValue) => void
    goToPreviousPage: () => void
    handleNext: () => boolean
    handleSubmit: (
        _userType: string,
        _token: string
    ) => Promise<{ success: boolean; error?: string }>
    reset: () => void
}

// ==== Creat Context ====

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

// ==== Provider ====

export const OnboardingProvider = ({
  children,
}: {
    children: React.ReactNode
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [currentPageId, setCurrentPageId] = useState<number>(1)
  const [isMounted, setIsMounted] = useState(false)

  const userType = user?.user_types?.[0]
  const {
    data: pagesData,
    isLoading,
    error: queryError,
  } = useOnboardingPages(userType || '')

  const pages = pagesData?.onboarding_pages || []
  const currentPage = pages.find((p: Page) => p.id === currentPageId)
  const error = queryError?.message || null

  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
        [field: string]: string[]
    }>({})

  const validateField = (
    field: string,
    value: AnswerValue,
    question: Question
  ): string[] => {
    const errors: string[] = []

    if (
      question.required &&
            (value === undefined ||
                value === '' ||
                (Array.isArray(value) && value.length === 0))
    ) {
      errors.push('This field is required')
    }

    if (question.type === 'url' && value && typeof value === 'string') {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        errors.push('URL must start with http:// or https://')
      }
    }

    if (
      question.type === 'multi-select' &&
            Array.isArray(value) &&
            question.max_selection
    ) {
      if (value.length > question.max_selection) {
        errors.push(
          `Maximum ${question.max_selection} selections allowed`
        )
      }
    }

    return errors
  }

  const getAllQuestionsFromPage = (page: Page): Question[] => {
    const result: Question[] = []

    const addQuestion = (q: Question) => {
      result.push(q)
      if (q.followup_question && answers[q.field]) {
        const values = Array.isArray(answers[q.field])
          ? (answers[q.field] as string[])
          : [answers[q.field] as string]

        values.forEach((val) => {
          const followup = q.followup_question![val]
          if (followup) addQuestion(followup)
        })
      }
    }

    page.questions.forEach(addQuestion)
    return result
  }

  const findQuestionByField = (field: string): Question | undefined => {
    const findInQuestions = (
      questions: Question[]
    ): Question | undefined => {
      for (const q of questions) {
        if (q.field === field) return q
        if (q.followup_question) {
          for (const followup of Object.values(q.followup_question)) {
            const found = findInQuestions([followup])
            if (found) return found
          }
        }
      }
      return undefined
    }

    return currentPage?.questions
      ? findInQuestions(currentPage.questions)
      : undefined
  }

  const getAllQuestionsRecursively = (questions: Question[]): Question[] => {
    return questions.flatMap((q) => {
      let result = [q]
      if (q.followup_question) {
        Object.values(q.followup_question).forEach((followup) => {
          result = [
            ...result,
            ...getAllQuestionsRecursively([followup]),
          ]
        })
      }
      return result
    })
  }

  const validateCurrentPageAndSetErrors = (): {
        isValid: boolean
        hasErrors: boolean
    } => {
    if (!currentPage) return { isValid: true, hasErrors: false }

    setHasAttemptedValidation(true)

    const allQuestions = getAllQuestionsFromPage(currentPage)
    let hasErrors = false
    const newFieldErrors: { [field: string]: string[] } = {}

    allQuestions.forEach((question) => {
      const errors = validateField(
        question.field,
        answers[question.field],
        question
      )
      newFieldErrors[question.field] = errors
      if (errors.length > 0) {
        hasErrors = true
      }
    })

    setFieldErrors(newFieldErrors)

    return {
      isValid: !hasErrors,
      hasErrors,
    }
  }

  const handleNext = (): boolean => {
    const { isValid } = validateCurrentPageAndSetErrors()

    if (!isValid) {
      return false
    }

    const page = pages.find((p) => p.id === currentPageId)
    if (page?.follow_by) {
      setHasAttemptedValidation(false)
      setFieldErrors({})
      setCurrentPageId(page.follow_by)
    }
    return true
  }

  const handleSubmit = async (
    userType: string,
    token: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { isValid } = validateCurrentPageAndSetErrors()

    if (!isValid) {
      return {
        success: false,
        error: 'Please complete all required information',
      }
    }

    const allQuestions = pages.flatMap((page) =>
      getAllQuestionsRecursively(page.questions)
    )

    return await submitOnboardingAnswers(
      answers,
      userType,
      token,
      allQuestions
    )
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (!userType) {
      console.log('No userType found, redirecting to onboarding start')
      router.push('/onboarding')
      return
    }
  }, [userType, pages, currentPageId, router, isMounted])

  const setAnswer = (
    field: string,
    value: string | number | string[] | File | undefined
  ) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))

    if (hasAttemptedValidation) {
      const question = findQuestionByField(field)
      if (question) {
        const errors = validateField(field, value, question)
        setFieldErrors((prev) => ({ ...prev, [field]: errors }))
      }
    }
  }

  const goToPreviousPage = () => {
    const currentIndex = pages.findIndex(
      (p: Page) => p.id === currentPageId
    )
    if (currentIndex > 0) {
      setHasAttemptedValidation(false)
      setFieldErrors({})
      setCurrentPageId(pages[currentIndex - 1].id)
    }
  }

  const reset = () => {
    setAnswers({})
    setCurrentPageId(-1)
  }

  const contextValue: OnboardingContextType = {
    currentPageId,
    pages,
    answers,
    currentPage,
    loading: isLoading,
    error,
    hasAttemptedValidation,
    fieldErrors,
    setAnswer,
    goToPreviousPage,
    handleNext,
    handleSubmit,
    reset,
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext)
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return ctx
}
