// =============================================
// ============== CODEX UTILS =================
// =============================================
// Utility functions for C.H.A.O.S.
// Common helpers used throughout the application

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Combines multiple class names and resolves Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to relative time
 * e.g., "5 minutes ago", "2 hours ago", "Yesterday", etc.
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const pastDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  // Format as date for older dates
  return pastDate.toLocaleDateString();
}

/**
 * Get initials from name
 * Returns the first letter of first and last name
 */
export function getInitials(name: string): string {
  const parts = name.split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Truncate text with ellipsis
 * Limits text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Generate random pastel color based on string
 * Useful for generating consistent avatar colors
 */
export function generatePastelColor(input: string): string {
  // Generate a hash from the input string
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate lighter pastel colors
  const h = hash % 360;
  const s = 60 + (hash % 20); // 60-80% saturation
  const l = 75 + (hash % 15); // 75-90% lightness
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}
