'use client';

/**
 * Dynamic JSON Lesson Renderer
 *
 * Renders lessons based on structured JSON instead of executing generated code.
 * This provides:
 * - Better performance
 * - Easier maintenance
 * - Consistent UI/UX
 * - No code execution risks
 */

import { useState } from 'react';
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
import { QuizRenderer } from './renderers/quiz-renderer';
import { FlashcardRenderer } from './renderers/flashcard-renderer';
import { MathRenderer } from './renderers/math-renderer';
import { ReadingRenderer } from './renderers/reading-renderer';
import { InteractiveRenderer } from './renderers/interactive-renderer';
import { MatchingRenderer } from './renderers/matching-renderer';
import { FlexibleRenderer } from './renderers/flexible-renderer';

interface JsonLessonRendererProps {
  content: LessonContent | FlexibleLesson;
  title: string;
}

export function JsonLessonRenderer({ content, title }: JsonLessonRendererProps) {
  // Check for flexible content first (v2)
  if (isFlexibleLesson(content)) {
    return <FlexibleRenderer lesson={content} />;
  }

  // Render appropriate component based on lesson type (v1)
  if (isQuizLesson(content)) {
    return <QuizRenderer lesson={content} />;
  }

  if (isFlashcardLesson(content)) {
    return <FlashcardRenderer lesson={content} />;
  }

  if (isMathLesson(content)) {
    return <MathRenderer lesson={content} />;
  }

  if (isReadingLesson(content)) {
    return <ReadingRenderer lesson={content} />;
  }

  if (isInteractiveLesson(content)) {
    return <InteractiveRenderer lesson={content} />;
  }

  if (isMatchingLesson(content)) {
    return <MatchingRenderer lesson={content} />;
  }

  // Fallback for unknown types
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="card-elevated text-center max-w-2xl">
        <h1 className="text-heading-2 mb-4">Unknown Lesson Type</h1>
        <p className="text-body text-muted-foreground">
          This lesson type is not supported yet.
        </p>
      </div>
    </div>
  );
}
