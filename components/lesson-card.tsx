'use client';

import { memo } from 'react';
import { Lesson } from '@/types/lesson';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  isRetrying: boolean;
  isLoading: boolean;
  onRetry: (lessonId: string, event: React.MouseEvent) => void;
  onRowClick: (lesson: Lesson) => void;
  animationDelay: number;
  viewMode?: "kid" | "parent";
}

/**
 * Clean Lesson Card Component - Following UX Best Practices
 * - Simple border-based card design
 * - Clear visual hierarchy
 * - Minimal use of gradients (buttons and icon only)
 * - Content-focused design
 */
export const LessonCard = memo<LessonCardProps>(({
  lesson,
  isRetrying,
  isLoading,
  onRetry,
  onRowClick,
  animationDelay,
  viewMode = "kid"
}) => {
  const isClickable = lesson.status === 'completed';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg' : 'cursor-default'
      } ${isLoading ? 'relative' : ''}`}
      onClick={() => isClickable && !isLoading && onRowClick(lesson)}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-3" />
          <p className="text-lg font-semibold text-purple-700 dark:text-purple-400">Loading Lesson...</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get ready!</p>
        </div>
      )}

      {/* Header with Icon - Clean Design */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 flex items-center justify-center border-b-2 border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
            {lesson.title}
          </h3>

          {/* Description/Outline */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 min-h-[4.5rem]">
            {lesson.outline || 'An exciting learning adventure awaits!'}
          </p>

          {/* Status Badge & Date */}
          <div className="flex items-center justify-between gap-3">
            {lesson.status === 'generating' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </span>
            )}
            {lesson.status === 'completed' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm font-medium text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                Ready!
              </span>
            )}
            {lesson.status === 'failed' && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm font-medium text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                Failed
              </span>
            )}

            {/* Date */}
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(lesson.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Action Button or Retry */}
          {lesson.status === 'completed' && (
            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Learning
            </button>
          )}

          {lesson.status === 'generating' && (
            <div className="py-3 text-center">
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Sparky is creating your lesson...</p>
            </div>
          )}

          {lesson.status === 'failed' && (
            <div className="space-y-2">
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => onRetry(lesson.id, e)}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </>
                )}
              </button>
              {lesson.error_message && (
                <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border-l-4 border-red-500">
                  {lesson.error_message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

LessonCard.displayName = 'LessonCard';
