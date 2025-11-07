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
 *
 * Uses JSON-based generation with flexible content blocks for optimal token usage.
 */

import { inngest } from './client';
import { generateLessonJson } from '@/lib/ai/generator-json';
import { updateLessonStatus, updateLessonWithContent } from '@/lib/db/lessons-server';
import { inngestLogger, lessonLogger, errorLogger, generateCorrelationId } from '@/lib/observability/logger';

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
  async ({ event, step, attempt }) => {
    const { lessonId, outline } = event.data;
    const correlationId = generateCorrelationId();
    const jobStartTime = Date.now();
    const jobId = event.id || 'unknown';
    const jobName = 'generate-lesson';

    // Log job start with correlation ID
    inngestLogger.jobStarted({
      jobId,
      jobName,
      eventName: event.name,
      correlationId,
      lessonId,
      eventData: { outline: outline.substring(0, 100), lessonId },
    });

    lessonLogger.generationStarted({
      lessonId,
      correlationId,
      outline,
      mode: 'async',
    });

    console.log(`\n🎯 [INNGEST] Starting lesson generation for ${lessonId}`);
    console.log(`📊 [INNGEST] Correlation ID: ${correlationId}`);
    console.log(`📊 [INNGEST] Job ID: ${jobId}`);
    console.log(`📊 [INNGEST] Attempt: ${attempt || 0}`);
    console.log(`📋 [INNGEST] Outline: "${outline}"`);
    console.log(`📊 [INNGEST] Outline analysis:`, {
      length: outline.length,
      wordCount: outline.split(' ').length,
      estimatedComplexity: outline.length > 100 ? 'high' : outline.length > 50 ? 'medium' : 'low',
    });

    // Check if LangSmith is enabled
    const langsmithEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true';
    console.log(`\n🔍 [INNGEST] LangSmith tracing: ${langsmithEnabled ? '✅ ENABLED' : '⚠️ DISABLED'}`);
    if (langsmithEnabled) {
      console.log(`   Project: ${process.env.LANGSMITH_PROJECT || 'default'}`);
      console.log(`   All AI calls will be traced with rich metadata:`);
      console.log(`   - Content type detection (quiz, math, science, etc.)`);
      console.log(`   - Difficulty analysis (basic, medium, advanced)`);
      console.log(`   - Feature detection (visuals, interactive, practice)`);
      console.log(`   - Retry tracking for failed generations`);
      console.log(`   - Model configuration (provider, temperature, tokens)`);
      console.log(`   View traces at: https://smith.langchain.com`);
    }

    console.log(`\n🤖 [INNGEST] AI Configuration:`, {
      provider: process.env.AI_PROVIDER || 'gemini',
      generatorType: 'JSON with flexible content (95% token savings - always enabled)',
      svgGeneration: 'inline (always enabled)',
      environment: process.env.NODE_ENV || 'development',
      deployment: process.env.VERCEL_ENV || 'local',
    });

    // Step 1: Generate lesson content using AI
    // LangSmith will trace all AI calls here!
    const result = await step.run('generate-ai-content', async () => {
      const stepStartTime = Date.now();

      inngestLogger.stepStarted({
        jobId,
        jobName,
        stepName: 'generate-ai-content',
        stepNumber: 1,
        correlationId,
        lessonId,
      });

      console.log(`🤖 [INNGEST] Calling AI to generate lesson...`);
      console.log(`   Generator: JSON-based with flexible content`);
      console.log(`   This will create a trace tree in LangSmith:`);

      try {
        // Use JSON generator with flexible content, pass lessonId for tracking
        const generationResult = await generateLessonJson(outline, lessonId);

        const stepDuration = Date.now() - stepStartTime;

        console.log(`\n✅ [INNGEST] AI generation completed:`, {
          success: generationResult.success,
          hasTitle: !!generationResult.title,
          hasContent: !!generationResult.content,
          contentLength: generationResult.content?.length || 0,
          error: generationResult.error,
        });

        // Log content quality metrics
        if (generationResult.content) {
          const contentSize = generationResult.content.length;
          const estimatedTokens = Math.ceil(contentSize / 4);

          console.log(`📊 [INNGEST] Generated content metrics:`, {
            contentSize,
            estimatedTokens,
            lessonType: generationResult.metadata?.lessonType || 'flexible',
            approach: generationResult.metadata?.approach || 'json-structured',
          });

          lessonLogger.contentGenerated({
            lessonId,
            correlationId,
            duration: stepDuration,
            contentLength: contentSize,
            lessonType: generationResult.metadata?.lessonType || 'flexible',
          });
        }

        inngestLogger.stepCompleted({
          jobId,
          jobName,
          stepName: 'generate-ai-content',
          stepNumber: 1,
          correlationId,
          lessonId,
          duration: stepDuration,
        });

        if (langsmithEnabled) {
          console.log(`\n🔍 [INNGEST] LangSmith trace created with rich metadata:`);
          console.log(`   generate_lesson_json (chain) - Full workflow orchestration`);
          console.log(`   ├─ Metadata: content_type, lesson_type, format, token_optimization`);
          console.log(`   ├─ Tags: json-lesson-generation, full-workflow, provider, environment`);
          console.log(`   │`);
          console.log(`   ├─ generate_lesson_title (llm) - Title generation`);
          console.log(`   │  ├─ Metadata: temperature=0.7, outline analysis`);
          console.log(`   │  └─ Tags: title-generation, lesson-creation, provider, environment`);
          console.log(`   │`);
          console.log(`   └─ generate_lesson_json (llm) - JSON generation with retries`);
          console.log(`      ├─ Metadata: temperature=0.3, retry tracking, format detection`);
          console.log(`      └─ Tags: json-generation, lesson-creation, provider, environment`);
          console.log(`\n   🌐 View detailed traces at: https://smith.langchain.com/projects/${process.env.LANGSMITH_PROJECT || 'default'}`);
          console.log(`   💡 Metadata filters: metadata.retry_count > 0, metadata.lesson_type = "flexible"`);
          console.log(`   💡 Tag filters: tag:json-generation, tag:lesson-generation`);
        }

        return generationResult;
      } catch (error) {
        const stepDuration = Date.now() - stepStartTime;
        console.error(`❌ [INNGEST] AI generation failed:`, error);

        inngestLogger.stepFailed({
          jobId,
          jobName,
          stepName: 'generate-ai-content',
          stepNumber: 1,
          correlationId,
          lessonId,
          error: error as Error,
        });

        lessonLogger.generationFailed({
          lessonId,
          correlationId,
          duration: stepDuration,
          error: error as Error,
          phase: 'ai_generation',
        });

        throw error; // Inngest will retry
      }
    });

    // Step 2: Update database with result (title + content)
    await step.run('update-database', async () => {
      const stepStartTime = Date.now();

      inngestLogger.stepStarted({
        jobId,
        jobName,
        stepName: 'update-database',
        stepNumber: 2,
        correlationId,
        lessonId,
      });

      console.log(`💾 [INNGEST] Updating database for lesson ${lessonId}...`);

      try {
        if (result.success && result.content && result.title) {
          // Update both title and content in database
          // Include lesson type and JSON flag if available
          await updateLessonWithContent(
            lessonId,
            result.title,
            result.content,
            result.metadata?.lessonType,
            true // Always JSON-based now
          );

          const stepDuration = Date.now() - stepStartTime;

          console.log(`✅ [INNGEST] Database updated successfully`);
          console.log(`   Title: "${result.title}"`);
          console.log(`   Content length: ${result.content.length} chars`);
          if (result.metadata?.lessonType) {
            console.log(`   Lesson type: ${result.metadata.lessonType}`);
          }
          console.log(`   Format: JSON with flexible content`);

          inngestLogger.stepCompleted({
            jobId,
            jobName,
            stepName: 'update-database',
            stepNumber: 2,
            correlationId,
            lessonId,
            duration: stepDuration,
          });
        } else {
          const errorMessage = result.error || 'Generation failed';
          await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);
          console.error(`❌ [INNGEST] Generation failed: ${errorMessage}`);

          inngestLogger.stepFailed({
            jobId,
            jobName,
            stepName: 'update-database',
            stepNumber: 2,
            correlationId,
            lessonId,
            error: errorMessage,
          });
        }
      } catch (error) {
        const stepDuration = Date.now() - stepStartTime;
        console.error(`❌ [INNGEST] Database update failed:`, error);

        inngestLogger.stepFailed({
          jobId,
          jobName,
          stepName: 'update-database',
          stepNumber: 2,
          correlationId,
          lessonId,
          error: error as Error,
        });

        errorLogger.databaseError({
          operation: 'updateLessonWithContent',
          table: 'lessons',
          correlationId,
          lessonId,
          error: error as Error,
        });

        throw error; // Inngest will retry
      }
    });

    const jobDuration = Date.now() - jobStartTime;
    console.log(`🎉 [INNGEST] Lesson ${lessonId} processing complete!`);

    // Log job completion
    inngestLogger.jobCompleted({
      jobId,
      jobName,
      correlationId,
      lessonId,
      duration: jobDuration,
      result: {
        success: result.success,
        contentLength: result.content?.length || 0,
        lessonType: result.metadata?.lessonType,
      },
    });

    return {
      lessonId,
      success: result.success,
      contentLength: result.content?.length || 0,
      correlationId,
    };
  }
);

/**
 * Export all Inngest functions
 * Add new background functions to this array
 */
export const inngestFunctions = [generateLessonFunction];
