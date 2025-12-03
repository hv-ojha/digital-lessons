'use client';

/**
 * Dynamic JSON Lesson Renderer
 *
 * Renders lessons based on structured JSON instead of executing generated code.
 * This provides:
 * - Better performance (with code-splitting)
 * - Easier maintenance
 * - Consistent UI/UX
 * - No code execution risks
 *
 * Performance Optimization:
 * - Uses React.lazy() for code-splitting
 * - Only loads the specific renderer component needed for each lesson type
 * - Reduces initial bundle size significantly
 */

import { lazy, Suspense } from 'react';
import {
  LessonContent,
  isQuizLesson,
  isFlashcardLesson,
  isMathLesson,
  isReadingLesson,
  isInteractiveLesson,
  isMatchingLesson,
} from '@/types/lesson-content';
import {
  FlexibleLesson,
  isFlexibleLesson,
} from '@/types/lesson-content-v2';

// Lazy-load renderer components for code-splitting
const QuizRenderer = lazy(() => import('./renderers/quiz-renderer').then(m => ({ default: m.QuizRenderer })));
const FlashcardRenderer = lazy(() => import('./renderers/flashcard-renderer').then(m => ({ default: m.FlashcardRenderer })));
const MathRenderer = lazy(() => import('./renderers/math-renderer').then(m => ({ default: m.MathRenderer })));
const ReadingRenderer = lazy(() => import('./renderers/reading-renderer').then(m => ({ default: m.ReadingRenderer })));
const InteractiveRenderer = lazy(() => import('./renderers/interactive-renderer').then(m => ({ default: m.InteractiveRenderer })));
const MatchingRenderer = lazy(() => import('./renderers/matching-renderer').then(m => ({ default: m.MatchingRenderer })));
const FlexibleRenderer = lazy(() => import('./renderers/flexible-renderer').then(m => ({ default: m.FlexibleRenderer })));

// Minimal loading fallback - returns null to avoid double loader
// The route already has loading.tsx that shows while data fetches
// Code-splitting is nearly instant (few ms) so no loader needed here
function RendererLoadingFallback() {
  return null;
}

interface JsonLessonRendererProps {
  content: LessonContent | FlexibleLesson;
  title: string;
}

export function JsonLessonRenderer({ content, title }: JsonLessonRendererProps) {
  // Wrap each renderer in Suspense for lazy loading
  // Check for flexible content first (v2)
  if (isFlexibleLesson(content)) {
    return (
      <Suspense fallback={<RendererLoadingFallback />}>
        <FlexibleRenderer lesson={content} />
      </Suspense>
    );
  }

  // Render appropriate component based on lesson type (v1)
  if (isQuizLesson(content)) {
    return (
      <Suspense fallback={<RendererLoadingFallback />}>
        <QuizRenderer lesson={content} />
      </Suspense>
    );
  }

  if (isFlashcardLesson(content)) {
    return (
      <Suspense fallback={<RendererLoadingFallback />}>
        <FlashcardRenderer lesson={content} />
      </Suspense>
    );
  }

  if (isMathLesson(content)) {
    return (
      <Suspense fallback={<RendererLoadingFallback />}>
        <MathRenderer lesson={content} />
      </Suspense>
    );
  }

  if (isReadingLesson(content)) {
    return (
      <Suspense fallback={<RendererLoadingFallback />}>
        <ReadingRenderer lesson={content} />
      </Suspense>
    );
  }

  if (isInteractiveLesson(content)) {
    return (
      <Suspense fallback={<RendererLoadingFallback />}>
        <InteractiveRenderer lesson={content} />
      </Suspense>
    );
  }

  if (isMatchingLesson(content)) {
    return (
      <Suspense fallback={<RendererLoadingFallback />}>
        <MatchingRenderer lesson={content} />
      </Suspense>
    );
  }

  // Fallback for unknown types
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-2xl border-2 border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Unknown Lesson Type</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This lesson type is not supported yet.
        </p>
      </div>
    </div>
  );
}
