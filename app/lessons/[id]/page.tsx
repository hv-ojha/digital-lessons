import { notFound } from 'next/navigation';
import { getLesson } from '@/lib/db/lessons-server';
import { JsonLessonRenderer } from '@/components/json-lesson-renderer';
import { validateLessonContent } from '@/types/lesson-content';
import { validateFlexibleLesson } from '@/types/lesson-content-v2';
import { LessonErrorBoundary } from '@/components/error-boundary';
import type { Metadata } from 'next';
import { LessonSchema, BreadcrumbSchema } from '@/components/structured-data';

// Generate dynamic metadata for each lesson page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) {
    return {
      title: 'Lesson Not Found',
      description: 'The requested lesson could not be found.',
    };
  }

  const title = `${lesson.title} - Interactive Lesson`;
  const description = `Learn ${lesson.title} with Spark's AI-powered interactive lesson. Engaging content for Indian students with quizzes, games, and personalized learning.`;

  return {
    title,
    description,
    keywords: [
      lesson.title,
      "interactive lesson",
      "online learning India",
      "CBSE",
      "ICSE",
      "educational content",
      "AI learning",
      "student resources",
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: lesson.created_at,
      modifiedTime: lesson.updated_at,
      authors: ['Spark Education'],
      section: 'Education',
      tags: [lesson.title, 'interactive learning', 'education'],
      images: [
        {
          url: '/og-lesson-image.png',
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/twitter-lesson-image.png'],
    },
    alternates: {
      canonical: `/lessons/${id}`,
    },
  };
}

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-2xl border-2 border-gray-200 dark:border-gray-700">
          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            We encountered an issue while creating this lesson. Don&apos;t worry, let&apos;s try again!
          </p>
          {lesson.error_message && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4 mb-8 text-left">
              <p className="text-xs text-red-700 dark:text-red-300 font-mono overflow-x-auto">
                {lesson.error_message}
              </p>
            </div>
          )}
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-2xl border-2 border-gray-200 dark:border-gray-700">
          {/* Loading Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Creating Your Lesson!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Sparky is working hard to prepare your personalized lesson. This usually takes just a few moments!
          </p>

          {/* Estimated time */}
          <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-6 py-3 rounded-lg mb-8">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-purple-800 dark:text-purple-300">Estimated time: 30-60 seconds</span>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
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
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // Structured data for the lesson
    const structuredData = (
      <>
        <LessonSchema
          title={lesson.title}
          description={`Interactive lesson: ${lesson.title}`}
          url={`${baseUrl}/lessons/${lesson.id}`}
          datePublished={lesson.created_at}
          dateModified={lesson.updated_at}
        />
        <BreadcrumbSchema
          items={[
            { name: 'Home', url: baseUrl },
            { name: 'Lessons', url: `${baseUrl}/lessons` },
            { name: lesson.title, url: `${baseUrl}/lessons/${lesson.id}` },
          ]}
        />
      </>
    );

    // Try flexible validation first (v2)
    const flexibleValidation = validateFlexibleLesson(parsedContent);
    if (flexibleValidation.isValid && flexibleValidation.data) {
      return (
        <>
          {structuredData}
          <LessonErrorBoundary lessonId={lesson.id}>
            <JsonLessonRenderer content={flexibleValidation.data} title={lesson.title} />
          </LessonErrorBoundary>
        </>
      );
    }

    // Fallback to standard validation (v1)
    const validation = validateLessonContent(parsedContent);
    if (validation.isValid && validation.data) {
      return (
        <>
          {structuredData}
          <LessonErrorBoundary lessonId={lesson.id}>
            <JsonLessonRenderer content={validation.data} title={lesson.title} />
          </LessonErrorBoundary>
        </>
      );
    }

    // Both validations failed - show error
    console.error('Invalid lesson JSON (v1):', validation.error);
    console.error('Invalid lesson JSON (v2):', flexibleValidation.error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-2xl border-2 border-gray-200 dark:border-gray-700">
          {/* Warning Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Invalid Lesson Data</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            This lesson could not be displayed due to invalid data.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    // JSON parsing failed
    console.error('Failed to parse lesson JSON:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-2xl border-2 border-gray-200 dark:border-gray-700">
          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Error Loading Lesson</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            This lesson could not be displayed due to a parsing error.
          </p>
        </div>
      </div>
    );
  }
}
