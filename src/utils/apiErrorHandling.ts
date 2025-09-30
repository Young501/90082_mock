// API Error handling utilities
export interface ApiErrorResponse {
  status: number;
  data?: unknown;
}

export interface ApiError {
  response?: ApiErrorResponse;
}

// Type guard to check if error has response property
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response === "object" &&
    (error as any).response !== null
  );
}

// Get error status code safely
export function getErrorStatus(error: unknown): number | null {
  if (isApiError(error) && error.response) {
    return error.response.status || null;
  }
  return null;
}

// Get error data safely
export function getErrorData(error: unknown): unknown {
  if (isApiError(error) && error.response) {
    return error.response.data;
  }
  return null;
}

// Format validation error messages
export function formatValidationErrors(errorData: unknown): string {
  if (errorData && typeof errorData === "object") {
    const errorMessages = Object.values(errorData).flat().join(", ");
    return `Please correct the following: ${errorMessages}`;
  }
  return "Please check your answers and try again.";
}

// Handle enrollment-specific errors
export function getEnrollmentErrorMessage(error: unknown): string {
  const status = getErrorStatus(error);

  switch (status) {
    case 409:
      return "You have already enrolled in this opportunity.";
    case 403:
      return "You don't have permission to enroll in this opportunity. Please check if you have a valid private invite.";
    case 400:
      return formatValidationErrors(getErrorData(error));
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
