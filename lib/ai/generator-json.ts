/**
 * JSON-based lesson generator with massive token optimization
 *
 * Token savings: 80-90% reduction
 * - Old approach: 2000-8000 tokens per lesson (full TypeScript code)
 * - New approach: 200-500 tokens per lesson (structured JSON)
 */

import { traceable } from 'langsmith/traceable';
import { Client } from 'langsmith';
import { LessonGenerationResult } from '@/types/lesson';
import {
  LessonContent,
  validateLessonContent,
} from '@/types/lesson-content';
import {
  FlexibleLesson,
  validateFlexibleLesson,
} from '@/types/lesson-content-v2';
// Always use creative/flexible prompts for maximum versatility
import {
  getCreativeSystemPrompt,
  getCreativeUserPrompt,
  getCreativeRetryPrompt
} from './prompts-creative';

import { AI_CONFIG } from './config';
import { getModelProvider } from './models/factory';
import { AIModelProvider } from './models/base';
import { aiLogger, lessonLogger, generateCorrelationId } from '../observability/logger';

// Initialize LangSmith client
let langsmithClient: Client | null = null;
if (process.env.LANGCHAIN_TRACING_V2 === 'true') {
  try {
    langsmithClient = new Client({
      apiKey: process.env.LANGSMITH_API_KEY,
      apiUrl: process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com',
    });
    console.log('✅ LangSmith client initialized (JSON generator)');
    console.log(`   Project: ${process.env.LANGSMITH_PROJECT || 'default'}`);
  } catch (error) {
    console.warn('⚠️  Failed to initialize LangSmith client:', error);
  }
} else {
  console.log('ℹ️  LangSmith tracing is disabled');
}

// Initialize AI model provider
let modelProvider: AIModelProvider;
try {
  modelProvider = getModelProvider();
  console.log('✅ AI model provider initialized (JSON generator)');
  console.log(`   Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
  console.log(`   Model: ${modelProvider.getModelName()}`);
} catch (error) {
  console.error('❌ Failed to initialize AI model provider:', error);
  throw new Error(`Failed to initialize AI provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Extract JSON from text (removes markdown code blocks)
 */
function extractJsonFromText(text: string): string {
  let jsonText = text?.trim() || '';

  // Clean up response - remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim();

  return jsonText;
}

/**
 * Parse and validate JSON response
 */
function parseAndValidateJson(jsonText: string, outline: string): {
  isValid: boolean;
  data?: LessonContent | FlexibleLesson;
  error?: string
} {
  console.log(`📝 Parsing and validating JSON...`);
  console.log(`📝 Received JSON (${jsonText.length} chars, ~${estimateTokens(jsonText)} tokens)`);

  // Log first and last parts for debugging
  if (jsonText.length > 0) {
    console.log(`   First 100 chars: "${jsonText.substring(0, 100)}..."`);
    console.log(`   Last 100 chars: "...${jsonText.slice(-100)}"`);
  }

  // Check if JSON appears truncated
  const isTruncated = !jsonText.trim().endsWith('}') && !jsonText.trim().endsWith(']');
  if (isTruncated) {
    console.warn(`⚠️  JSON appears to be truncated (doesn't end with } or ])`);
    console.warn(`   Last 50 chars: "${jsonText.slice(-50)}"`);
  }

  // Check for empty response
  if (!jsonText || jsonText.length === 0) {
    console.error(`❌ Empty response from AI model!`);
    return {
      isValid: false,
      error: 'AI returned empty response'
    };
  }

  // Parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Invalid JSON';
    console.error(`❌ JSON parsing failed:`, errorMsg);

    // Check if it's a truncation error
    if (errorMsg.includes('Unterminated string') || errorMsg.includes('Unexpected end')) {
      console.error(`⚠️  JSON was truncated!`);
      console.error(`   Received ${jsonText.length} chars (~${estimateTokens(jsonText)} tokens)`);
      console.error(`   This indicates the response was cut off mid-JSON`);

      // Show where it failed
      if (error instanceof SyntaxError && error.message.includes('position')) {
        const match = error.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          console.error(`   Error at position ${pos}:`);
          console.error(`   Context: "...${jsonText.substring(Math.max(0, pos - 50), Math.min(jsonText.length, pos + 50))}..."`);
        }
      }
    }

    // Log the problematic JSON for debugging (truncated to avoid console spam)
    console.error(`   Problematic JSON (first 500 chars): "${jsonText.substring(0, 500)}..."`);
    console.error(`   Problematic JSON (last 500 chars): "...${jsonText.slice(-500)}"`);

    return {
      isValid: false,
      error: `JSON parsing failed: ${errorMsg}`
    };
  }

  // Validate against flexible content schema
  const validation = validateFlexibleLesson(parsedJson);

  if (!validation.isValid) {
    console.error(`❌ Validation failed:`, validation.error);
    return {
      isValid: false,
      error: validation.error
    };
  }

  console.log(`✅ JSON validation successful!`);
  return {
    isValid: true,
    data: validation.data
  };
}

/**
 * Generate a lesson title from the outline
 */
const generateLessonTitle = traceable(
  async function generateLessonTitle(outline: string, correlationId?: string): Promise<string> {
    const startTime = Date.now();
    const temperature = 0.7;
    const operation = 'title_generation';
    const provider = process.env.AI_PROVIDER || 'gemini';
    const model = modelProvider.getModelName();

    const prompt = `You are a helpful assistant that creates short, engaging titles for educational lessons aimed at children. Keep titles under 60 characters and make them fun and engaging.

Create a short, fun title for this lesson outline: "${outline}"

Return ONLY the title, nothing else.`;

    aiLogger.callStarted({
      provider,
      model,
      operation,
      correlationId,
      prompt: outline,
    });

    try {
      const response = await modelProvider.generateText({
        prompt,
        config: { temperature },
      });

      const title = response.text?.trim() || 'Untitled Lesson';
      const duration = Date.now() - startTime;

      aiLogger.callCompleted({
        provider,
        model,
        operation,
        correlationId,
        duration,
        result: title,
      });

      return title;
    } catch (error) {
      const duration = Date.now() - startTime;

      aiLogger.callFailed({
        provider,
        model,
        operation,
        correlationId,
        duration,
        error: error as Error,
      });

      throw error;
    }
  },
  {
    name: 'generate_lesson_title_json',
    run_type: 'llm',
    ...(langsmithClient ? { client: langsmithClient } : {}),
    metadata: (inputs: any) => ({
      provider: process.env.AI_PROVIDER || 'gemini',
      model: modelProvider.getModelName(),
      temperature: 0.7,
      operation: 'title_generation',
      correlationId: inputs.correlationId,
      environment: process.env.NODE_ENV || 'development',
      deployment: process.env.VERCEL_ENV || 'local',
    }),
    tags: ['title-generation', 'json-approach', process.env.AI_PROVIDER || 'gemini'],
  }
);

/**
 * Generate structured JSON lesson content with automatic retry on validation errors
 */
const MAX_RETRIES = 2;

const generateLessonContent = traceable(
  async function generateLessonContent(
    outline: string,
    title: string,
    retryCount = 0,
    previousError?: string,
    previousJson?: string,
    correlationId?: string
  ): Promise<LessonContent | FlexibleLesson> {
    const startTime = Date.now();
    const temperature = 0.3;
    const maxTokens = 8192; // Increased from 4096 to prevent JSON truncation
    const operation = 'lesson_content_generation';
    const provider = process.env.AI_PROVIDER || 'gemini';
    const model = modelProvider.getModelName();

    console.log(`\n🎨 Generating lesson JSON (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    console.log(`   Mode: Flexible/Creative (adapts to any prompt with inline SVG support)`);

    // Log retry if applicable
    if (retryCount > 0 && previousError) {
      aiLogger.retryAttempt({
        provider,
        model,
        operation,
        correlationId,
        retryCount,
        maxRetries: MAX_RETRIES,
        reason: previousError,
      });
    }

    // Build prompt - always use flexible/creative prompts
    const systemPrompt = getCreativeSystemPrompt();
    let userPrompt: string;

    if (retryCount === 0) {
      userPrompt = getCreativeUserPrompt(outline, title);
      aiLogger.callStarted({
        provider,
        model,
        operation,
        correlationId,
        prompt: outline,
      });
    } else {
      userPrompt = getCreativeRetryPrompt(outline, title, previousError!);
    }

    console.log(`🔄 Calling AI model...`);
    console.log(`   Model: ${modelProvider.getModelName()}`);
    console.log(`   System prompt: ~${estimateTokens(systemPrompt)} tokens`);
    console.log(`   User prompt: ~${estimateTokens(userPrompt)} tokens`);
    console.log(`   Max output: ${maxTokens} tokens`);

    let response;
    try {
      response = await modelProvider.generateText({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      console.log(`✅ AI model call successful`);
      console.log(`   Finish reason: ${response.finishReason}`);

      // Check if response was truncated
      if (response.finishReason === 'max_tokens' || response.finishReason === 'length') {
        console.error(`⚠️  AI response was truncated due to token limit!`);
        console.error(`   maxOutputTokens: ${maxTokens}`);
        console.error(`   This will likely cause JSON parsing to fail`);

        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 Retrying with same limit but asking for more concise output (${retryCount + 1}/${MAX_RETRIES})...\n`);
          // Don't use the truncated response, just retry
          return generateLessonContent(
            outline,
            title,
            retryCount + 1,
            `Previous response was truncated due to token limit. Please generate a more concise lesson with fewer sections or shorter content that fits within ${maxTokens} tokens.`,
            ''
          );
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ AI model call failed:`, error);

      aiLogger.callFailed({
        provider,
        model,
        operation,
        correlationId,
        duration,
        error: error as Error,
        retryCount,
        willRetry: retryCount < MAX_RETRIES,
      });

      throw new Error(`AI model call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Extract and parse JSON using helper functions
    const jsonText = extractJsonFromText(response.text || '');
    const validation = parseAndValidateJson(jsonText, outline);

    if (!validation.isValid) {
      console.log(`❌ Schema validation failed:`, validation.error);

      aiLogger.validationFailed({
        operation,
        correlationId,
        validationErrors: [validation.error],
        rawResponse: jsonText,
      });

      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying (${retryCount + 1}/${MAX_RETRIES})...\n`);
        return generateLessonContent(
          outline,
          title,
          retryCount + 1,
          `Schema validation error: ${validation.error}`,
          jsonText,
          correlationId
        );
      } else {
        throw new Error(`Schema validation failed after ${MAX_RETRIES} retries: ${validation.error}`);
      }
    }

    console.log(`✅ Validation passed! Lesson type: ${validation.data!.type}`);
    const duration = Date.now() - startTime;
    const tokens = estimateTokens(jsonText);

    aiLogger.callCompleted({
      provider,
      model,
      operation,
      correlationId,
      duration,
      tokens,
      result: { lessonType: validation.data!.type, contentLength: jsonText.length },
    });

    return validation.data!;
  },
  {
    name: 'generate_lesson_json',
    run_type: 'llm',
    ...(langsmithClient ? { client: langsmithClient } : {}),
    metadata: (inputs: any) => ({
      provider: process.env.AI_PROVIDER || 'gemini',
      model: modelProvider.getModelName(),
      temperature: 0.3,
      max_tokens: 8192,
      retry_count: inputs.retryCount || 0,
      max_retries: MAX_RETRIES,
      is_retry: (inputs.retryCount || 0) > 0,
      svg_generation: 'inline',
      approach: 'json-structured',
      token_optimization: 'enabled',
      correlationId: inputs.correlationId,
      environment: process.env.NODE_ENV || 'development',
      deployment: process.env.VERCEL_ENV || 'local',
      has_previous_error: !!inputs.previousError,
    }),
    tags: ['json-generation', 'lesson-creation', process.env.AI_PROVIDER || 'gemini'],
  }
);

/**
 * Main function to generate a complete lesson using JSON approach
 */
export const generateLessonJson = traceable(
  async function generateLessonJsonMain(outline: string, lessonId?: string): Promise<LessonGenerationResult> {
    const startTime = Date.now();
    const correlationId = generateCorrelationId();

    try {
      console.log(`\n🚀 Starting JSON-based lesson generation`);
      console.log(`📊 Correlation ID: ${correlationId}`);
      console.log(`📊 Lesson ID: ${lessonId || 'N/A'}`);
      console.log(`📊 Outline: "${outline}"`);
      console.log(`🎯 Approach: Structured JSON (80-90% token savings)`);

      // Step 1: Generate title
      console.log(`\n📌 Step 1: Generating title...`);
      const titleStartTime = Date.now();
      const title = await generateLessonTitle(outline, correlationId);
      const titleDuration = Date.now() - titleStartTime;
      console.log(`✅ Title: "${title}"`);

      if (lessonId) {
        aiLogger.callCompleted({
          provider: process.env.AI_PROVIDER || 'gemini',
          model: modelProvider.getModelName(),
          operation: 'title_generation',
          correlationId,
          lessonId,
          duration: titleDuration,
          result: title,
        });
      }

      // Step 2: Generate structured JSON content
      console.log(`\n📌 Step 2: Generating JSON content...`);
      const contentStartTime = Date.now();
      const lessonContent = await generateLessonContent(outline, title, 0, undefined, undefined, correlationId);
      const contentDuration = Date.now() - contentStartTime;

      // Convert to JSON string for storage (compact format to save tokens)
      const contentJson = JSON.stringify(lessonContent);

      const duration = Date.now() - startTime;
      const totalTokens = estimateTokens(contentJson);

      console.log(`\n🎉 Lesson generation completed!`);
      console.log(`📊 Title: "${title}"`);
      console.log(`📊 Type: ${lessonContent.type}`);
      console.log(`📊 JSON size: ${contentJson.length} chars (~${totalTokens} tokens)`);
      console.log(`📊 Duration: ${(duration / 1000).toFixed(2)}s\n`);

      // Record lesson generation metrics
      if (lessonId) {
        lessonLogger.generationCompleted({
          lessonId,
          correlationId,
          duration,
          lessonType: lessonContent.type,
          contentLength: contentJson.length,
          tokens: totalTokens,
        });
      }

      return {
        success: true,
        title,
        content: contentJson, // Store as JSON string
        metadata: {
          lessonType: lessonContent.type,
          approach: 'json-structured',
          generatedAt: new Date().toISOString(),
          correlationId,
          duration,
          tokens: totalTokens,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error('\n❌ Lesson generation failed:', error);
      console.error(`📊 Failed after: ${(duration / 1000).toFixed(2)}s\n`);

      if (lessonId) {
        lessonLogger.generationFailed({
          lessonId,
          correlationId,
          duration,
          error: error as Error,
        });
      }

      return {
        success: false,
        title: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
  {
    name: 'generate_lesson_json_main',
    run_type: 'chain',
    ...(langsmithClient ? { client: langsmithClient } : {}),
    metadata: (inputs: any) => ({
      provider: process.env.AI_PROVIDER || 'gemini',
      model: modelProvider.getModelName(),
      workflow: 'json_lesson_generation',
      approach: 'json-structured',
      token_optimization: 'enabled',
      includes_title_gen: true,
      includes_json_gen: true,
      includes_validation: true,
      max_retry_attempts: MAX_RETRIES,
      correlationId: inputs.correlationId,
      lessonId: inputs.lessonId,
      environment: process.env.NODE_ENV || 'development',
      deployment: process.env.VERCEL_ENV || 'local',
      outline_length: inputs.outline?.length || 0,
    }),
    tags: ['json-lesson-generation', 'full-workflow', process.env.AI_PROVIDER || 'gemini'],
  }
);

/**
 * Progress callback for streaming
 */
export type StreamProgressCallback = (progress: {
  stage: 'title' | 'content' | 'validating' | 'complete' | 'error';
  percentage: number;
  message: string;
  partialContent?: string;
  isComplete: boolean;
  error?: string;
}) => void | Promise<void>;

/**
 * Generate lesson content with streaming support
 * Provides real-time progress updates as content is generated
 */
export const generateLessonJsonStream = traceable(
  async function generateLessonJsonStream(
    outline: string,
    onProgress: StreamProgressCallback,
    lessonId?: string
  ): Promise<LessonGenerationResult> {
    const startTime = Date.now();
    const correlationId = generateCorrelationId();
    let accumulatedContent = '';

    try {
      console.log(`\n🚀 Starting STREAMING lesson generation`);
      console.log(`📊 Correlation ID: ${correlationId}`);
      console.log(`📊 Lesson ID: ${lessonId || 'N/A'}`);

      // Step 1: Generate title (no streaming needed - fast)
      await onProgress({
        stage: 'title',
        percentage: 10,
        message: 'Generating lesson title...',
        isComplete: false,
      });

      const title = await generateLessonTitle(outline, correlationId);
      console.log(`✅ Title: "${title}"`);

      await onProgress({
        stage: 'title',
        percentage: 20,
        message: `Title generated: "${title}"`,
        isComplete: false,
      });

      // Step 2: Stream lesson content generation
      await onProgress({
        stage: 'content',
        percentage: 25,
        message: 'Starting lesson content generation...',
        isComplete: false,
      });

      const systemPrompt = getCreativeSystemPrompt();
      const userPrompt = getCreativeUserPrompt(outline, title);
      const maxTokens = 32768; // Use higher limit for streaming

      console.log(`🔄 Streaming AI model call...`);
      console.log(`   Model: ${modelProvider.getModelName()}`);
      console.log(`   Max output: ${maxTokens} tokens`);

      let estimatedProgress = 30;

      const response = await modelProvider.generateTextStream({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: maxTokens,
        },
        onChunk: async (chunk) => {
          if (!chunk.isComplete) {
            accumulatedContent += chunk.text;

            // Update progress based on content length
            // Estimate: 6000 chars ≈ 100% for typical lessons
            const contentPercentage = Math.min(
              90,
              30 + Math.floor((accumulatedContent.length / 6000) * 60)
            );

            if (contentPercentage > estimatedProgress) {
              estimatedProgress = contentPercentage;
              await onProgress({
                stage: 'content',
                percentage: estimatedProgress,
                message: `Generating content... (${accumulatedContent.length} characters)`,
                partialContent: accumulatedContent,
                isComplete: false,
              });
            }
          } else {
            // Streaming complete
            console.log(`✅ Streaming complete (${accumulatedContent.length} chars)`);
            console.log(`   Finish reason: ${chunk.finishReason}`);
          }
        },
      });

      // Step 3: Validate the JSON
      await onProgress({
        stage: 'validating',
        percentage: 92,
        message: 'Validating lesson content...',
        isComplete: false,
      });

      const jsonText = extractJsonFromText(response.text);
      const lessonContent = parseAndValidateJson(jsonText, outline);

      if (lessonContent.error) {
        throw new Error(lessonContent.error);
      }

      // Success!
      const duration = Date.now() - startTime;
      const contentJson = JSON.stringify(lessonContent.data);
      const lessonType = (lessonContent.data as any)?.type || 'flexible';

      await onProgress({
        stage: 'complete',
        percentage: 100,
        message: 'Lesson generated successfully!',
        partialContent: contentJson,
        isComplete: true,
      });

      if (lessonId) {
        lessonLogger.generationCompleted({
          lessonId,
          correlationId,
          duration,
          title,
          lessonType,
          contentLength: contentJson.length,
          tokens: estimateTokens(contentJson),
          provider: process.env.AI_PROVIDER || 'gemini',
          model: modelProvider.getModelName(),
        });
      }

      return {
        success: true,
        title,
        content: contentJson,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      console.error(`❌ Streaming generation failed:`, error);

      await onProgress({
        stage: 'error',
        percentage: 0,
        message: errorMessage,
        isComplete: true,
        error: errorMessage,
      });

      if (lessonId) {
        lessonLogger.generationFailed({
          lessonId,
          correlationId,
          duration,
          error: error as Error,
        });
      }

      return {
        success: false,
        title: 'Error',
        error: errorMessage,
      };
    }
  },
  {
    name: 'generate_lesson_json_stream',
    run_type: 'chain',
    ...(langsmithClient ? { client: langsmithClient } : {}),
    tags: ['json-lesson-generation', 'streaming', process.env.AI_PROVIDER || 'gemini'],
  }
);
