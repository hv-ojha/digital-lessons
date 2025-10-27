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
import { updateLessonStatus, updateLessonWithContent } from '@/lib/db/lessons-server';

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
      imageGeneration: process.env.ENABLE_IMAGE_GENERATION === 'true' ? 'enabled' : 'disabled',
      environment: process.env.NODE_ENV || 'development',
      deployment: process.env.VERCEL_ENV || 'local',
    });

    // Step 1: Generate lesson content using AI
    // LangSmith will trace all AI calls here!
    const result = await step.run('generate-ai-content', async () => {
      console.log(`🤖 [INNGEST] Calling AI to generate lesson...`);
      console.log(`   This will create a trace tree in LangSmith:`);

      try {
        const generationResult = await generateLesson(outline);

        console.log(`\n✅ [INNGEST] AI generation completed:`, {
          success: generationResult.success,
          hasTitle: !!generationResult.title,
          hasContent: !!generationResult.content,
          contentLength: generationResult.content?.length || 0,
          error: generationResult.error,
        });

        // Log content quality metrics
        if (generationResult.content) {
          const lines = generationResult.content.split('\n').length;
          const hasState = generationResult.content.includes('useState');
          const hasEffects = generationResult.content.includes('useEffect');
          const componentCount = (generationResult.content.match(/function \w+/g) || []).length;

          console.log(`📊 [INNGEST] Generated code metrics:`, {
            lines,
            components: componentCount,
            usesState: hasState,
            usesEffects: hasEffects,
            estimatedComplexity: lines > 100 ? 'high' : lines > 50 ? 'medium' : 'low',
          });
        }

        if (langsmithEnabled) {
          console.log(`\n🔍 [INNGEST] LangSmith trace created with rich metadata:`);
          console.log(`   generate_lesson (chain) - Full workflow orchestration`);
          console.log(`   ├─ Metadata: content_type, difficulty, age_level, complexity_score, feature flags`);
          console.log(`   ├─ Tags: lesson-generation, full-workflow, provider, environment`);
          console.log(`   │`);
          console.log(`   ├─ generate_lesson_title (llm) - Title generation`);
          console.log(`   │  ├─ Metadata: temperature=0.7, outline analysis`);
          console.log(`   │  └─ Tags: title-generation, lesson-creation, provider, environment`);
          console.log(`   │`);
          console.log(`   └─ generate_lesson_code (llm) - Code generation with retries`);
          console.log(`      ├─ Metadata: temperature=0.3, retry tracking, feature detection`);
          console.log(`      └─ Tags: code-generation, lesson-creation, provider, environment`);
          console.log(`\n   🌐 View detailed traces at: https://smith.langchain.com/projects/${process.env.LANGSMITH_PROJECT || 'default'}`);
          console.log(`   💡 Metadata filters: metadata.retry_count > 0, metadata.content_type = "quiz"`);
          console.log(`   💡 Tag filters: tag:code-generation, tag:lesson-generation`);
        }

        return generationResult;
      } catch (error) {
        console.error(`❌ [INNGEST] AI generation failed:`, error);
        throw error; // Inngest will retry
      }
    });

    // Step 2: Update database with result (title + content)
    await step.run('update-database', async () => {
      console.log(`💾 [INNGEST] Updating database for lesson ${lessonId}...`);

      try {
        if (result.success && result.content && result.title) {
          // Update both title and content in database
          await updateLessonWithContent(lessonId, result.title, result.content);
          console.log(`✅ [INNGEST] Database updated successfully`);
          console.log(`   Title: "${result.title}"`);
          console.log(`   Content length: ${result.content.length} chars`);
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
