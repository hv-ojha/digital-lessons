import { z } from 'zod';

export type LessonStatus = 'generating' | 'completed' | 'failed';

/**
 * Zod schema for runtime validation of Lesson data from database
 * Protects against database schema changes and invalid data
 */
export const LessonSchema = z.object({
  id: z.string().uuid('Invalid lesson ID format'),
  title: z.string().min(1, 'Title is required'),
  outline: z.string().min(1, 'Outline is required'),
  status: z.enum(['generating', 'completed', 'failed'], {
    errorMap: () => ({ message: 'Invalid lesson status' }),
  }),
  content: z.string().nullable(),
  error_message: z.string().nullable(),
  // Supabase returns timestamps as ISO strings, accept any string format
  created_at: z.string(),
  updated_at: z.string(),
  lesson_type: z.string().nullable().optional(),
  is_json: z.boolean().nullable().optional(),
});

/**
 * TypeScript type inferred from Zod schema
 * Ensures type and schema stay in sync
 */
export type Lesson = z.infer<typeof LessonSchema>;

/**
 * Array of lessons schema for validating multiple lessons
 */
export const LessonsArraySchema = z.array(LessonSchema);

export interface CreateLessonRequest {
  outline: string;
}

export interface CreateLessonResponse {
  id: string;
  title: string;
  status: LessonStatus;
}

export interface LessonGenerationResult {
  success: boolean;
  title: string;
  content?: string;
  error?: string;
  metadata?: {
    lessonType?: string;
    approach?: string;
    generatedAt?: string;
  };
}
