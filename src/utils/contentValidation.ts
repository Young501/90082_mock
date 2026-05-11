import filter from "leo-profanity";
import { SPAM_CAPS_THRESHOLD, SPAM_MAX_CONSECUTIVE_CHARS } from "./constants";

type ValidationResult =
  | { status: "success" }
  | { status: "error"; type: "profanity" }
  | { status: "error"; type: "spam-lowercase" }
  | { status: "error"; type: "spam-uppercase" }
  | { status: "error"; type: "link" };

// Rule 1: Lowercase ([a-z]) repeated SPAM_MAX_CONSECUTIVE_CHARS times
const lowercaseSpamRegex = new RegExp(
  `([a-z])\\1{${SPAM_MAX_CONSECUTIVE_CHARS - 1},}`
);

// Rule 2: Uppercase ([A-Z]) repeated SPAM_CAPS_THRESHOLD times
const uppercaseSpamRegex = new RegExp(
  `([A-Z])\\1{${SPAM_CAPS_THRESHOLD - 1},}`
);

// Rule 3: Detects URL-specific markers such as http, www, or a domain structure
//         Does not detect email
const linkRegex =
  /(?:https?:\/\/|www\.)[^\s<>{}|\\^~[\]`]+|(?<!@)\b[a-zA-Z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?\b/gi;

export function validateContent(text: string): ValidationResult {
  if (filter.check(text)) {
    return { status: "error", type: "profanity" };
  }

  if (lowercaseSpamRegex.test(text)) {
    return { status: "error", type: "spam-lowercase" };
  }

  if (uppercaseSpamRegex.test(text)) {
    return { status: "error", type: "spam-uppercase" };
  }

  if (linkRegex.test(text)) {
    return { status: "error", type: "link" };
  }

  return { status: "success" };
}
