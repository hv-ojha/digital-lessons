/**
 * Structured JSON schema for lesson content
 * This replaces the previous approach of generating full TypeScript/React components
 *
 * Benefits:
 * - 80-90% token reduction (200-500 tokens vs 2000-8000)
 * - No TypeScript validation needed
 * - Faster generation
 * - Easier to extend and maintain
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Common image data (can be base64 or URL)
 */
const ImageSchema = z.object({
  src: z.string().describe('Base64 data URI or URL'),
  alt: z.string().describe('Alt text for accessibility'),
});

export type ImageData = z.infer<typeof ImageSchema>;

// ============================================================================
// QUIZ LESSON
// ============================================================================

const QuizQuestionSchema = z.object({
  question: z.string().describe('The question text'),
  options: z.array(z.string()).min(2).max(6).describe('Answer options'),
  correctIndex: z.number().int().min(0).describe('Index of correct answer'),
  explanation: z.string().optional().describe('Explanation shown after answering'),
  image: ImageSchema.optional().describe('Optional image for the question'),
});

const QuizLessonSchema = z.object({
  type: z.literal('quiz'),
  title: z.string().describe('Lesson title'),
  description: z.string().optional().describe('Brief description of the quiz'),
  questions: z.array(QuizQuestionSchema).min(1).describe('Quiz questions'),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizLesson = z.infer<typeof QuizLessonSchema>;

// ============================================================================
// FLASHCARD LESSON
// ============================================================================

const FlashcardSchema = z.object({
  front: z.string().describe('Front of the card (question/term)'),
  back: z.string().describe('Back of the card (answer/definition)'),
  image: ImageSchema.optional().describe('Optional image'),
  hint: z.string().optional().describe('Optional hint'),
});

const FlashcardLessonSchema = z.object({
  type: z.literal('flashcard'),
  title: z.string().describe('Lesson title'),
  description: z.string().optional().describe('Brief description'),
  cards: z.array(FlashcardSchema).min(1).describe('Flashcards'),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;
export type FlashcardLesson = z.infer<typeof FlashcardLessonSchema>;

// ============================================================================
// MATH PRACTICE LESSON
// ============================================================================

const MathProblemSchema = z.object({
  question: z.string().describe('The math problem'),
  answer: z.union([z.number(), z.string()]).describe('Correct answer'),
  answerOptions: z.array(z.union([z.number(), z.string()])).min(3).max(9).describe('Multiple choice options'),
  hint: z.string().optional().describe('Optional hint'),
  explanation: z.string().optional().describe('Explanation of the solution'),
  image: ImageSchema.optional().describe('Optional diagram/visual'),
});

const MathPracticeLessonSchema = z.object({
  type: z.literal('math'),
  title: z.string().describe('Lesson title'),
  description: z.string().optional().describe('Brief description'),
  problems: z.array(MathProblemSchema).min(1).describe('Math problems'),
});

export type MathProblem = z.infer<typeof MathProblemSchema>;
export type MathPracticeLesson = z.infer<typeof MathPracticeLessonSchema>;

// ============================================================================
// READING/CONTENT LESSON
// ============================================================================

const ContentSectionSchema = z.object({
  heading: z.string().optional().describe('Section heading'),
  content: z.string().describe('The main content/text'),
  image: ImageSchema.optional().describe('Optional image'),
  callout: z.object({
    type: z.enum(['info', 'tip', 'warning', 'fun-fact']).describe('Callout type'),
    text: z.string().describe('Callout text'),
  }).optional().describe('Optional callout/highlight box'),
});

const ComprehensionQuestionSchema = z.object({
  question: z.string().describe('Comprehension question'),
  options: z.array(z.string()).min(2).max(4).describe('Answer options'),
  correctIndex: z.number().int().min(0).describe('Index of correct answer'),
});

const ReadingLessonSchema = z.object({
  type: z.literal('reading'),
  title: z.string().describe('Lesson title'),
  description: z.string().optional().describe('Brief description'),
  sections: z.array(ContentSectionSchema).min(1).describe('Content sections'),
  comprehensionQuestions: z.array(ComprehensionQuestionSchema).optional().describe('Optional comprehension questions'),
});

export type ContentSection = z.infer<typeof ContentSectionSchema>;
export type ComprehensionQuestion = z.infer<typeof ComprehensionQuestionSchema>;
export type ReadingLesson = z.infer<typeof ReadingLessonSchema>;

// ============================================================================
// INTERACTIVE ACTIVITY LESSON
// ============================================================================

const InteractionStepSchema = z.object({
  instruction: z.string().describe('What the user should do'),
  options: z.array(z.string()).min(2).describe('Interactive options/choices'),
  correctIndex: z.number().int().min(0).optional().describe('Correct choice (if applicable)'),
  feedback: z.object({
    correct: z.string().optional().describe('Feedback for correct answer'),
    incorrect: z.string().optional().describe('Feedback for incorrect answer'),
  }).optional(),
  image: ImageSchema.optional().describe('Optional visual'),
});

const InteractiveLessonSchema = z.object({
  type: z.literal('interactive'),
  title: z.string().describe('Lesson title'),
  description: z.string().optional().describe('Brief description'),
  steps: z.array(InteractionStepSchema).min(1).describe('Interactive steps'),
});

export type InteractionStep = z.infer<typeof InteractionStepSchema>;
export type InteractiveLesson = z.infer<typeof InteractiveLessonSchema>;

// ============================================================================
// MATCHING GAME LESSON
// ============================================================================

const MatchPairSchema = z.object({
  left: z.string().describe('Left item (term/question)'),
  right: z.string().describe('Right item (definition/answer)'),
  image: ImageSchema.optional().describe('Optional image for left or right'),
});

const MatchingLessonSchema = z.object({
  type: z.literal('matching'),
  title: z.string().describe('Lesson title'),
  description: z.string().optional().describe('Brief description'),
  pairs: z.array(MatchPairSchema).min(3).max(10).describe('Items to match'),
});

export type MatchPair = z.infer<typeof MatchPairSchema>;
export type MatchingLesson = z.infer<typeof MatchingLessonSchema>;

// ============================================================================
// UNION TYPE FOR ALL LESSON TYPES
// ============================================================================

export const LessonContentSchema = z.discriminatedUnion('type', [
  QuizLessonSchema,
  FlashcardLessonSchema,
  MathPracticeLessonSchema,
  ReadingLessonSchema,
  InteractiveLessonSchema,
  MatchingLessonSchema,
]);

export type LessonContent = z.infer<typeof LessonContentSchema>;

// ============================================================================
// VALIDATION HELPER
// ============================================================================

/**
 * Validate and parse lesson content JSON
 */
export function validateLessonContent(json: unknown): {
  isValid: boolean;
  data?: LessonContent;
  error?: string;
} {
  try {
    const data = LessonContentSchema.parse(json);
    return { isValid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isQuizLesson(content: LessonContent): content is QuizLesson {
  return content.type === 'quiz';
}

export function isFlashcardLesson(content: LessonContent): content is FlashcardLesson {
  return content.type === 'flashcard';
}

export function isMathLesson(content: LessonContent): content is MathPracticeLesson {
  return content.type === 'math';
}

export function isReadingLesson(content: LessonContent): content is ReadingLesson {
  return content.type === 'reading';
}

export function isInteractiveLesson(content: LessonContent): content is InteractiveLesson {
  return content.type === 'interactive';
}

export function isMatchingLesson(content: LessonContent): content is MatchingLesson {
  return content.type === 'matching';
}
