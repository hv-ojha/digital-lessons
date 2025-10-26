export type LessonStatus = 'generating' | 'completed' | 'failed';

export interface Lesson {
  id: string;
  title: string;
  outline: string;
  status: LessonStatus;
  content: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

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
}
