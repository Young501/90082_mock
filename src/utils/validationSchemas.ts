import * as yup from "yup";
import { Question } from "@/types/onboarding";

export const createPageSchema = (questions: Question[]) => {
  const shape: Record<string, any> = {};

  const addQuestionToSchema = (question: Question) => {
    let fieldSchema: any;

    if (question.type === "text" || question.type === "location") {
      fieldSchema = yup.string();
    } else if (question.type === "number") {
      fieldSchema = yup.number().typeError("Must be a number");
    } else if (question.type === "range") {
      fieldSchema = yup
        .number()
        .typeError("Must be a number")
        .min(question.min || 0, `Value must be at least ${question.min}`)
        .max(question.max || 200, `Value must be at most ${question.max}`);
    } else if (question.type === "url") {
      fieldSchema = yup.string().url("Invalid URL format");
    } else if (question.type === "select") {
      fieldSchema = yup.string();
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
            return undefined;
          }
          return value;
        });
    } else if (question.type === "tag-select") {
      fieldSchema = yup
        .array()
        .of(yup.string())
        .transform((value: any) => {
          if (Array.isArray(value) && value.length === 0) {
            return undefined;
          }
          return value;
        });
    } else if (question.type === "checkbox-group") {
      const maxSelections =
        question.max_selections ||
        question.max_selection ||
        question["max-selection"];
      if (maxSelections === 1) {
        fieldSchema = yup.string().transform((value: any) => {
          if (value === "" || value === null || value === undefined) {
            return undefined;
          }
          return value;
        });
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
              return undefined;
            }
            return value;
          });
      }
    } else if (question.type === "file") {
      fieldSchema = yup
        .mixed<File>()
        .test("fileType", "Invalid file type", (value: any) => {
          if (!value) return true;
          return value instanceof File;
        });
    } else if (question.type === "card-select") {
      const maxSelections =
        question.max_selections ||
        question.max_selection ||
        question["max-selection"];
      if (maxSelections === 1) {
        fieldSchema = yup.string().transform((value: any) => {
          if (value === "" || value === null || value === undefined) {
            return undefined;
          }
          return value;
        });
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
              return undefined;
            }
            return value;
          });
      }
    } else {
      fieldSchema = yup.string();
    }

    if (question.required) {
      if (
        question.type === "multi-select" ||
        question.type === "tag-select" ||
        (question.type === "checkbox-group" &&
          (question.max_selections ||
            question.max_selection ||
            question["max-selection"]) !== 1) ||
        (question.type === "card-select" &&
          (question.max_selections ||
            question.max_selection ||
            question["max-selection"]) !== 1)
      ) {
        fieldSchema = fieldSchema
          .required("This field is required")
          .min(1, "This field is required")
          .test("not-empty-array", "This field is required", (value: any) => {
            return Array.isArray(value) && value.length > 0;
          });
      } else if (question.type === "range") {
        fieldSchema = fieldSchema
          .required("This field is required")
          .test("is-range-required", "This field is required", (value: any) => {
            return typeof value === "number" && !isNaN(value);
          });
      } else {
        fieldSchema = fieldSchema.required("This field is required");
      }
    }

    shape[question.field] = fieldSchema;

    if (question.followup_question) {
      Object.values(question.followup_question).forEach((followupQuestion) => {
        addQuestionToSchema(followupQuestion);
      });
    }
  };

  const processAllQuestions = (questions: Question[]) => {
    questions.forEach((question) => {
      addQuestionToSchema(question);
    });
  };

  processAllQuestions(questions);

  return yup.object().shape(shape);
};

export const authValidationSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const resetPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
});
