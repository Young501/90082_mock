import filter from "leo-profanity";
import { SPAM_MAX_CONSECUTIVE_CHARS } from "./constants";

type ValidationResult =
  | { status: "success" }
  | { status: "error"; type: "profanity" }
  | { status: "error"; type: "spam" };

const consecutiveCharsRegex = new RegExp(
  `([a-zA-Z])\\1{${SPAM_MAX_CONSECUTIVE_CHARS - 1},}`,
  "i"
);

export function getContentValidationMessage(
  type: "profanity" | "spam"
): string {
  switch (type) {
    case "profanity":
      return "Please keep your language appropriate";
    case "spam":
      return "Please avoid repeating the same character";
  }
}

export function validateContent(text: string): ValidationResult {
  if (filter.check(text)) {
    return { status: "error", type: "profanity" };
  }

  if (consecutiveCharsRegex.test(text)) {
    return { status: "error", type: "spam" };
  }

  return { status: "success" };
}
