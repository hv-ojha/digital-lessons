'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types/lesson';
import { subscribeToLessonsChanges } from '@/lib/db/lessons-client';
import { LessonCard } from './lesson-card';
import { BookOpen } from 'lucide-react';

interface LessonTableProps {
  initialLessons: Lesson[];
}

/**
 * Optimized Lesson Table Component with Memoization
 * - Uses memoized LessonCard components to prevent unnecessary re-renders
 * - Implements useCallback hooks for stable function references
 * - Only re-renders cards that have changed
 */
export function LessonTable({ initialLessons }: LessonTableProps) {
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

  // Empty state
  if (lessons.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-playful p-12 text-center animate-bounce-in">
        <div className="mb-6">
          <BookOpen className="w-32 h-32 mx-auto text-purple-300 animate-float" />
        </div>
        <h3 className="font-display text-3xl font-bold text-gray-800 mb-4">
          No Lessons Yet
        </h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          Create your first lesson above to get started on your amazing learning journey! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold gradient-text-magic mb-2">
          Your Learning Adventures
        </h2>
        <p className="text-lg text-gray-600">
          Click on any ready lesson to start learning! 🌟
        </p>
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
          />
        ))}
      </div>
    </div>
  );
}
