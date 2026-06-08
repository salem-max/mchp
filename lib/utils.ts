import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { categorizeError, getErrorMessage, handleApiError } from './errorHandler';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
