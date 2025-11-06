import { createClient } from '@/lib/supabase/server';
import { Lesson, LessonStatus, LessonSchema, LessonsArraySchema } from '@/types/lesson';
import { sanitizeLessonForLogging, safeError } from '@/lib/utils/logging';

/**
 * Server-side: Create a new lesson with 'generating' status
 *
 * IMPROVED: Now validates response data with Zod schema
 */
export async function createLesson(title: string, outline: string): Promise<Lesson> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      title,
      outline,
      status: 'generating' as LessonStatus,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lesson: ${error.message}`);
  }

  // Validate response data with Zod schema
  try {
    return LessonSchema.parse(data);
  } catch (validationError) {
    console.error('[DB] Lesson validation failed:', validationError);
    throw new Error(
      `Database returned invalid lesson data: ${
        validationError instanceof Error ? validationError.message : 'Unknown validation error'
      }`
    );
  }
}

/**
 * Server-side: Get a lesson by ID
 *
 * IMPROVED: Now validates response data with Zod schema
 */
export async function getLesson(id: string): Promise<Lesson | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to get lesson: ${error.message}`);
  }

  // Validate response data with Zod schema
  try {
    return LessonSchema.parse(data);
  } catch (validationError) {
    console.error('[DB] Lesson validation failed:', validationError);
    throw new Error(
      `Database returned invalid lesson data: ${
        validationError instanceof Error ? validationError.message : 'Unknown validation error'
      }`
    );
  }
}

/**
 * Server-side: Get all lessons ordered by creation date
 *
 * IMPROVED: Now validates response data with Zod schema
 */
export async function getAllLessons(): Promise<Lesson[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB] Error fetching lessons');
    console.error('[DB] Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    // Return empty array instead of throwing to prevent API crashes
    console.warn('[DB] Returning empty array due to database error');
    return [];
  }

  // Handle null/undefined data
  if (!data) {
    console.warn('[DB] No data returned from database, returning empty array');
    return [];
  }

  // Validate response data with Zod schema
  try {
    return LessonsArraySchema.parse(data);
  } catch (validationError) {
    console.error('[DB] Lessons array validation failed:', validationError);

    // Log sanitized data to avoid massive HTML dumps
    if (Array.isArray(data)) {
      const sanitizedData = data.map(lesson => sanitizeLessonForLogging(lesson));
      console.error('[DB] Raw data that failed validation (content sanitized):',
        JSON.stringify(sanitizedData, null, 2));
    }

    // In development, provide detailed error; in production, return empty array
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[DB] Database returned invalid lessons data: ${
          validationError instanceof Error ? validationError.message : 'Unknown validation error'
        }`
      );
    }

    // Return empty array instead of throwing to prevent crashes
    console.error('[DB] Returning empty array due to validation failure');
    return [];
  }
}

/**
 * Server-side: Update lesson status and content
 */
export async function updateLessonStatus(
  id: string,
  status: LessonStatus,
  content?: string,
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient();

  const updateData: Partial<Lesson> = { status };
  if (content !== undefined) updateData.content = content;
  if (errorMessage !== undefined) updateData.error_message = errorMessage;

  const { error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update lesson: ${error.message}`);
  }
}

/**
 * Server-side: Update lesson with generated content (title + code)
 */
export async function updateLessonWithContent(
  id: string,
  title: string,
  content: string,
  lessonType?: string,
  isJson?: boolean
): Promise<void> {
  const supabase = await createClient();

  const updateData: Partial<Lesson> = {
    title,
    content,
    status: 'completed' as LessonStatus,
  };

  if (lessonType !== undefined) updateData.lesson_type = lessonType;
  if (isJson !== undefined) updateData.is_json = isJson;

  const { error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update lesson with content: ${error.message}`);
  }
}
