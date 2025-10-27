import { GoogleGenAI } from '@google/genai';
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
  const errorMsg = '❌ CRITICAL: GEMINI_API_KEY is not set in environment variables. Please configure it in your deployment settings.';
  console.error(errorMsg);
  console.error('Environment variables available:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
  throw new Error('GEMINI_API_KEY is required. Please set it in your environment variables.');
} else {
  console.log('✅ GEMINI_API_KEY is loaded:', apiKey.substring(0, 20) + '... (length: ' + apiKey.length + ')');
}

let genAI: GoogleGenAI;
try {
  genAI = new GoogleGenAI({ apiKey: apiKey });
  console.log('✅ GoogleGenAI client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenAI client:', error);
  throw new Error(`Failed to initialize GoogleGenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

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
async function generateLessonTitle(outline: string): Promise<string> {
    const modelName = 'gemini-2.5-flash';
    const temperature = 0.7;
    const maxTokens = 100;

    const prompt = `You are a helpful assistant that creates short, engaging titles for educational lessons aimed at children. Keep titles under 60 characters and make them fun and engaging.

Create a short, fun title for this lesson outline: "${outline}"

Return ONLY the title, nothing else.`;

    let response;
    try {
      response = await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });
    } catch (error) {
      console.error('❌ Gemini API call failed for title generation:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        modelName,
        promptLength: prompt.length,
      });
      throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const title = response.text?.trim() || 'Untitled Lesson';

    return title;
}

/**
 * Generate TypeScript/React code for the lesson with automatic retry on validation errors
 *
 * This function will automatically retry up to MAX_RETRIES times if validation fails,
 * providing the AI with specific error feedback each time.
 */
const MAX_RETRIES = 3; // Increased from 2 for better reliability

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

    let response;
    try {
      console.log(`🔄 Calling Gemini API for lesson code generation...`);
      console.log(`   Model: ${modelName}`);
      console.log(`   Prompt length: ${fullPrompt.length} chars (~${Math.round(fullPrompt.length / 4)} tokens)`);
      console.log(`   Temperature: ${temperature}`);
      console.log(`   Max tokens: ${maxTokens}`);

      response = await genAI.models.generateContent({
        model: modelName,
        contents: fullPrompt,
        config: buildConfigWithCache(cacheId, temperature, maxTokens),
      });

      console.log(`✅ Gemini API call successful`);
    } catch (error) {
      console.error(`❌ Gemini API call failed for lesson code generation (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        modelName,
        promptLength: fullPrompt.length,
        retryCount,
      });

      // If it's a network/API error and we have retries left, throw to trigger retry
      if (retryCount < MAX_RETRIES) {
        throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        // Out of retries, throw final error
        throw new Error(`Gemini API call failed after ${MAX_RETRIES} retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

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
}

// Store validation errors from previous attempt (scoped to this module)
let validation_errors_from_previous_attempt: string[] = [];

/**
 * Main function to generate a complete lesson
 */
export async function generateLesson(outline: string): Promise<LessonGenerationResult> {
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
}
