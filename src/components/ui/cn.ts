import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and optimizes them with tailwind-merge
 * This is a utility function for handling Tailwind CSS class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
