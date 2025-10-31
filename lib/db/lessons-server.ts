import { createClient } from '@/lib/supabase/server';
import { Lesson, LessonStatus } from '@/types/lesson';

/**
 * Server-side: Create a new lesson with 'generating' status
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

  return data as Lesson;
}

/**
 * Server-side: Get a lesson by ID
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

  return data as Lesson;
}

/**
 * Server-side: Get all lessons ordered by creation date
 */
export async function getAllLessons(): Promise<Lesson[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get lessons: ${error.message}`);
  }

  return (data as Lesson[]) || [];
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
