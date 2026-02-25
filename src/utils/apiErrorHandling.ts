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

export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (!error || typeof error !== "object") {
    return defaultMessage;
  }

  const e = error as {
    message?: string;
    response?: { data?: Record<string, unknown> };
  };

  if (!e?.response?.data) {
    return e?.message || defaultMessage;
  }

  const data = e.response.data as Record<string, unknown>;

  if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
    return String(data.non_field_errors[0]);
  }

  if (data.error) {
    return String(data.error);
  }

  if (data.detail) {
    return Array.isArray(data.detail) ? String(data.detail[0]) : String(data.detail);
  }

  if (data.message) {
    return String(data.message);
  }

  if (data.password && Array.isArray(data.password)) {
    return String(data.password[0]);
  }

  if (data.email && Array.isArray(data.email)) {
    return String(data.email[0]);
  }

  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    if (firstKey && data[firstKey]) {
      const value = data[firstKey];
      return Array.isArray(value) ? String(value[0]) : String(value);
    }
  }

  return defaultMessage;
}

/**
 * Extract a success message from API response.
 */
export function getSuccessMessage(
  response: { message?: string; data?: { detail?: string }; detail?: string },
  defaultMessage: string
): string {
  return (
    response?.message ||
    response?.data?.detail ||
    response?.detail ||
    defaultMessage
  );
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
