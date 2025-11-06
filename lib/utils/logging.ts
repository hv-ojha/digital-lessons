/**
 * Logging utilities to prevent massive content dumps in console
 */

import { Lesson } from '@/types/lesson';

/**
 * Sanitize lesson data for logging by truncating large content fields
 */
export function sanitizeLessonForLogging(lesson: Lesson): Record<string, any> {
  return {
    id: lesson.id,
    title: lesson.title,
    outline:
      lesson.outline.length > 100
        ? `${lesson.outline.substring(0, 100)}... [${lesson.outline.length} chars total]`
        : lesson.outline,
    status: lesson.status,
    content: lesson.content
      ? `[Content: ${lesson.content.length} chars]`
      : null,
    error_message: lesson.error_message
      ? lesson.error_message.length > 200
        ? `${lesson.error_message.substring(0, 200)}... [${lesson.error_message.length} chars total]`
        : lesson.error_message
      : null,
    created_at: lesson.created_at,
    updated_at: lesson.updated_at,
    lesson_type: lesson.lesson_type,
    is_json: lesson.is_json,
  };
}

/**
 * Sanitize an array of lessons for logging
 */
export function sanitizeLessonsForLogging(lessons: Lesson[]): Record<string, any>[] {
  return lessons.map(sanitizeLessonForLogging);
}

/**
 * Sanitize any object that might contain large content fields
 */
export function sanitizeForLogging(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item));
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Handle content fields
      if (key === 'content' && typeof value === 'string' && value.length > 500) {
        sanitized[key] = `[Content: ${value.length} chars]`;
      }
      // Handle error messages
      else if (key === 'error_message' && typeof value === 'string' && value.length > 200) {
        sanitized[key] = `${value.substring(0, 200)}... [${value.length} chars total]`;
      }
      // Handle outline/description fields
      else if (
        (key === 'outline' || key === 'description') &&
        typeof value === 'string' &&
        value.length > 100
      ) {
        sanitized[key] = `${value.substring(0, 100)}... [${value.length} chars total]`;
      }
      // Recursively sanitize nested objects
      else if (value && typeof value === 'object') {
        sanitized[key] = sanitizeForLogging(value);
      }
      // Keep other values as-is
      else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return obj;
}

/**
 * Safe console.log that automatically sanitizes large content
 */
export function safeLog(message: string, data?: any): void {
  if (data) {
    console.log(message, sanitizeForLogging(data));
  } else {
    console.log(message);
  }
}

/**
 * Safe console.error that automatically sanitizes large content
 */
export function safeError(message: string, data?: any): void {
  if (data) {
    console.error(message, sanitizeForLogging(data));
  } else {
    console.error(message);
  }
}

/**
 * Safe console.warn that automatically sanitizes large content
 */
export function safeWarn(message: string, data?: any): void {
  if (data) {
    console.warn(message, sanitizeForLogging(data));
  } else {
    console.warn(message);
  }
}
