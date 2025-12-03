/**
 * Gemini AI Model Provider
 *
 * Implements the AIModelProvider interface for Google Gemini models
 */

import { GoogleGenAI } from '@google/genai';
import {
  AIModelProvider,
  GenerationRequest,
  GenerationResponse,
  StreamGenerationRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ModelCapabilities,
} from './base';

export class GeminiModelProvider extends AIModelProvider {
  private client: GoogleGenAI;
  private imageModelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.5-flash', imageModelName: string = 'gemini-2.5-flash-image') {
    super(apiKey, modelName);
    this.client = new GoogleGenAI({ apiKey });
    this.imageModelName = imageModelName;
  }

  /**
   * Generate text completion using Gemini
   */
  async generateText(request: GenerationRequest): Promise<GenerationResponse> {
    const { prompt, systemPrompt, config } = request;

    // Combine system prompt and user prompt
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: fullPrompt,
      config: {
        temperature: config?.temperature,
        maxOutputTokens: config?.maxOutputTokens,
        topP: config?.topP,
        topK: config?.topK,
      },
    });

    // Extract finish reason to detect truncation
    let finishReason = 'stop';
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      finishReason = candidate.finishReason?.toLowerCase() || 'stop';
    }

    // Debug: Check response structure
    console.log('🔍 [DEBUG] Gemini response structure:', {
      hasText: !!response.text,
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length,
      firstCandidate: response.candidates?.[0] ? 'exists' : 'missing',
      finishReason,
    });

    // Extract text from response - Gemini SDK provides convenience property
    let text = '';

    if (response.text) {
      // Convenience property exists
      text = response.text.trim();
    } else if (response.candidates && response.candidates.length > 0) {
      // Fallback: extract from candidates
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        if (part.text) {
          text = part.text.trim();
        }
      }
    }

    console.log('🔍 [DEBUG] Extracted text:', {
      textLength: text.length,
      preview: text.substring(0, 100),
      finishReason,
    });

    // Warn if response was truncated
    if (finishReason === 'max_tokens' || finishReason === 'length') {
      console.warn('⚠️  [GEMINI] Response was truncated!');
      console.warn(`   Finish reason: ${finishReason}`);
      console.warn(`   Requested maxOutputTokens: ${config?.maxOutputTokens}`);
      console.warn(`   Response length: ${text.length} chars (~${this.estimateTokens(text)} tokens)`);
      console.warn(`   Input length: ${fullPrompt.length} chars (~${this.estimateTokens(fullPrompt)} tokens)`);
      console.warn(`   📝 NOTE: If output tokens << maxOutputTokens, this may be a context window issue.`);
      console.warn(`   📝 Total tokens (input + output) might exceed model's context window.`);
    }

    // Estimate tokens (Gemini doesn't return exact counts in response)
    const inputTokens = this.estimateTokens(fullPrompt);
    const outputTokens = this.estimateTokens(text);

    return {
      text: text || '',
      model: this.modelName,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      finishReason,
    };
  }

  /**
   * Generate text with streaming support using Gemini
   */
  async generateTextStream(request: StreamGenerationRequest): Promise<GenerationResponse> {
    const { prompt, systemPrompt, config, onChunk } = request;

    // Combine system prompt and user prompt
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    let accumulatedText = '';
    let finishReason = 'stop';

    try {
      // Use Gemini's streaming API - correct method is generateContentStream
      const stream = await this.client.models.generateContentStream({
        model: this.modelName,
        contents: fullPrompt,
        config: {
          temperature: config?.temperature,
          maxOutputTokens: config?.maxOutputTokens,
          topP: config?.topP,
          topK: config?.topK,
        },
      });

      // Process each chunk from the stream
      for await (const chunk of stream) {
        let chunkText = '';

        // Extract text from chunk
        if (chunk.text) {
          chunkText = chunk.text;
        } else if (chunk.candidates && chunk.candidates.length > 0) {
          const candidate = chunk.candidates[0];
          if (candidate.content?.parts?.[0]?.text) {
            chunkText = candidate.content.parts[0].text;
          }

          // Check finish reason from candidate
          if (candidate.finishReason) {
            finishReason = candidate.finishReason.toLowerCase();
          }
        }

        // Accumulate text
        accumulatedText += chunkText;

        // Call the chunk callback
        await onChunk({
          text: chunkText,
          isComplete: false,
          finishReason: undefined,
        });
      }

      // Warn if response was truncated
      if (finishReason === 'max_tokens' || finishReason === 'length') {
        console.warn('⚠️  [GEMINI STREAM] Response was truncated due to token limit!');
        console.warn(`   Requested maxOutputTokens: ${config?.maxOutputTokens}`);
        console.warn(`   Response length: ${accumulatedText.length} chars (~${this.estimateTokens(accumulatedText)} tokens)`);
      }

      // Send final chunk with completion flag
      await onChunk({
        text: '',
        isComplete: true,
        finishReason,
      });

      // Estimate tokens
      const inputTokens = this.estimateTokens(fullPrompt);
      const outputTokens = this.estimateTokens(accumulatedText);

      return {
        text: accumulatedText.trim(),
        model: this.modelName,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        finishReason,
      };
    } catch (error) {
      console.error('[GEMINI STREAM] Error during streaming:', error);

      // Send error completion
      await onChunk({
        text: '',
        isComplete: true,
        finishReason: 'error',
      });

      throw error;
    }
  }

  /**
   * Generate image using Gemini Image model
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
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

      const response = await this.client.models.generateContent({
        model: this.imageModelName,
        contents: enhancedPrompt,
      });

      // Extract image data from response
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No candidates returned from image generation');
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error('No content in image generation response');
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          return {
            success: true,
            imageData: `data:image/png;base64,${base64Data}`,
            imageType: 'png',
            width: request.width || 1024,
            height: request.height || 1024,
          };
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate SVG fallback using text model
   */
  async generateSVG(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
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

    try {
      const response = await this.generateText({
        prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      let svg = response.text;

      // Extract SVG from markdown if present
      const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/i);
      if (svgMatch) {
        svg = svgMatch[0];
      }

      return {
        success: true,
        imageData: svg,
        imageType: 'svg',
        width: 400,
        height: 400,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'gemini';
  }

  /**
   * Check if this provider supports image generation
   */
  supportsImageGeneration(): boolean {
    return true;
  }

  /**
   * Get model capabilities
   */
  getCapabilities(): ModelCapabilities {
    return {
      textGeneration: true,
      imageGeneration: true,
      codeGeneration: true,
      maxTokens: 32768, // Gemini 2.5 Flash supports up to 32K output tokens
      supportsSystemPrompt: true, // Via prompt combination
    };
  }

  /**
   * Set a different image model
   */
  setImageModel(modelName: string): void {
    this.imageModelName = modelName;
  }

  /**
   * Get current image model name
   */
  getImageModelName(): string {
    return this.imageModelName;
  }
}
