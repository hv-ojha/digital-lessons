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
 * Generate a lesson title from the outline
 */
const generateLessonTitle = traceable(
  async function generateLessonTitle(outline: string): Promise<string> {
    const temperature = 0.7;

    const prompt = `You are a helpful assistant that creates short, engaging titles for educational lessons aimed at children. Keep titles under 60 characters and make them fun and engaging.

Create a short, fun title for this lesson outline: "${outline}"

Return ONLY the title, nothing else.`;

    console.log('📤 [TITLE] Generating title...');

    const response = await modelProvider.generateText({
      prompt,
      config: { temperature },
    });

    const title = response.text?.trim() || 'Untitled Lesson';
    console.log('✅ [TITLE] Generated:', title);

    return title;
  },
  {
    name: 'generate_lesson_title_json',
    run_type: 'llm',
    ...(langsmithClient ? { client: langsmithClient } : {}),
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
    previousJson?: string
  ): Promise<LessonContent | FlexibleLesson> {
    const temperature = 0.3;
    const maxTokens = 8192; // Increased from 4096 to prevent JSON truncation

    console.log(`\n🎨 Generating lesson JSON (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    console.log(`   Mode: Flexible/Creative (adapts to any prompt with inline SVG support)`);

    // Build prompt - always use flexible/creative prompts
    const systemPrompt = getCreativeSystemPrompt();
    let userPrompt: string;

    if (retryCount === 0) {
      userPrompt = getCreativeUserPrompt(outline, title);
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
      console.error(`❌ AI model call failed:`, error);
      throw new Error(`AI model call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    let jsonText = response.text?.trim() || '';

    // Clean up response - remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim();

    console.log(`📝 Received JSON (${jsonText.length} chars, ~${estimateTokens(jsonText)} tokens)`);

    // Log first and last parts for debugging
    if (jsonText.length > 0) {
      console.log(`   First 100 chars: "${jsonText.substring(0, 100)}..."`);
      console.log(`   Last 100 chars: "...${jsonText.slice(-100)}"`);
    }

    // Check if JSON appears truncated (common sign: doesn't end with })
    const isTruncated = !jsonText.trim().endsWith('}') && !jsonText.trim().endsWith(']');
    if (isTruncated) {
      console.warn(`⚠️  JSON appears to be truncated (doesn't end with } or ])`);
      console.warn(`   Last 50 chars: "${jsonText.slice(-50)}"`);
    }

    // Check for empty response
    if (!jsonText || jsonText.length === 0) {
      console.error(`❌ Empty response from AI model!`);
      console.error(`   Response object:`, response);

      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying due to empty response (${retryCount + 1}/${MAX_RETRIES})...\n`);
        return generateLessonContent(
          outline,
          title,
          retryCount + 1,
          `Previous response was empty. Please generate complete valid JSON.`,
          ''
        );
      } else {
        throw new Error(`AI returned empty response after ${MAX_RETRIES} retries`);
      }
    }

    // Parse and validate JSON
    console.log(`📝 Parsing and validating JSON...`);
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Invalid JSON';
      console.error(`❌ JSON parsing failed:`, errorMsg);

      // Check if it's a truncation error
      if (errorMsg.includes('Unterminated string') || errorMsg.includes('Unexpected end')) {
        console.error(`⚠️  JSON was truncated! Current maxTokens: ${maxTokens}`);
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
      console.error(`   Problematic JSON (last 500 chars): "...${jsonText.slice(-500)}"`)

      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying with same maxTokens (${retryCount + 1}/${MAX_RETRIES})...\n`);
        return generateLessonContent(
          outline,
          title,
          retryCount + 1,
          `JSON parsing error (possibly truncated): ${errorMsg}. Please ensure the JSON is complete and valid.`,
          jsonText
        );
      } else {
        throw new Error(`JSON parsing failed after ${MAX_RETRIES} retries: ${errorMsg}. Last response was ${jsonText.length} chars.`);
      }
    }

    // Validate against flexible content schema (always)
    let validation: { isValid: boolean; data?: LessonContent | FlexibleLesson; error?: string };
    validation = validateFlexibleLesson(parsedJson);

    if (!validation.isValid) {
      console.log(`❌ Schema validation failed:`, validation.error);

      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying (${retryCount + 1}/${MAX_RETRIES})...\n`);
        return generateLessonContent(
          outline,
          title,
          retryCount + 1,
          `Schema validation error: ${validation.error}`,
          jsonText
        );
      } else {
        throw new Error(`Schema validation failed after ${MAX_RETRIES} retries: ${validation.error}`);
      }
    }

    console.log(`✅ Validation passed! Lesson type: ${validation.data!.type}`);

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
    }),
    tags: ['json-generation', 'lesson-creation', process.env.AI_PROVIDER || 'gemini'],
  }
);

/**
 * Main function to generate a complete lesson using JSON approach
 */
export const generateLessonJson = traceable(
  async function generateLessonJsonMain(outline: string): Promise<LessonGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`\n🚀 Starting JSON-based lesson generation`);
      console.log(`📊 Outline: "${outline}"`);
      console.log(`🎯 Approach: Structured JSON (80-90% token savings)`);

      // Step 1: Generate title
      console.log(`\n📌 Step 1: Generating title...`);
      const title = await generateLessonTitle(outline);
      console.log(`✅ Title: "${title}"`);

      // Step 2: Generate structured JSON content
      console.log(`\n📌 Step 2: Generating JSON content...`);
      const lessonContent = await generateLessonContent(outline, title);

      // Convert to JSON string for storage
      const contentJson = JSON.stringify(lessonContent, null, 2);

      const duration = Date.now() - startTime;

      console.log(`\n🎉 Lesson generation completed!`);
      console.log(`📊 Title: "${title}"`);
      console.log(`📊 Type: ${lessonContent.type}`);
      console.log(`📊 JSON size: ${contentJson.length} chars (~${estimateTokens(contentJson)} tokens)`);
      console.log(`📊 Duration: ${(duration / 1000).toFixed(2)}s\n`);

      return {
        success: true,
        title,
        content: contentJson, // Store as JSON string
        metadata: {
          lessonType: lessonContent.type,
          approach: 'json-structured',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error('\n❌ Lesson generation failed:', error);
      console.error(`📊 Failed after: ${(duration / 1000).toFixed(2)}s\n`);

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
    metadata: {
      provider: process.env.AI_PROVIDER || 'gemini',
      model: modelProvider.getModelName(),
      workflow: 'json_lesson_generation',
      approach: 'json-structured',
      token_optimization: 'enabled',
      includes_title_gen: true,
      includes_json_gen: true,
      includes_validation: true,
      max_retry_attempts: MAX_RETRIES,
    },
    tags: ['json-lesson-generation', 'full-workflow', process.env.AI_PROVIDER || 'gemini'],
  }
);
