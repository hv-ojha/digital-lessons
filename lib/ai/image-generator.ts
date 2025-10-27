/**
 * Image Generation Module
 *
 * Uses Gemini 2.5 Flash Image for AI-generated images
 * Fallback to enhanced SVG generation if needed
 */

import { GoogleGenAI } from '@google/genai';
import { traceable } from 'langsmith/traceable';
import { Client } from 'langsmith';

// Initialize LangSmith client for image generation traces
let langsmithClient: Client | null = null;
if (process.env.LANGCHAIN_TRACING_V2 === 'true' && process.env.LANGSMITH_API_KEY) {
  try {
    langsmithClient = new Client({
      apiKey: process.env.LANGSMITH_API_KEY,
      apiUrl: process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com',
    });
  } catch (error) {
    console.warn('⚠️  Failed to initialize LangSmith client for image generation:', error);
  }
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is required for image generation');
}

// New unified SDK for both image and text generation
const genAI = new GoogleGenAI({ apiKey: apiKey! });

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'illustration' | 'diagram';
  subject?: string; // e.g., 'animal', 'person', 'place', 'object'
}

export interface ImageGenerationResult {
  success: boolean;
  imageData?: string; // Base64 encoded image
  imageType?: 'png' | 'svg';
  error?: string;
  width?: number;
  height?: number;
}

/**
 * Generate image using Gemini 2.5 Flash Image
 *
 * Priority:
 * 1. Try Gemini 2.5 Flash Image (realistic AI-generated images)
 * 2. Fallback to enhanced SVG generation
 */
export const generateImage = traceable(
  async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      console.log(`🎨 Generating image with Gemini 2.5 Flash Image: "${request.prompt}"`);

      // Try Gemini 2.5 Flash Image first
      try {
        const imageData = await generateWithGemini25FlashImage(request);
        return {
          success: true,
          imageData,
          imageType: 'png',
          width: 1024,
          height: 1024,
        };
      } catch (imageError) {
        console.warn('⚠️  Gemini 2.5 Flash Image failed, falling back to SVG:', imageError);

        // Fallback to enhanced SVG
        const svg = await generateEnhancedSVG(request);
        return {
          success: true,
          imageData: svg,
          imageType: 'svg',
          width: 400,
          height: 400,
        };
      }
    } catch (error) {
      console.error('❌ Image generation failed completely:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  {
    name: 'generate_image',
    run_type: 'llm',
    ...(langsmithClient ? { client: langsmithClient } : {}),
  }
);

/**
 * Generate image using Gemini 2.5 Flash Image model
 */
async function generateWithGemini25FlashImage(request: ImageGenerationRequest): Promise<string> {
  // Build enhanced prompt based on style
  let enhancedPrompt = request.prompt;

  if (request.style === 'cartoon') {
    enhancedPrompt += ', cartoon style, colorful, kid-friendly, educational';
  } else if (request.style === 'realistic') {
    enhancedPrompt += ', realistic, high quality, educational';
  } else if (request.style === 'illustration') {
    enhancedPrompt += ', illustration style, clear, educational, child-appropriate';
  } else if (request.style === 'diagram') {
    enhancedPrompt += ', educational diagram, clear labels, simple and informative';
  }

  console.log(`📝 Enhanced prompt: "${enhancedPrompt}"`);

  // Generate image using new @google/genai SDK
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: enhancedPrompt,
  });

  // Extract image data from response parts
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('No candidates returned from Gemini 2.5 Flash Image');
  }

  const candidate = response.candidates[0];
  if (!candidate.content || !candidate.content.parts) {
    throw new Error('No content in Gemini 2.5 Flash Image response');
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      // Image data is already base64 encoded
      const base64Data = part.inlineData.data;
      console.log('✅ Image generated successfully');

      // Return as data URI for embedding in HTML
      return `data:image/png;base64,${base64Data}`;
    }
  }

  // If no image data found in response, throw error
  throw new Error('No image data found in Gemini 2.5 Flash Image response');
}

/**
 * Generate enhanced SVG illustration using Gemini
 */
async function generateEnhancedSVG(request: ImageGenerationRequest): Promise<string> {
  const style = request.style || 'illustration';
  const prompt = `You are an expert SVG artist creating educational illustrations for children.

Create a detailed, colorful SVG illustration for: "${request.prompt}"

Style: ${style}
${request.subject ? `Subject type: ${request.subject}` : ''}

Requirements:
1. Output ONLY the SVG code, no explanations
2. Make it kid-friendly and engaging
3. Use bright, educational colors
4. Size: viewBox="0 0 400 400"
5. Include details but keep it simple enough for children
6. Add subtle shadows/gradients for depth
7. Make it self-contained (all defs inside)

Example format:
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- gradients, patterns -->
  </defs>
  <!-- shapes and elements -->
</svg>

Generate the SVG now:`;

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  let svg = response.text?.trim() || '';

  // Extract SVG from markdown if present
  const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/i);
  if (svgMatch) {
    svg = svgMatch[0];
  }

  return svg;
}

/**
 * Extract image requirements from lesson outline
 */
export function extractImageRequirements(outline: string): ImageGenerationRequest[] {
  const requirements: ImageGenerationRequest[] = [];
  const lower = outline.toLowerCase();

  // Detect if images are needed
  const needsImages =
    lower.includes('image') ||
    lower.includes('picture') ||
    lower.includes('diagram') ||
    lower.includes('illustration') ||
    lower.includes('visual') ||
    lower.includes('photo');

  if (!needsImages) {
    return requirements;
  }

  // Detect subject type
  const isAnimal = lower.includes('animal') ||
                   lower.match(/\b(dog|cat|lion|tiger|elephant|bird|fish)\b/);
  const isPerson = lower.includes('person') || lower.includes('people') ||
                   lower.includes('historical figure');
  const isPlace = lower.includes('place') || lower.includes('country') ||
                  lower.includes('city') || lower.includes('geography');
  const isScience = lower.includes('science') || lower.includes('physics') ||
                    lower.includes('chemistry') || lower.includes('biology');

  // Extract specific subjects if mentioned
  const animals = ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'dog', 'cat',
                   'bird', 'fish', 'whale', 'dolphin', 'bear', 'fox'];

  for (const animal of animals) {
    if (lower.includes(animal)) {
      requirements.push({
        prompt: `A friendly cartoon ${animal} for educational content`,
        style: 'cartoon',
        subject: 'animal',
      });
    }
  }

  // If no specific subjects found, add generic image
  if (requirements.length === 0 && needsImages) {
    let subject = 'illustration';
    let style: 'realistic' | 'cartoon' | 'illustration' | 'diagram' = 'illustration';

    if (isAnimal) {
      subject = 'animal';
      style = 'cartoon';
    } else if (isPerson) {
      subject = 'person';
      style = 'illustration';
    } else if (isPlace) {
      subject = 'place';
      style = 'realistic';
    } else if (isScience) {
      subject = 'diagram';
      style = 'diagram';
    }

    requirements.push({
      prompt: `Educational ${subject} illustration`,
      style,
      subject,
    });
  }

  return requirements.slice(0, 3); // Max 3 images per lesson
}

/**
 * Future: Imagen 3 integration
 * Uncomment when Vertex AI is set up
 */
/*
import { ImageAnnotatorClient } from '@google-cloud/vision';

async function generateWithImagen(request: ImageGenerationRequest): Promise<string> {
  // Initialize Vertex AI client
  const client = new ImageAnnotatorClient();

  // Generate image with Imagen 3
  const [response] = await client.generateImage({
    prompt: request.prompt,
    style: request.style,
    numberOfImages: 1,
  });

  // Convert to Base64
  const base64Image = response.image.toString('base64');
  return `data:image/png;base64,${base64Image}`;
}
*/
