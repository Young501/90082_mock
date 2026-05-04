import filter from "leo-profanity";

export function validateContent(text: string) {
  return filter.check(text);
}