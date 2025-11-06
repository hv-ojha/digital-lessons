'use client';

import { createClient } from '@/lib/supabase/client';
import { Lesson } from '@/types/lesson';

/**
 * Browser-side: Subscribe to lesson changes (for real-time updates)
 *
 * OPTIMIZED VERSION:
 * - Only updates the specific lesson that changed (no full refetch)
 * - Handles INSERT, UPDATE, and DELETE events separately
 * - Significantly reduces unnecessary data fetching
 */
export function subscribeToLessonsChanges(
  callback: (updater: (prevLessons: Lesson[]) => Lesson[]) => void
) {
  const supabase = createClient();

  // Subscribe to realtime changes
  const channel = supabase
    .channel('lessons-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'lessons',
      },
      (payload) => {
        console.log('[Real-time] INSERT event:', payload.new);
        // Add the new lesson to the beginning of the list
        callback((prevLessons) => [payload.new as Lesson, ...prevLessons]);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'lessons',
      },
      (payload) => {
        console.log('[Real-time] UPDATE event:', payload.new);
        // Update only the changed lesson
        callback((prevLessons) =>
          prevLessons.map((lesson) =>
            lesson.id === (payload.new as Lesson).id
              ? (payload.new as Lesson)
              : lesson
          )
        );
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'lessons',
      },
      (payload) => {
        console.log('[Real-time] DELETE event:', payload.old);
        // Remove the deleted lesson
        callback((prevLessons) =>
          prevLessons.filter((lesson) => lesson.id !== (payload.old as Lesson).id)
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Browser-side: Subscribe to a specific lesson's changes
 */
export function subscribeToLessonChanges(
  lessonId: string,
  callback: (lesson: Lesson) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`lesson-${lessonId}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `id=eq.${lessonId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Lesson);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
