import { notFound } from 'next/navigation';
import { getLesson } from '@/lib/db/lessons-server';
import { JsonLessonRenderer } from '@/components/json-lesson-renderer';
import { validateLessonContent } from '@/types/lesson-content';
import { validateFlexibleLesson } from '@/types/lesson-content-v2';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) {
    notFound();
  }

  // Check for failed status first
  if (lesson.status === 'failed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="card-elevated text-center max-w-2xl animate-fade-in">
          <svg className="w-20 h-20 mx-auto mb-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-heading-2 mb-4">
            Lesson Creation Failed
          </h1>
          <p className="text-body text-muted-foreground mb-6">
            We encountered an issue while creating this lesson. Please try again.
          </p>
          {lesson.error_message && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-8">
              <p className="text-xs text-destructive font-mono text-left overflow-x-auto">
                {lesson.error_message}
              </p>
            </div>
          )}
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Try Creating Another Lesson
          </a>
        </div>
      </div>
    );
  }

  // Check if still generating or no content
  if (lesson.status !== 'completed' || !lesson.content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="card-elevated text-center max-w-2xl animate-fade-in">
          <svg className="w-20 h-20 mx-auto mb-6 text-warning animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h1 className="text-heading-2 mb-4">
            Creating Your Lesson
          </h1>
          <p className="text-body text-muted-foreground mb-8">
            Please wait while our AI prepares your personalized lesson. This usually takes a few moments.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Parse and render JSON-based lesson
  try {
    const parsedContent = JSON.parse(lesson.content);

    // Try flexible validation first (v2)
    const flexibleValidation = validateFlexibleLesson(parsedContent);
    if (flexibleValidation.isValid && flexibleValidation.data) {
      return <JsonLessonRenderer content={flexibleValidation.data} title={lesson.title} />;
    }

    // Fallback to standard validation (v1)
    const validation = validateLessonContent(parsedContent);
    if (validation.isValid && validation.data) {
      return <JsonLessonRenderer content={validation.data} title={lesson.title} />;
    }

    // Both validations failed - show error
    console.error('Invalid lesson JSON (v1):', validation.error);
    console.error('Invalid lesson JSON (v2):', flexibleValidation.error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="card-elevated text-center max-w-2xl">
          <h1 className="text-heading-2 mb-4">Invalid Lesson Data</h1>
          <p className="text-body text-muted-foreground">
            This lesson could not be displayed due to invalid data.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    // JSON parsing failed
    console.error('Failed to parse lesson JSON:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="card-elevated text-center max-w-2xl">
          <h1 className="text-heading-2 mb-4">Error Loading Lesson</h1>
          <p className="text-body text-muted-foreground">
            This lesson could not be displayed due to a parsing error.
          </p>
        </div>
      </div>
    );
  }
}
