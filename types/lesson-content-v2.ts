/**
 * Enhanced Lesson Content Types - Supporting Creative & Diverse Learning
 *
 * This schema supports:
 * - Explanations & Tutorials
 * - Interactive Stories
 * - Visual Demonstrations
 * - Experiments & Activities
 * - Quizzes & Assessments
 * - Mixed-format lessons
 */

import { z } from 'zod';

// ============================================================================
// BASE COMPONENTS (Building Blocks)
// ============================================================================

const ImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

const VideoSchema = z.object({
  url: z.string().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
});

// Text block with formatting
const TextBlockSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
  style: z.enum(['paragraph', 'heading', 'subheading', 'highlight', 'quote']).optional(),
});

// Visual element (image/diagram)
const VisualBlockSchema = z.object({
  type: z.literal('visual'),
  image: ImageSchema.optional(),
  caption: z.string().optional(),
  description: z.string(),
});

// Interactive question
const QuestionBlockSchema = z.object({
  type: z.literal('question'),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctIndex: z.number().optional(),
  allowMultiple: z.boolean().optional(),
  explanation: z.string().optional(),
});

// Example or demonstration
const ExampleBlockSchema = z.object({
  type: z.literal('example'),
  title: z.string().optional(),
  content: z.string(),
  highlight: z.string().optional(),
});

// Activity or exercise
const ActivityBlockSchema = z.object({
  type: z.literal('activity'),
  instruction: z.string(),
  steps: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  tip: z.string().optional(),
});

// Key takeaway or summary
const TakeawayBlockSchema = z.object({
  type: z.literal('takeaway'),
  points: z.array(z.string()),
  style: z.enum(['list', 'boxes', 'checklist']).optional(),
});

// Story or narrative segment
const StoryBlockSchema = z.object({
  type: z.literal('story'),
  narrative: z.string(),
  character: z.string().optional(),
  image: ImageSchema.optional(),
});

// Callout box (tip, warning, fun fact, etc.)
const CalloutBlockSchema = z.object({
  type: z.literal('callout'),
  variant: z.enum(['tip', 'warning', 'fun-fact', 'remember', 'try-it']),
  title: z.string().optional(),
  content: z.string(),
});

// Union of all block types
const ContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  VisualBlockSchema,
  QuestionBlockSchema,
  ExampleBlockSchema,
  ActivityBlockSchema,
  TakeawayBlockSchema,
  StoryBlockSchema,
  CalloutBlockSchema,
]);

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// ============================================================================
// FLEXIBLE LESSON STRUCTURE
// ============================================================================

/**
 * Flexible lesson format - supports any combination of content blocks
 * Can be pure explanation, story, quiz, or anything in between
 */
const FlexibleLessonSchema = z.object({
  type: z.literal('flexible'),
  title: z.string(),
  description: z.string().optional(),
  format: z.enum([
    'explanation',      // Pure educational content
    'tutorial',         // Step-by-step how-to
    'story',           // Narrative-based learning
    'interactive',     // Mixed with activities
    'assessment',      // Quiz-focused
    'exploration',     // Discovery-based
    'mixed'           // Combination of above
  ]),
  sections: z.array(z.object({
    heading: z.string().optional(),
    blocks: z.array(ContentBlockSchema),
  })),
  conclusion: z.object({
    summary: z.string().optional(),
    nextSteps: z.array(z.string()).optional(),
  }).optional(),
});

export type FlexibleLesson = z.infer<typeof FlexibleLessonSchema>;

// ============================================================================
// LEGACY FORMATS (Keep for backward compatibility)
// ============================================================================

const QuizLessonSchema = z.object({
  type: z.literal('quiz'),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number(),
    explanation: z.string().optional(),
    image: ImageSchema.optional(),
  })),
});

const FlashcardLessonSchema = z.object({
  type: z.literal('flashcard'),
  title: z.string(),
  description: z.string().optional(),
  cards: z.array(z.object({
    front: z.string(),
    back: z.string(),
    hint: z.string().optional(),
    image: ImageSchema.optional(),
  })),
});

const MathPracticeLessonSchema = z.object({
  type: z.literal('math'),
  title: z.string(),
  description: z.string().optional(),
  problems: z.array(z.object({
    question: z.string(),
    answer: z.union([z.number(), z.string()]),
    answerOptions: z.array(z.union([z.number(), z.string()])),
    hint: z.string().optional(),
    explanation: z.string().optional(),
    image: ImageSchema.optional(),
  })),
});

export type QuizLesson = z.infer<typeof QuizLessonSchema>;
export type FlashcardLesson = z.infer<typeof FlashcardLessonSchema>;
export type MathPracticeLesson = z.infer<typeof MathPracticeLessonSchema>;

// ============================================================================
// MAIN SCHEMA (All Types)
// ============================================================================

export const LessonContentSchemaV2 = z.discriminatedUnion('type', [
  FlexibleLessonSchema,  // Primary format
  QuizLessonSchema,      // Keep for simple quizzes
  FlashcardLessonSchema, // Keep for flashcards
  MathPracticeLessonSchema, // Keep for math practice
]);

export type LessonContentV2 = z.infer<typeof LessonContentSchemaV2>;

// ============================================================================
// VALIDATION & TYPE GUARDS
// ============================================================================

export function validateLessonContentV2(json: unknown): {
  isValid: boolean;
  data?: LessonContentV2;
  error?: string;
} {
  try {
    const data = LessonContentSchemaV2.parse(json);
    return { isValid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

// Validate specifically for flexible lessons (alias for backward compatibility)
export function validateFlexibleLesson(json: unknown): {
  isValid: boolean;
  data?: FlexibleLesson | LessonContentV2;
  error?: string;
} {
  // First try to validate as flexible lesson
  try {
    const data = FlexibleLessonSchema.parse(json);
    return { isValid: true, data };
  } catch (flexError) {
    // If that fails, try full v2 schema (includes legacy types)
    try {
      const data = LessonContentSchemaV2.parse(json);
      return { isValid: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        };
      }
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }
}

export function isFlexibleLesson(content: any): content is FlexibleLesson {
  return content && content.type === 'flexible';
}

export function isQuizLesson(content: any): content is QuizLesson {
  return content && content.type === 'quiz';
}

export function isFlashcardLesson(content: any): content is FlashcardLesson {
  return content && content.type === 'flashcard';
}

export function isMathLesson(content: any): content is MathPracticeLesson {
  return content && content.type === 'math';
}
