'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types/lesson';
import { subscribeToLessonsChanges } from '@/lib/db/lessons-client';
import { LessonCard } from './lesson-card';
import { BookOpen } from 'lucide-react';

interface LessonTableProps {
  initialLessons: Lesson[];
  viewMode?: "kid" | "parent";
}

/**
 * Optimized Lesson Table Component with Memoization
 * - Uses memoized LessonCard components to prevent unnecessary re-renders
 * - Implements useCallback hooks for stable function references
 * - Only re-renders cards that have changed
 */
export function LessonTable({ initialLessons, viewMode = "kid" }: LessonTableProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Subscribe to real-time updates (optimized - no full refetch)
    const unsubscribe = subscribeToLessonsChanges((updater) => {
      setLessons((prevLessons) => {
        const updatedLessons = updater(prevLessons);

        // Clear retrying state for lessons that have completed or failed again
        setRetryingIds((prev) => {
          const newSet = new Set(prev);
          updatedLessons.forEach((lesson) => {
            if (lesson.status !== 'generating' && newSet.has(lesson.id)) {
              newSet.delete(lesson.id);
            }
          });
          return newSet;
        });

        return updatedLessons;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Memoized callback for retry - won't be recreated unless dependencies change
  const handleRetry = useCallback(async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click

    setRetryingIds((prev) => new Set(prev).add(lessonId));

    try {
      const response = await fetch(`/api/lessons/${lessonId}/retry`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retry');
      }

      // Real-time updates will handle the UI update
    } catch (error) {
      console.error('Retry error:', error);
      alert(error instanceof Error ? error.message : 'Failed to retry lesson generation');
      setRetryingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
    }
  }, []);

  // Memoized callback for row click - won't be recreated unless dependencies change
  const handleRowClick = useCallback((lesson: Lesson) => {
    if (lesson.status === 'completed') {
      setLoadingLessonId(lesson.id);
      router.push(`/lessons/${lesson.id}`);
    }
  }, [router]);

  // Empty state - Clean and Professional
  if (lessons.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            No lessons yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first AI-powered lesson. Click the "Create New Lesson" button in the top navigation.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>Look for the button at the top</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header - Clean and Simple */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Lessons</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} total
          </p>
        </div>

        {/* Stats Badges - Simplified */}
        {lessons.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {lessons.filter(l => l.status === 'completed').length} Ready
              </span>
            </div>
            {lessons.filter(l => l.status === 'generating').length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {lessons.filter(l => l.status === 'generating').length} Creating
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards Grid - Using Memoized LessonCard Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            isRetrying={retryingIds.has(lesson.id)}
            isLoading={loadingLessonId === lesson.id}
            onRetry={handleRetry}
            onRowClick={handleRowClick}
            animationDelay={index * 0.1}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
