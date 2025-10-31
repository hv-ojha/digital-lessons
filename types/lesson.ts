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
  lesson_type?: string | null; // 'quiz', 'flashcard', 'math', 'reading', 'interactive', 'matching'
  is_json?: boolean; // true for new JSON-based lessons, false/null for old code-based lessons
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
  metadata?: {
    lessonType?: string;
    approach?: string;
    generatedAt?: string;
  };
}
