import { toast } from 'sonner';

export type ErrorCategory = 'network' | 'auth' | 'validation' | 'server' | 'unknown';

export function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'network';
  }
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return 'network';
  }
  if ((error instanceof Error && error.message.includes('401')) || (error instanceof Error && error.message.includes('Unauthorized'))) {
    return 'auth';
  }
  if (error instanceof Error && (error.message.includes('validation') || error.message.includes('invalid'))) {
    return 'validation';
  }
  if (error instanceof Error && (error.message.includes('500') || error.message.includes('server'))) {
    return 'server';
  }
  return 'unknown';
}

export function getErrorMessage(error: unknown, defaultMessage: string = 'Something went wrong'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as any).message || defaultMessage;
  }
  return defaultMessage;
}

export function handleApiError(
  error: unknown,
  context: string = '',
  fallback: string = 'An unexpected error occurred'
): void {
  const category = categorizeError(error);
  let message = '';

  switch (category) {
    case 'network':
      message = 'Network error. Please check your connection and try again.';
      break;
    case 'auth':
      message = 'Session expired. Please log in again.';
      break;
    case 'validation':
      message = 'Invalid data provided. Please check your input.';
      break;
    case 'server':
      message = 'Server error. Please try again later.';
      break;
    default:
      message = getErrorMessage(error, fallback);
  }

  if (context) {
    message = `${context}: ${message}`;
  }

  console.error(`[API Error - ${category}] ${context}:`, error);
  toast.error(message);
}
