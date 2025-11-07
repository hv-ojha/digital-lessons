'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  description?: string;
  progress?: {
    current: number;
    total: number;
  };
  score?: number;
}

/**
 * Clean Lesson Header Component - Following UX Best Practices
 * - Simple border-based card design
 * - Clear visual hierarchy
 * - Minimal gradients (only for brand icon)
 * - Content-focused design
 */
export function LessonHeader({ title, description, progress, score }: LessonHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  const isComplete = progress && progress.current === progress.total;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8">
      <div className="flex flex-col gap-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="self-start inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:-translate-x-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Lessons
        </button>

        {/* Title Section */}
        <div className="flex items-start gap-4">
          {/* Brand Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress Info */}
        {progress && (
          <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-lg px-6 py-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                {isComplete ? (
                  <span className="text-green-600 dark:text-green-400">Complete! 🎉</span>
                ) : (
                  `${progress.current} of ${progress.total} answered`
                )}
              </p>
            </div>
            {score !== undefined && (
              <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                <p className="text-base font-bold text-yellow-800 dark:text-yellow-300">
                  {score} points
                </p>
              </div>
            )}
          </div>
        )}

        {/* Score Badge (if no progress) */}
        {!progress && score !== undefined && (
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-lg font-bold self-start">
            <Star className="w-5 h-5 fill-yellow-600 dark:fill-yellow-400 text-yellow-600 dark:text-yellow-400" />
            <span>Score: {score}</span>
          </div>
        )}
      </div>
    </div>
  );
}
