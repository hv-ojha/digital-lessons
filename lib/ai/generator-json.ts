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

import { generateImage, extractImageRequirements } from './image-generator';
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
    const maxTokens = 4096; // Much smaller than before! (was 32768)

    console.log(`\n🎨 Generating lesson JSON (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    console.log(`   Mode: Flexible/Creative (adapts to any prompt)`);

    // Generate images if needed (only on first attempt)
    let generatedImages: Map<string, string> = new Map();
    if (retryCount === 0 && AI_CONFIG.features.imageGeneration) {
      console.log(`\n🖼️  Image generation enabled`);

      const imageRequirements = extractImageRequirements(outline);

      if (imageRequirements.length > 0) {
        console.log(`\n🖼️  Generating ${imageRequirements.length} image(s)...`);

        for (const req of imageRequirements) {
          try {
            console.log(`   Generating: ${req.prompt}`);
            const result = await generateImage(req);

            if (result.success && result.imageData) {
              const key = req.subject || req.prompt;
              generatedImages.set(key, result.imageData);
              console.log(`   ✅ Generated ${result.imageType} image for: ${key}`);
            }
          } catch (error) {
            console.warn(`   ⚠️  Image generation failed:`, error);
          }
        }
      }
    }

    // Build prompt - always use flexible/creative prompts
    const systemPrompt = getCreativeSystemPrompt();
    let userPrompt: string;

    if (retryCount === 0) {
      userPrompt = getCreativeUserPrompt(outline, title);

      // Add image context if available
      if (generatedImages.size > 0) {
        const imageKeys = Array.from(generatedImages.keys());
        userPrompt += `\n\nAVAILABLE IMAGES: ${imageKeys.join(', ')}
You can reference these in your JSON using placeholders like: {"src": "{IMAGE:${imageKeys[0]}}", "alt": "description"}`;
      }
    } else {
      userPrompt = getCreativeRetryPrompt(outline, title, previousError!, previousJson);
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
    } catch (error) {
      console.error(`❌ AI model call failed:`, error);
      throw new Error(`AI model call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    let jsonText = response.text?.trim() || '';

    // Clean up response - remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim();

    console.log(`📝 Received JSON (${jsonText.length} chars, ~${estimateTokens(jsonText)} tokens)`);

    // Replace image placeholders with actual base64 data
    if (generatedImages.size > 0) {
      console.log(`\n🖼️  Embedding ${generatedImages.size} image(s)...`);
      for (const [key, imageData] of generatedImages.entries()) {
        const placeholder = `{IMAGE:${key}}`;
        if (jsonText.includes(placeholder)) {
          jsonText = jsonText.replace(new RegExp(placeholder, 'g'), imageData);
          console.log(`   ✅ Embedded image: ${key}`);
        }
      }
    }

    // Parse and validate JSON
    console.log(`📝 Parsing and validating JSON...`);
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (error) {
      console.log(`❌ JSON parsing failed:`, error);

      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying (${retryCount + 1}/${MAX_RETRIES})...\n`);
        return generateLessonContent(
          outline,
          title,
          retryCount + 1,
          `JSON parsing error: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
          jsonText
        );
      } else {
        throw new Error(`JSON parsing failed after ${MAX_RETRIES} retries: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
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
      max_tokens: 4096,
      retry_count: inputs.retryCount || 0,
      max_retries: MAX_RETRIES,
      is_retry: (inputs.retryCount || 0) > 0,
      image_generation_enabled: AI_CONFIG.features.imageGeneration,
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
