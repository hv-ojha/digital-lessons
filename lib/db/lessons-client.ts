'use client';

import { createClient } from '@/lib/supabase/client';
import { Lesson } from '@/types/lesson';

/**
 * Browser-side: Subscribe to lesson changes (for real-time updates)
 */
export function subscribeToLessonsChanges(
  callback: (lessons: Lesson[]) => void
) {
  const supabase = createClient();

  // Subscribe to realtime changes
  const channel = supabase
    .channel('lessons-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lessons',
      },
      () => {
        // Fetch updated data when any change occurs
        supabase
          .from('lessons')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) {
              callback(data as Lesson[]);
            }
          });
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
