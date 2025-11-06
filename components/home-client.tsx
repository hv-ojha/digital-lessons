'use client';

import { useState, useCallback, useEffect } from 'react';
import { LessonForm } from '@/components/lesson-form';
import { LessonTable } from '@/components/lesson-table';
import { Lesson } from '@/types/lesson';

interface HomeClientProps {
  initialLessons: Lesson[];
}

/**
 * Client-side wrapper for interactive home page components
 * This allows the main page to be a Server Component
 *
 * Note: We use a mounted flag to prevent hydration mismatches
 * by ensuring the initial render matches the server
 */
export function HomeClient({ initialLessons }: HomeClientProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [mounted, setMounted] = useState(false);

  // Only set mounted on client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized callback to prevent unnecessary re-renders
  const handleLessonCreated = useCallback(async () => {
    // Refresh lessons list after creation
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  }, []);

  // Prevent hydration mismatch by rendering a simple loading state on server
  if (!mounted) {
    return (
      <div className="space-y-16">
        {/* Simple placeholder that matches server render */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 animate-pulse">
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Lesson Creation Form */}
      <div className="mb-16">
        <LessonForm onLessonCreated={handleLessonCreated} />
      </div>

      {/* Lessons Table */}
      <LessonTable initialLessons={lessons} />
    </>
  );
}
