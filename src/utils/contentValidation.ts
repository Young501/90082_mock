import filter from "leo-profanity";
import { SPAM_CAPS_THRESHOLD, SPAM_MAX_CONSECUTIVE_CHARS } from "./constants";

type ValidationResult =
  | { status: "success" }
  | { status: "error", type: "profanity" }
  | { status: "error", type: "spam-lowercase" }
  | { status: "error", type: "spam-uppercase" }
  | { status: "error", type: "link" };

export function validateContent(text: string): ValidationResult {
  if (filter.check(text)) {
    return { status: "error", type: "profanity" }
  }

  // Rule 1: Lowercase ([a-z]) repeated SPAM_MAX_CONSECUTIVE_CHARS times
  // Rule 2: Uppercase ([A-Z]) repeated SPAM_CAPS_THRESHOLD time
  const lowercaseRegex = `([a-z])\\1{${SPAM_MAX_CONSECUTIVE_CHARS - 1},}`;
  const uppercaseRegex = `([A-Z])\\2{${SPAM_CAPS_THRESHOLD - 1},}`;
  const spamRegex = new RegExp(`${lowercaseRegex}|${uppercaseRegex}`, "g")

  const matches = text.matchAll(spamRegex);
  for (const match of matches) {
    // match[1] is the lowercase capture group
    if (match[1] !== undefined) {
      return { status: "error", type: "spam-lowercase" }
    }

    // match[2] is the uppercase capture group
    if (match[2] !== undefined) {
      return { status: "error", type: "spam-uppercase" }
    }
  }

  // Detects URL-specific markers such as http, www, or a domain structure 
  // Does not detect email
  const linkRegex = /(?:https?:\/\/|www\.)[^\s<>{}|\\^~[\]`]+|(?<!@)\b[a-zA-Z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?\b/gi;
  if (linkRegex.test(text)) {
    return { status: "error", type: "link" };
  }

  return { status: "success" };
}