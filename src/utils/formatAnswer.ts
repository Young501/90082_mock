// Turn any stored answer into a display string
import { Question } from "@/types/onboarding";
import { parseQuestionnaireOptions } from "@/utils/questionnaireParser";

export function formatAnswerForDisplay(question: Question, answer: any): string {
    if (answer === null || answer === undefined || answer === "") {
      return "No answer provided";
    }
  
    // Options-based questions → map values to labels
    const isOptionsType = [
      "select",
      "multi-select",
      "tag-select",
      "checkbox-group",
      "card-select",
    ].includes(question.type);
  
    if (isOptionsType) {
      const map = buildOptionLabelMap(question);
  
      const toLabel = (val: any) => {
        const key = typeof val === "boolean" ? String(val) : String(val);
        return map.get(key) ?? String(val);
      };
  
      if (Array.isArray(answer)) {
        return answer.map(toLabel).join(", ");
      }
      return toLabel(answer);
    }
  
    // Boolean
    if (question.type === "boolean-checkbox") {
      // If you someday add custom yes/no labels on the question, prefer them here.
      return answer ? "Yes" : "No";
    }
  
    // Numbers / ranges (append unit if provided)
    if (
      question.type === "number" ||
      question.type === "range" ||
      typeof answer === "number"
    ) {
      const unit = question.unit ? ` ${question.unit}` : "";
      return `${answer}${unit}`;
    }
  
    // File fields — show a friendly filename if it looks like a URL
    if (question.type === "file") {
      try {
        const url = new URL(String(answer));
        const fileName = decodeURIComponent(url.pathname.split("/").pop() || "");
        return fileName || "Uploaded file";
      } catch {
        // not a URL, just show the raw value
        return String(answer);
      }
    }
  
    // Location/geocode answers may be an object (depends on your component wiring)
    if (question.type === "location_geocode_lookup") {
      if (typeof answer === "object" && answer) {
        return (
          (answer.label as string) ||
          (answer.formatted_address as string) ||
          (answer.description as string) ||
          JSON.stringify(answer)
        );
      }
      return String(answer);
    }
  
    // Text, email, url, textarea, etc.
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    return String(answer);
  }

  // Build a map of option value -> option label for a question
function buildOptionLabelMap(question: Question): Map<string, string> {
    const rawOptions = question.options || question.option || [];
    const parsed = parseQuestionnaireOptions(rawOptions);
    const pairs = parsed.map((opt: any) => {
      const label = opt.label || opt.value; // same shape you used in FieldRenderer
      return [String(opt.value), String(label)] as [string, string];
    });
    return new Map(pairs);
  }