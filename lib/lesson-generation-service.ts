/**
 * Lesson Generation Service
 *
 * Provides a unified interface for lesson generation that works in both:
 * - Local development (synchronous execution)
 * - Production (asynchronous via Inngest)
 *
 * Uses JSON-based generation with flexible content blocks for optimal token usage.
 */

import { generateLessonJson } from '@/lib/ai/generator-json';
import { updateLessonStatus, updateLessonWithContent } from '@/lib/db/lessons-server';
import { inngest } from '@/lib/inngest/client';
import { shouldUseInngest } from '@/lib/execution-mode';

/**
 * Generate a lesson - automatically chooses sync or async execution
 *
 * @param lessonId - The lesson ID to generate content for
 * @param outline - The lesson outline/prompt
 * @returns Promise that resolves when generation is queued (async) or completed (sync)
 */
export async function generateLessonContent(
  lessonId: string,
  outline: string
): Promise<{ mode: 'sync' | 'async'; success?: boolean }> {
  if (shouldUseInngest()) {
    // Production: Use Inngest for async execution
    console.log(`📤 [ASYNC] Queuing lesson ${lessonId} for background generation via Inngest`);

    await inngest.send({
      name: 'lesson/generate.requested',
      data: {
        lessonId,
        outline,
      },
    });

    console.log(`✅ [ASYNC] Lesson ${lessonId} queued successfully`);

    return { mode: 'async' };
  } else {
    // Local development: Execute synchronously
    console.log(`⚡ [SYNC] Generating lesson ${lessonId} directly (local mode)`);
    console.log(`   Generator: JSON-based with flexible content`);

    try {
      // Generate using JSON-based approach
      const result = await generateLessonJson(outline);

      console.log(`📊 [SYNC] Generation completed:`, {
        success: result.success,
        title: result.title,
        contentLength: result.content?.length || 0,
      });

      // Update database with result
      if (result.success && result.content && result.title) {
        await updateLessonWithContent(
          lessonId,
          result.title,
          result.content,
          result.metadata?.lessonType,
          true // Always JSON-based now
        );

        console.log(`✅ [SYNC] Lesson ${lessonId} generated and saved successfully`);
        console.log(`   Title: "${result.title}"`);
        if (result.metadata?.lessonType) {
          console.log(`   Type: ${result.metadata.lessonType}`);
        }

        return { mode: 'sync', success: true };
      } else {
        // Generation failed
        const errorMessage = result.error || 'Generation failed';
        await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);

        console.error(`❌ [SYNC] Lesson ${lessonId} generation failed: ${errorMessage}`);

        return { mode: 'sync', success: false };
      }
    } catch (error) {
      console.error(`❌ [SYNC] Lesson ${lessonId} generation error:`, error);

      // Update database with error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);

      return { mode: 'sync', success: false };
    }
  }
}

/**
 * Get the current generation mode as a string
 */
export function getGenerationMode(): string {
  return shouldUseInngest() ? 'async (Inngest)' : 'sync (direct)';
}
