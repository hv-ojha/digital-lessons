import { notFound } from 'next/navigation';
import { getLesson } from '@/lib/db/lessons-server';
import { JsonLessonRenderer } from '@/components/json-lesson-renderer';
import { validateLessonContent } from '@/types/lesson-content';
import { validateFlexibleLesson } from '@/types/lesson-content-v2';
import { LessonErrorBoundary } from '@/components/error-boundary';

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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-12 text-center max-w-2xl animate-bounce-in">
          {/* Sad Sparky */}
          <svg
            viewBox="0 0 200 200"
            className="w-32 h-32 mx-auto mb-6 animate-wiggle"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="sadStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
            </defs>
            <path
              d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
              fill="url(#sadStarGradient)"
              stroke="#DC2626"
              strokeWidth="3"
            />
            <circle cx="85" cy="85" r="8" fill="white" />
            <circle cx="115" cy="85" r="8" fill="white" />
            <circle cx="87" cy="87" r="4" fill="#1F2937" />
            <circle cx="117" cy="87" r="4" fill="#1F2937" />
            {/* Sad mouth */}
            <path
              d="M 80 115 Q 100 100 120 115"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          <h1 className="font-display text-4xl font-extrabold text-gray-800 mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            We encountered an issue while creating this lesson. Don&apos;t worry, let&apos;s try again!
          </p>
          {lesson.error_message && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-8">
              <p className="text-xs text-red-700 font-mono text-left overflow-x-auto">
                {lesson.error_message}
              </p>
            </div>
          )}
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-12 text-center max-w-2xl animate-bounce-in">
          {/* Thinking Sparky */}
          <svg
            viewBox="0 0 200 200"
            className="w-32 h-32 mx-auto mb-6 animate-float"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="thinkingStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path
              d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
              fill="url(#thinkingStarGradient)"
              stroke="#7C3AED"
              strokeWidth="3"
            />
            <circle cx="85" cy="85" r="8" fill="white" />
            <circle cx="115" cy="85" r="8" fill="white" />
            <circle cx="87" cy="87" r="4" fill="#1F2937" />
            <circle cx="117" cy="87" r="4" fill="#1F2937" />
            {/* Thinking mouth */}
            <path
              d="M 85 105 L 115 105"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Animated dots */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>

          <h1 className="font-display text-4xl font-extrabold gradient-text-magic mb-4">
            Creating Your Lesson!
          </h1>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Sparky is working hard to prepare your personalized lesson. This usually takes just a few moments!
          </p>

          {/* Estimated time */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8">
            <svg className="w-5 h-5 text-purple-600 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-semibold text-purple-800">Estimated time: 30-60 seconds</span>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
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
      return (
        <LessonErrorBoundary lessonId={lesson.id}>
          <JsonLessonRenderer content={flexibleValidation.data} title={lesson.title} />
        </LessonErrorBoundary>
      );
    }

    // Fallback to standard validation (v1)
    const validation = validateLessonContent(parsedContent);
    if (validation.isValid && validation.data) {
      return (
        <LessonErrorBoundary lessonId={lesson.id}>
          <JsonLessonRenderer content={validation.data} title={lesson.title} />
        </LessonErrorBoundary>
      );
    }

    // Both validations failed - show error
    console.error('Invalid lesson JSON (v1):', validation.error);
    console.error('Invalid lesson JSON (v2):', flexibleValidation.error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-12 text-center max-w-2xl animate-bounce-in">
          {/* Confused Sparky */}
          <svg
            viewBox="0 0 200 200"
            className="w-32 h-32 mx-auto mb-6 animate-wiggle"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="confusedStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <path
              d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
              fill="url(#confusedStarGradient)"
              stroke="#DC2626"
              strokeWidth="3"
            />
            <circle cx="80" cy="85" r="8" fill="white" />
            <circle cx="120" cy="85" r="8" fill="white" />
            <circle cx="82" cy="87" r="4" fill="#1F2937" />
            <circle cx="122" cy="87" r="4" fill="#1F2937" />
            <path d="M 85 105 Q 100 110 115 105" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
          <h1 className="font-display text-4xl font-extrabold text-gray-800 mb-4">Invalid Lesson Data</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            This lesson could not be displayed due to invalid data.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    // JSON parsing failed
    console.error('Failed to parse lesson JSON:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-12 text-center max-w-2xl animate-bounce-in">
          {/* Confused Sparky */}
          <svg
            viewBox="0 0 200 200"
            className="w-32 h-32 mx-auto mb-6 animate-wiggle"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="errorStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <path
              d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
              fill="url(#errorStarGradient)"
              stroke="#DC2626"
              strokeWidth="3"
            />
            <circle cx="80" cy="85" r="8" fill="white" />
            <circle cx="120" cy="85" r="8" fill="white" />
            <circle cx="82" cy="87" r="4" fill="#1F2937" />
            <circle cx="122" cy="87" r="4" fill="#1F2937" />
            <path d="M 85 105 Q 100 110 115 105" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
          <h1 className="font-display text-4xl font-extrabold text-gray-800 mb-4">Error Loading Lesson</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            This lesson could not be displayed due to a parsing error.
          </p>
        </div>
      </div>
    );
  }
}
