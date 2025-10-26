import { GoogleGenAI } from '@google/genai';
import { traceable } from 'langsmith/traceable';
import { LessonGenerationResult } from '@/types/lesson';
import { validateTypeScriptCode } from './validation';
import { getSystemPrompt, getUserPrompt } from './prompts';
import { generateImage, extractImageRequirements, ImageGenerationRequest } from './image-generator';
import { AI_CONFIG } from './config';
import { getCachedContent, buildConfigWithCache } from './cache-manager';

// Initialize Google Gemini client
const apiKey = process.env.GEMINI_API_KEY;

// Debug: Check if API key is loaded
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is required');
} else {
  console.log('✅ GEMINI_API_KEY is loaded:', apiKey.substring(0, 20) + '...');
}

const genAI = new GoogleGenAI({ apiKey: apiKey });

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Analyze code quality metrics
 */
function analyzeCodeQuality(code: string) {
  return {
    svg_count: (code.match(/<svg/g) || []).length,
    button_count: (code.match(/<button/g) || []).length,
    input_count: (code.match(/<input/g) || []).length,
    has_state: code.includes('useState'),
    has_effect: code.includes('useEffect'),
    has_callback: code.includes('useCallback'),
    has_memo: code.includes('useMemo'),
    component_count: (code.match(/function \w+/g) || []).length,
  };
}

/**
 * Analyze input characteristics and complexity
 */
function analyzeInputCharacteristics(outline: string) {
  const lower = outline.toLowerCase();
  const wordCount = outline.split(' ').length;

  // Content type detection
  const contentType =
    lower.includes('quiz') ? 'quiz' :
    lower.includes('test') ? 'test' :
    lower.includes('math') || lower.includes('calculation') || lower.includes('arithmetic') ? 'math' :
    lower.includes('science') || lower.includes('physics') || lower.includes('chemistry') || lower.includes('biology') ? 'science' :
    lower.includes('history') || lower.includes('historical') ? 'history' :
    lower.includes('language') || lower.includes('grammar') || lower.includes('reading') ? 'language' :
    lower.includes('geography') || lower.includes('countries') ? 'geography' :
    'general';

  // Difficulty indicators
  const difficulty =
    lower.includes('advanced') || lower.includes('complex') || lower.includes('comprehensive') ? 'advanced' :
    lower.includes('intermediate') ? 'intermediate' :
    lower.includes('basic') || lower.includes('simple') || lower.includes('introduction') || lower.includes('beginner') ? 'basic' :
    'medium';

  // Feature requests
  const features = {
    wants_visuals: lower.includes('diagram') || lower.includes('image') || lower.includes('visual') || lower.includes('picture') || lower.includes('illustration'),
    wants_interactive: lower.includes('interactive') || lower.includes('clickable') || lower.includes('click'),
    wants_detailed: lower.includes('comprehensive') || lower.includes('detailed') || lower.includes('thorough') || lower.includes('complete'),
    wants_concise: lower.includes('brief') || lower.includes('short') || lower.includes('quick') || lower.includes('summary'),
    wants_examples: lower.includes('example') || lower.includes('sample') || lower.includes('demonstration'),
    wants_practice: lower.includes('practice') || lower.includes('exercise') || lower.includes('problem'),
  };

  // Age/grade level detection
  const ageLevel =
    lower.includes('kindergarten') || lower.includes('preschool') ? 'preschool' :
    lower.includes('elementary') || lower.includes('grade 1') || lower.includes('grade 2') || lower.includes('grade 3') ? 'elementary' :
    lower.includes('middle school') || lower.includes('grade 6') || lower.includes('grade 7') || lower.includes('grade 8') ? 'middle-school' :
    lower.includes('high school') || lower.includes('grade 9') || lower.includes('grade 10') ? 'high-school' :
    'general';

  // Complexity score (0-100)
  let complexityScore = 40; // Base score
  if (wordCount > 20) complexityScore += 10;
  if (wordCount > 40) complexityScore += 10;
  if (features.wants_detailed) complexityScore += 15;
  if (features.wants_visuals) complexityScore += 10;
  if (features.wants_interactive) complexityScore += 10;
  if (difficulty === 'advanced') complexityScore += 15;
  else if (difficulty === 'basic') complexityScore -= 10;

  return {
    content_type: contentType,
    difficulty,
    age_level: ageLevel,
    complexity_score: Math.min(100, Math.max(0, complexityScore)),
    word_count: wordCount,
    char_count: outline.length,
    ...features,
  };
}

/**
 * Calculate lesson complexity from generated code
 */
function calculateLessonComplexity(code: string, qualityMetrics: ReturnType<typeof analyzeCodeQuality>) {
  let score = 0;

  // Base complexity from code length
  const lines = code.split('\n').length;
  if (lines > 100) score += 20;
  else if (lines > 50) score += 10;
  else score += 5;

  // Component complexity
  score += qualityMetrics.component_count * 5;

  // State management complexity
  if (qualityMetrics.has_state) score += 15;
  if (qualityMetrics.has_effect) score += 10;
  if (qualityMetrics.has_callback) score += 5;
  if (qualityMetrics.has_memo) score += 5;

  // Visual complexity
  score += qualityMetrics.svg_count * 10;

  // Interaction complexity
  score += qualityMetrics.button_count * 2;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate a lesson title from the outline
 */
const generateLessonTitle = traceable(
  async function generateLessonTitle(outline: string): Promise<string> {
    const modelName = 'gemini-2.5-flash';
    const temperature = 0.7;
    const maxTokens = 100;

    const prompt = `You are a helpful assistant that creates short, engaging titles for educational lessons aimed at children. Keep titles under 60 characters and make them fun and engaging.

Create a short, fun title for this lesson outline: "${outline}"

Return ONLY the title, nothing else.`;

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const title = response.text?.trim() || 'Untitled Lesson';

    return title;
  },
  {
    name: 'generate_lesson_title',
    run_type: 'llm',
    metadata: (inputs: any, output: any) => {
      const outline = inputs.outline || '';
      const title = output || '';
      const inputTokens = estimateTokens(outline);
      const outputTokens = estimateTokens(title);

      return {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        max_output_tokens: 100,
        // Token tracking
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        estimated_cost_usd: 0, // Gemini is free
        // Output quality
        title_length: title.length,
        title_word_count: title.split(' ').length,
      };
    },
    tags: [
      process.env.NODE_ENV || 'development',
      'title-generation',
      'llm-call'
    ]
  }
);

/**
 * Generate TypeScript/React code for the lesson with automatic retry on validation errors
 *
 * This function will automatically retry up to MAX_RETRIES times if validation fails,
 * providing the AI with specific error feedback each time.
 */
const MAX_RETRIES = 3; // Increased from 2 for better reliability

const generateLessonCode = traceable(
  async function generateLessonCode(outline: string, title: string, retryCount = 0): Promise<string> {
    const modelName = 'gemini-2.5-flash';
    const temperature = 0.3;
    const maxTokens = 32768; // Increased to allow very large components with lots of content

    const systemPrompt = getSystemPrompt();
    let userPrompt = getUserPrompt(outline, title);

    console.log(`\n🎨 Generating lesson code (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);

    // Check if images are needed and generate them (only on first attempt)
    let generatedImages: Map<string, string> = new Map();
    if (retryCount === 0 && AI_CONFIG.features.imageGeneration) {
      console.log(`\n🖼️  Image generation is enabled (ENABLE_IMAGE_GENERATION=${process.env.ENABLE_IMAGE_GENERATION})`);

      const imageRequirements = extractImageRequirements(outline);

      if (imageRequirements.length > 0) {
        console.log(`\n🖼️  Detected ${imageRequirements.length} image requirement(s), generating...`);

        for (const req of imageRequirements) {
          try {
            console.log(`   Generating: ${req.prompt} (${req.style || 'default'})`);
            const result = await generateImage(req);

            if (result.success && result.imageData) {
              const key = req.subject || req.prompt;
              generatedImages.set(key, result.imageData);
              console.log(`   ✅ Generated ${result.imageType} image for: ${key}`);
            } else {
              console.warn(`   ⚠️  Image generation failed: ${result.error}`);
            }
          } catch (error) {
            console.warn(`   ⚠️  Error generating image:`, error);
          }
        }

        // Add images to prompt if any were generated
        if (generatedImages.size > 0) {
          const imageContext = Array.from(generatedImages.entries())
            .map(([key, data]) => `- ${key}: Available as base64 data URI`)
            .join('\n');

          userPrompt += `\n\nAVAILABLE IMAGES:\nThe following images have been generated and are available to use in your lesson:\n${imageContext}\n\nTo use an image, add an <img> tag with the src pointing to the image data. For example:\n<img src="{IMAGE:${Array.from(generatedImages.keys())[0]}}" alt="${Array.from(generatedImages.keys())[0]}" className="w-full max-w-md mx-auto rounded-lg" />\n\nUse the {IMAGE:key} placeholder and it will be replaced with the actual base64 data.`;
        }
      }
    } else if (retryCount === 0 && !AI_CONFIG.features.imageGeneration) {
      console.log(`\n⚠️  Image generation is disabled (ENABLE_IMAGE_GENERATION=${process.env.ENABLE_IMAGE_GENERATION || 'false'})`);
      console.log(`   To enable: Set ENABLE_IMAGE_GENERATION=true in .env.local`);
    }

    // Build prompt with error feedback if this is a retry
    let fullPrompt: string;
    if (retryCount === 0) {
      // First attempt - use standard prompts
      fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    } else {
      // Retry attempt - include previous errors
      const errorContext = `
IMPORTANT: The previous code generation attempt failed validation with the following errors:

${validation_errors_from_previous_attempt.map((err: string, i: number) => `${i + 1}. ${err}`).join('\n')}

Please carefully review these errors and generate corrected code that addresses ALL of them.
Remember:
- Use only allowed imports (React hooks)
- Set BOTH background AND text colors explicitly
- Use buttons instead of input fields
- Ensure all variables are defined before use
- Follow TypeScript best practices

Generate the CORRECTED code now:`;

      fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\n${errorContext}`;
    }

    // Cache the system prompt to save ~90% on input tokens (especially helpful for retries)
    console.log(`\n💾 Checking prompt cache...`);
    const cacheId = await getCachedContent(genAI, systemPrompt, modelName);

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: buildConfigWithCache(cacheId, temperature, maxTokens),
    });

    let code = response.text?.trim() || '';

    // Extract code from markdown code blocks if present
    const codeBlockRegex = /```(?:tsx?|typescript|jsx?)?\n([\s\S]*?)```/;
    const match = code.match(codeBlockRegex);
    if (match) {
      code = match[1].trim();
    }

    // Replace image placeholders with actual base64 data
    if (generatedImages.size > 0) {
      console.log(`\n🖼️  Embedding ${generatedImages.size} generated image(s)...`);
      for (const [key, imageData] of generatedImages.entries()) {
        const placeholder = `{IMAGE:${key}}`;
        if (code.includes(placeholder)) {
          code = code.replace(new RegExp(placeholder, 'g'), imageData);
          console.log(`   ✅ Embedded image: ${key}`);
        } else {
          console.log(`   ⚠️  Placeholder not found for: ${key}`);
        }
      }
    }

    console.log(`📝 Code generated, running validation...`);

    // Validate the generated code
    const validation = validateTypeScriptCode(code);

    if (!validation.isValid) {
      console.log(`❌ Validation failed with ${validation.errors.length} error(s):`);
      validation.errors.forEach((err: string, i: number) => console.log(`   ${i + 1}. ${err}`));

      // Check if we have retries left
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying generation (${retryCount + 1}/${MAX_RETRIES} retries used)...\n`);

        // RECURSIVE CALL: Retry with error feedback
        // Store errors for the retry prompt
        validation_errors_from_previous_attempt = validation.errors;

        return generateLessonCode(outline, title, retryCount + 1);
      } else {
        // Out of retries
        console.log(`🚫 Maximum retries (${MAX_RETRIES}) exceeded. Giving up.`);
        throw new Error(`Code validation failed after ${MAX_RETRIES} retries:\n${validation.errors.join('\n')}`);
      }
    }

    // Validation passed!
    console.log(`✅ Validation passed! Code is ready.`);
    if (validation.warnings.length > 0) {
      console.log(`⚠️  ${validation.warnings.length} warning(s):`);
      validation.warnings.slice(0, 3).forEach((warn: string, i: number) => console.log(`   ${i + 1}. ${warn}`));
    }

    return code;
  },
  {
    name: 'generate_lesson_code',
    run_type: 'llm',
    metadata: (inputs: any, output: any) => {
      const retryCount = inputs.retryCount || 0;
      const outline = inputs.outline || '';
      const title = inputs.title || '';
      const code = output || '';
      const isRetry = retryCount > 0;

      // Token tracking
      const promptText = outline + title;
      const inputTokens = estimateTokens(promptText);
      const outputTokens = estimateTokens(code);

      // Quality metrics
      const qualityMetrics = code ? analyzeCodeQuality(code) : {
        svg_count: 0,
        button_count: 0,
        input_count: 0,
        has_state: false,
        has_effect: false,
        has_callback: false,
        has_memo: false,
        component_count: 0,
      };

      // Count embedded images (data:image URIs)
      const embeddedImageCount = code ? (code.match(/data:image\//g) || []).length : 0;
      const hasPngImages = code ? code.includes('data:image/png') : false;
      const hasSvgImages = code ? code.includes('data:image/svg') : false;

      return {
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        max_output_tokens: 8192,
        // Retry context
        retry_count: retryCount,
        max_retries: MAX_RETRIES,
        is_retry: isRetry,
        outline_length: outline.length,
        has_validation_errors: isRetry,
        previous_error_count: isRetry ? validation_errors_from_previous_attempt.length : 0,
        previous_errors: isRetry ? validation_errors_from_previous_attempt.slice(0, 3) : [], // First 3 errors
        // Token tracking
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        estimated_cost_usd: 0, // Gemini is free
        // Output quality
        code_length: code.length,
        code_lines: code ? code.split('\n').length : 0,
        ...qualityMetrics,
        // Image generation
        embedded_image_count: embeddedImageCount,
        has_png_images: hasPngImages,
        has_svg_images: hasSvgImages,
        has_any_images: embeddedImageCount > 0,
      };
    },
    tags: [
      process.env.NODE_ENV || 'development',
      'code-generation',
      'llm-call',
    ]
  }
);

// Store validation errors from previous attempt (scoped to this module)
let validation_errors_from_previous_attempt: string[] = [];

/**
 * Main function to generate a complete lesson
 */
export const generateLesson = traceable(
  async function generateLesson(outline: string): Promise<LessonGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`\n🚀 Starting lesson generation for: "${outline}"`);

      // Step 1: Generate title
      console.log(`\n📌 Step 1: Generating lesson title...`);
      const title = await generateLessonTitle(outline);
      console.log(`✅ Title generated: "${title}"`);

      // Step 2: Generate TypeScript/React code with automatic retry on validation errors
      console.log(`\n📌 Step 2: Generating lesson code...`);
      const content = await generateLessonCode(outline, title);
      // Note: No need for additional validation here - generateLessonCode already
      // validates recursively and only returns when code passes all checks

      const duration = Date.now() - startTime;

      console.log(`\n🎉 Lesson generation completed successfully!`);
      console.log(`📊 Title: "${title}"`);
      console.log(`📊 Code length: ${content.length} characters`);
      console.log(`📊 Total duration: ${(duration / 1000).toFixed(2)}s\n`);

      return {
        success: true,
        title,
        content,
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
    name: 'generate_lesson',
    run_type: 'chain',
    metadata: (inputs: any, output: any) => {
      const outline = inputs.outline || '';
      const success = output?.success || false;
      const error = output?.error;
      const content = output?.content || '';
      const contentLength = content.length;

      // Analyze input characteristics
      const inputAnalysis = analyzeInputCharacteristics(outline);

      // Quality metrics for successful generations
      const qualityMetrics = success && content ? analyzeCodeQuality(content) : null;

      // Complexity score
      const lessonComplexity = qualityMetrics ? calculateLessonComplexity(content, qualityMetrics) : null;

      // Enhanced error context
      let errorDetails = null;
      if (!success && error) {
        errorDetails = {
          error_message: error,
          error_type: error.includes('validation') ? 'validation' :
                      error.includes('retries') ? 'max-retries' :
                      error.includes('timeout') ? 'timeout' : 'unknown',
          is_validation_error: error.includes('validation'),
          is_retry_exhausted: error.includes('retries'),
          error_length: error.length,
        };
      }

      return {
        // Enhanced input analysis
        ...inputAnalysis,
        // Outcome
        success,
        has_error: !!error,
        // Output metrics
        output_code_length: contentLength,
        output_code_lines: contentLength > 0 ? content.split('\n').length : 0,
        // Quality metrics (only for successful generations)
        ...(qualityMetrics ? {
          svg_count: qualityMetrics.svg_count,
          button_count: qualityMetrics.button_count,
          input_count: qualityMetrics.input_count,
          has_state: qualityMetrics.has_state,
          has_effect: qualityMetrics.has_effect,
          has_callback: qualityMetrics.has_callback,
          has_memo: qualityMetrics.has_memo,
          component_count: qualityMetrics.component_count,
          is_interactive: qualityMetrics.has_state || qualityMetrics.has_effect,
          has_visuals: qualityMetrics.svg_count > 0,
          lesson_complexity: lessonComplexity,
        } : {}),
        // Error details (only for failures)
        ...(errorDetails || {}),
      };
    },
    tags: [
      process.env.NODE_ENV || 'development',
      'lesson-generation',
      'chain',
    ]
  }
);
