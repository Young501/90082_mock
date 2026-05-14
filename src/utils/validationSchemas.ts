import * as yup from "yup";
import { Question } from "@/types/onboarding";
import { isDisallowedDomain } from "@/utils/constants";
import { validateContent } from "@/utils/contentValidation";

const contentValidationSchema = yup
  .string()
  .test("content-validation", "", function (value) {
    if (!value) return true;
    const result = validateContent(value);
    if (result.status === "error") {
      switch (result.type) {
        case "profanity":
          return this.createError({ message: "Please keep your language appropriate" });
        case "spam-lowercase":
          return this.createError({ message: "Please provide a meaningful response" });
        case "spam-uppercase":
          return this.createError({ message: "Please avoid repeating the same character" });

      }
    }
    return true;
  });

type ParentChainItem = { field: string; value: any };

export const createPageSchema = (
  questions: Question[],
  isProfilePage: boolean = false
) => {
  const shape: Record<string, any> = {};
  const fieldParentChains: Record<
    string,
    { question: Question; chains: ParentChainItem[][] }
  > = {};

  const addQuestionToSchema = (
    question: Question,
    parentChain: ParentChainItem[] = []
  ) => {
    if (!fieldParentChains[question.field]) {
      fieldParentChains[question.field] = { question, chains: [] };
    }
    fieldParentChains[question.field].chains.push([...parentChain]);

    if (question.followup_question) {
      Object.entries(question.followup_question).forEach(
        ([parentValue, followupQuestion]) => {
          addQuestionToSchema(followupQuestion, [
            ...parentChain,
            { field: question.field, value: parentValue },
          ]);
        }
      );
    }
  };

  const processAllQuestions = (questions: Question[]) => {
    questions.forEach((question) => {
      addQuestionToSchema(question);
    });
  };

  processAllQuestions(questions);

  Object.entries(fieldParentChains).forEach(
    ([fieldName, { question, chains }]) => {
      let fieldSchema: any;
      if (question.type === "textarea" || question.type === "text") {
        fieldSchema = contentValidationSchema;
      } else if (question.type === "abn_lookup") {
        fieldSchema = yup
          .string()
          .transform((value: any) => {
            if (!value) {
              return undefined;
            }
            const digits = String(value).replace(/\D/g, "");
            return digits || undefined;
          })
          .matches(/^\d{11}$/, "ABN must contain 11 digits");
      } else if (question.type === "email") {
        fieldSchema = yup
          .string()
          .email("Please enter a valid email address")
          .matches(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
          );
      } else if (question.type === "location_geocode_lookup") {
        // Location is sent to a dedicated endpoint — accept string or object
        fieldSchema = yup.mixed().transform((value: any) => {
          if (value === "" || value === null || value === undefined) {
            return undefined;
          }
          return value;
        });
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
      } else if (
        question.type === "select" ||
        question.type === "taxonomy-select"
      ) {
        fieldSchema = yup.string().transform((value: any) => {
          if (value === "" || value === null || value === undefined) {
            return undefined;
          }
          // API may return an object — extract the code/value string
          if (typeof value === "object") {
            return value.value ?? value.code ?? value.id ?? undefined;
          }
          return value;
        });
      } else if (
        question.type === "multi-select" ||
        question.type === "taxonomy-multiselect"
      ) {
        fieldSchema = yup
          .array()
          // Normalize object items (e.g. { id, code, label }) to strings
          .transform((value: any) => {
            if (!Array.isArray(value)) return value;
            return value
              .map((v: any) => {
                if (typeof v === "string") return v;
                if (v && typeof v === "object") {
                  return v.value ?? v.code ?? v.id ?? null;
                }
                return null;
              })
              .filter(Boolean);
          })
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
          // Normalize object items to strings
          .transform((value: any) => {
            if (!Array.isArray(value)) return value;
            return value
              .map((v: any) => {
                if (typeof v === "string") return v;
                if (v && typeof v === "object") {
                  return v.value ?? v.code ?? v.id ?? null;
                }
                return null;
              })
              .filter(Boolean);
          })
          .of(yup.string())
          .transform((value: any) => {
            if (Array.isArray(value) && value.length === 0) {
              return undefined;
            }
            return value;
          });
      } else if (question.type === "checkbox-group") {
        const maxSelections = question.max_selection;
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
      } else if (
        question.type === "file" ||
        question.type === "file-image" ||
        question.type === "file-document"
      ) {
        fieldSchema = yup
          .mixed()
          .test(
            "fileOrUrl",
            "Invalid file format. Only URL or file is acceptable.",
            (value: any) => {
              if (!value) return true;
              if (typeof value === "string") return true;
              if (typeof File !== "undefined" && value instanceof File)
                return true;
              return false;
            }
          );
      } else if (question.type === "boolean-checkbox") {
        fieldSchema = yup.boolean().transform((value: any) => {
          if (value === "true" || value === true) return true;
          if (value === "false" || value === false) return false;
          return value;
        });
      } else if (question.type === "display") {
        fieldSchema = yup
          .mixed()
          .transform(() => undefined)
          .optional();
      } else if (question.type === "card-select") {
        const maxSelections = question.max_selection;
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

      if (chains.length > 0 && question.required) {
        const allParentFields = new Set<string>();
        chains.forEach((chain) => {
          chain.forEach((item) => allParentFields.add(item.field));
        });
        const whenFields = Array.from(allParentFields);

        const whenCondition = (...parentValues: any[]) => {
          return chains.some((chain) => {
            return chain.every((item, index) => {
              const fieldIndex = whenFields.indexOf(item.field);
              return parentValues[fieldIndex] === item.value;
            });
          });
        };

        fieldSchema = fieldSchema.when(whenFields, {
          is: whenCondition,
          then: (schema: any) => {
            if (
              question.type === "multi-select" ||
              question.type === "taxonomy-multiselect" ||
              question.type === "tag-select" ||
              (question.type === "checkbox-group" &&
                question.max_selection !== 1) ||
              (question.type === "card-select" && question.max_selection !== 1)
            ) {
              return schema
                .required("This field is required")
                .min(1, "This field is required")
                .test(
                  "not-empty-array",
                  "This field is required",
                  (value: any) => Array.isArray(value) && value.length > 0
                );
            } else if (question.type === "range") {
              return schema
                .required("This field is required")
                .test(
                  "is-range-required",
                  "This field is required",
                  (value: any) => typeof value === "number" && !isNaN(value)
                );
            } else if (
              question.type === "file" ||
              question.type === "file-image" ||
              question.type === "file-document"
            ) {
              if (!isProfilePage) {
                return schema.required("This field is required");
              }
            } else {
              return schema.required("This field is required");
            }
            return schema;
          },
          otherwise: (schema: any) => schema.notRequired(),
        });
      } else if (question.required) {
        if (
          question.type === "multi-select" ||
          question.type === "taxonomy-multiselect" ||
          question.type === "tag-select" ||
          (question.type === "checkbox-group" &&
            question.max_selection !== 1) ||
          (question.type === "card-select" && question.max_selection !== 1)
        ) {
          fieldSchema = fieldSchema
            .required("This field is required")
            .min(1, "This field is required")
            .test(
              "not-empty-array",
              "This field is required",
              (value: any) => Array.isArray(value) && value.length > 0
            );
        } else if (question.type === "range") {
          fieldSchema = fieldSchema
            .required("This field is required")
            .test(
              "is-range-required",
              "This field is required",
              (value: any) => typeof value === "number" && !isNaN(value)
            );
        } else if (
          question.type === "file" ||
          question.type === "file-image" ||
          question.type === "file-document"
        ) {
          if (!isProfilePage) {
            fieldSchema = fieldSchema.required("This field is required");
          }
        } else {
          fieldSchema = fieldSchema.required("This field is required");
        }
      }

      shape[fieldName] = fieldSchema;
    }
  );

  return yup.object().shape(shape);
};

// Shared bits
const emailSchema = yup
  .string()
  .required("Email is required")
  .email("Invalid email format")
  .matches(/^[^@]+@[^@]+\.[^@]+$/, "Invalid email format");

const passwordSchema = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters");

const confirmPasswordSchema = yup
  .string()
  .required("Please confirm your password")
  .oneOf([yup.ref("password")], "Passwords do not match");

export const loginValidationSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

const boolChecked = (msg: string) =>
  yup
    .boolean()
    .transform((v) => v === "on" || v === true)
    .oneOf([true], msg);

// Base for everyone (coordinator, etc.)
export const baseAuthSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirm_password: confirmPasswordSchema,
  privacy_policy: boolChecked("Privacy policy is required"),
});

// Student = base + student T&C
export const studentAuthValidationSchema = baseAuthSchema.shape({
  student_terms_and_conditions: boolChecked(
    "Terms and conditions are required"
  ),
});

// Organisation = base + org T&C + domain rule
export const organisationAuthValidationSchema = baseAuthSchema.shape({
  email: emailSchema.test(
    "disallowed-domain",
    "Please use a unique work email domain to sign up as an organisation.",
    (value) => !value || !isDisallowedDomain(value)
  ),
  organisation_terms_and_conditions: boolChecked(
    "Terms and conditions are required"
  ),
});

export const resetPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format")
    .matches(/^[^@]+@[^@]+\.[^@]+$/, "Invalid email format"),
});

export const passwordResetFormSchema = yup.object({
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Please enter new password"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm password"),
});

export const createFolderSchema: yup.ObjectSchema<{
  opportunity: string;
  name: string;
  description?: string;
}> = yup.object({
  opportunity: yup.string().required("Opportunity is required"),
  name: yup
    .string()
    .required("Folder name is required")
    .min(1, "Folder name cannot be empty"),
  description: yup.string().optional(),
});

export const changePasswordSchema = yup.object({
  old_password: yup.string().required("Old password is required"),
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirm_new_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm new password"),
});

export const emailContactValidationSchema = yup.object().shape({
  other_user_id: yup.number().required("Recipient is required"),
  subject: contentValidationSchema.default(""),
  message: contentValidationSchema
    .required("Message is required")
    .min(1, "Message cannot be empty"),
});
