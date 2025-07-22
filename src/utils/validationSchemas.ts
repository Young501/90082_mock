import * as yup from "yup";
import { Question } from "@/types/onboarding";

type ParentChainItem = { field: string; value: any };

export const createPageSchema = (
  questions: Question[],
  isProfilePage: boolean = false
) => {
  const shape: Record<string, any> = {}

  const addQuestionToSchema = (question: Question, parentChain: ParentChainItem[] = []) => {
    let fieldSchema: any
    if (question.type === "text" || question.type === "location") {
      fieldSchema = yup.string()
    } else if (question.type === "number") {
      fieldSchema = yup.number().typeError("Must be a number")
    } else if (question.type === "range") {
      fieldSchema = yup
        .number()
        .typeError("Must be a number")
        .min(question.min || 0, `Value must be at least ${question.min}`)
        .max(question.max || 200, `Value must be at most ${question.max}`)
    } else if (question.type === "url") {
      fieldSchema = yup.string().url("Invalid URL format")
    } else if (question.type === "select") {
      fieldSchema = yup.string()
    } else if (question.type === "multi-select") {
      fieldSchema = yup
        .array()
        .of(yup.string())
        .max(
          question.max_selection || Infinity,
          `Maximum ${question.max_selection} selections allowed`
        )
        .transform((value: any) => {
          if (Array.isArray(value) && value.length === 0) {
            return undefined
          }
          return value
        })
    } else if (question.type === "tag-select") {
      fieldSchema = yup
        .array()
        .of(yup.string())
        .transform((value: any) => {
          if (Array.isArray(value) && value.length === 0) {
            return undefined
          }
          return value
        })
    } else if (question.type === "checkbox-group") {
      const maxSelections = question.max_selection
      if (maxSelections === 1) {
        fieldSchema = yup.string().transform((value: any) => {
          if (value === "" || value === null || value === undefined) {
            return undefined
          }
          return value
        })
      } else {
        fieldSchema = yup
          .array()
          .of(yup.string())
          .max(
            maxSelections || Infinity,
            `Maximum ${maxSelections} selections allowed`
          )
          .transform((value: any) => {
            if (Array.isArray(value) && value.length === 0) {
              return undefined
            }
            return value
          })
      }
    } else if (question.type === "file") {
      fieldSchema = yup
        .mixed()
        .test(
          "fileOrUrl",
          "Invalid file format. Only URL or file is acceptable.",
          (value: any) => {
            if (!value) return true
            if (typeof value === "string") return true
            if (typeof File !== "undefined" && value instanceof File) return true
            return false
          }
        )
    } else if (question.type === "card-select") {
      const maxSelections = question.max_selection
      if (maxSelections === 1) {
        fieldSchema = yup.string().transform((value: any) => {
          if (value === "" || value === null || value === undefined) {
            return undefined
          }
          return value
        })
      } else {
        fieldSchema = yup
          .array()
          .of(yup.string())
          .max(
            maxSelections || Infinity,
            `Maximum ${maxSelections} selections allowed`
          )
          .transform((value: any) => {
            if (Array.isArray(value) && value.length === 0) {
              return undefined
            }
            return value
          })
      }
    } else {
      fieldSchema = yup.string()
    }

    let conditional = false
    let whenFields: string[] = []
    let whenCondition: (...parentValues: any[]) => boolean = () => true
    if (parentChain.length > 0) {
      conditional = true
      whenFields = parentChain.map((p) => p.field)
      whenCondition = (...parentValues: any[]) => {
        for (let i = 0; i < parentChain.length; i++) {
          if (parentValues[i] !== parentChain[i].value) {
            return false
          }
        }
        return true
      }
    }

    if (question.required) {
      if (
        question.type === "multi-select" ||
        question.type === "tag-select" ||
        (question.type === "checkbox-group" && question.max_selection !== 1) ||
        (question.type === "card-select" && question.max_selection !== 1)
      ) {
        if (conditional) {
          fieldSchema = fieldSchema.when(whenFields, {
            is: (...parentValues: any[]) => whenCondition(...parentValues),
            then: (schema: any) => schema.required("This field is required").min(1, "This field is required").test("not-empty-array", "This field is required", (value: any) => Array.isArray(value) && value.length > 0),
            otherwise: (schema: any) => schema.notRequired(),
          })
        } else {
          fieldSchema = fieldSchema.required("This field is required").min(1, "This field is required").test("not-empty-array", "This field is required", (value: any) => Array.isArray(value) && value.length > 0)
        }
      } else if (question.type === "range") {
        if (conditional) {
          fieldSchema = fieldSchema.when(whenFields, {
            is: (...parentValues: any[]) => whenCondition(...parentValues),
            then: (schema: any) => schema.required("This field is required").test("is-range-required", "This field is required", (value: any) => typeof value === "number" && !isNaN(value)),
            otherwise: (schema: any) => schema.notRequired(),
          })
        } else {
          fieldSchema = fieldSchema.required("This field is required").test("is-range-required", "This field is required", (value: any) => typeof value === "number" && !isNaN(value))
        }
      } else if (question.type === "file") {
        if (question.required && !isProfilePage) {
          if (conditional) {
            fieldSchema = fieldSchema.when(whenFields, {
              is: (...parentValues: any[]) => whenCondition(...parentValues),
              then: (schema: any) => schema.required("This field is required"),
              otherwise: (schema: any) => schema.notRequired(),
            })
          } else {
            fieldSchema = fieldSchema.required("This field is required")
          }
        }
      } else {
        if (conditional) {
          fieldSchema = fieldSchema.when(whenFields, {
            is: (...parentValues: any[]) => whenCondition(...parentValues),
            then: (schema: any) => schema.required("This field is required"),
            otherwise: (schema: any) => schema.notRequired(),
          })
        } else {
          fieldSchema = fieldSchema.required("This field is required")
        }
      }
    } else if (conditional) {
      fieldSchema = fieldSchema.when(whenFields, {
        is: (...parentValues: any[]) => whenCondition(...parentValues),
        then: (schema: any) => schema,
        otherwise: (schema: any) => schema.notRequired(),
      })
    }

    shape[question.field] = fieldSchema

    if (question.followup_question) {
      Object.entries(question.followup_question).forEach(([parentValue, followupQuestion]) => {
        addQuestionToSchema(followupQuestion, [...parentChain, { field: question.field, value: parentValue }])
      })
    }
  }

  const processAllQuestions = (questions: Question[]) => {
    questions.forEach((question) => {
      addQuestionToSchema(question)
    })
  }

  processAllQuestions(questions)

  return yup.object().shape(shape)
}

export const authValidationSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
})

export const resetPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
})

export const passwordResetFormSchema = yup.object({
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Please enter new password"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm password"),
})

export const createFolderSchema = yup.object({
  name: yup
    .string()
    .required("Folder name is required")
    .min(1, "Folder name cannot be empty"),
  description: yup
    .string()
    .required("Description is required")
    .min(1, "Description cannot be empty"),
});
