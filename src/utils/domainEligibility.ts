/**
 * Utility functions for checking student email domain eligibility
 */

/**
 * Extracts the domain from an email address
 * @param email - The email address to extract domain from
 * @returns The domain part of the email (lowercase and trimmed), or null if email is invalid
 */
export const extractEmailDomain = (email: string): string | null => {
  // Use regex to ensure exactly one '@' and extract the domain part
  const match = email.toLowerCase().trim().match(/^[^@]+@([^@]+)$/);
  return match ? match[1] : null;
};

/**
 * Checks if a student's email domain is eligible for an opportunity
 * @param userEmail - The student's email address
 * @param allowedDomains - Array of allowed email domains (case-insensitive)
 * @returns true if eligible, false if not
 */
export const isStudentEligibleForOpportunity = (
  userEmail: string,
  allowedDomains: string[]
): boolean => {
  // If no restrictions (empty array), allow access
  if (!allowedDomains || allowedDomains.length === 0) {
    return true;
  }

  const userDomain = extractEmailDomain(userEmail);
  if (userDomain === null) {
    return false;
  }

  // Check for exact or subdomain matches (case-insensitive)
  return allowedDomains.some(allowedDomain => {
    const normalizedAllowedDomain = allowedDomain.toLowerCase().trim();
    
    // Exact match
    if (userDomain === normalizedAllowedDomain) {
      return true;
    }
    
    // Subdomain match (user domain ends with .allowedDomain)
    if (userDomain.endsWith(`.${normalizedAllowedDomain}`)) {
      return true;
    }
    
    return false;
  });
};