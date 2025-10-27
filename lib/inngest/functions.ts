/**
 * Inngest Background Functions
 *
 * These functions run in the background, independent of Vercel's
 * serverless function timeout limits.
 *
 * Benefits:
 * - No timeout errors (can run up to 5 minutes)
 * - Automatic retries on failure
 * - Full observability in Inngest dashboard
 * - LangSmith tracing still works!
 */

import { inngest } from './client';
import { generateLesson } from '@/lib/ai/generator';
import { updateLessonStatus } from '@/lib/db/lessons-server';

/**
 * Background function to generate lesson content
 *
 * Triggered by: "lesson/generate.requested" event
 *
 * Steps:
 * 1. Generate AI content (with LangSmith tracing)
 * 2. Update database with result
 *
 * Retries: 2 automatic retries on failure
 */
export const generateLessonFunction = inngest.createFunction(
  {
    id: 'generate-lesson',
    name: 'Generate Lesson Content',
    retries: 2, // Retry up to 2 times on failure
  },
  { event: 'lesson/generate.requested' },
  async ({ event, step }) => {
    const { lessonId, outline } = event.data;

    console.log(`\n🎯 [INNGEST] Starting lesson generation for ${lessonId}`);
    console.log(`📋 [INNGEST] Outline: "${outline}"`);

    // Step 1: Generate lesson content using AI
    // LangSmith will trace all AI calls here!
    const result = await step.run('generate-ai-content', async () => {
      console.log(`🤖 [INNGEST] Calling AI to generate lesson...`);

      try {
        const generationResult = await generateLesson(outline);

        console.log(`✅ [INNGEST] AI generation completed:`, {
          success: generationResult.success,
          hasContent: !!generationResult.content,
          contentLength: generationResult.content?.length || 0,
          error: generationResult.error,
        });

        return generationResult;
      } catch (error) {
        console.error(`❌ [INNGEST] AI generation failed:`, error);
        throw error; // Inngest will retry
      }
    });

    // Step 2: Update database with result
    await step.run('update-database', async () => {
      console.log(`💾 [INNGEST] Updating database for lesson ${lessonId}...`);

      try {
        if (result.success && result.content) {
          await updateLessonStatus(lessonId, 'completed', result.content);
          console.log(`✅ [INNGEST] Database updated successfully`);
        } else {
          const errorMessage = result.error || 'Generation failed';
          await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);
          console.error(`❌ [INNGEST] Generation failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error(`❌ [INNGEST] Database update failed:`, error);
        throw error; // Inngest will retry
      }
    });

    console.log(`🎉 [INNGEST] Lesson ${lessonId} processing complete!`);

    return {
      lessonId,
      success: result.success,
      contentLength: result.content?.length || 0,
    };
  }
);

/**
 * Export all Inngest functions
 * Add new background functions to this array
 */
export const inngestFunctions = [generateLessonFunction];
