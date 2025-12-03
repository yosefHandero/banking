/**
 * Utility functions for error handling
 */

/**
 * Safely extracts an error message from an unknown error type
 * @param error - The error to extract a message from
 * @param defaultMessage - Default message if error has no message
 * @returns The error message as a string
 */
export function getErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return defaultMessage;
}

/**
 * Checks if an error message indicates a specific type of error
 */
export function isErrorType(error: unknown, type: string): boolean {
  const message = getErrorMessage(error, '').toLowerCase();
  return message.includes(type.toLowerCase());
}

