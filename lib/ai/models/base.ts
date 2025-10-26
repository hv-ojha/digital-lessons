/**
 * Base interface for all AI model providers
 *
 * This abstraction allows us to:
 * - Switch models on the fly
 * - A/B test different providers
 * - Fallback to different models on failure
 * - Route to cheaper models for simple tasks
 */

export interface GenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GenerationRequest {
  prompt: string;
  systemPrompt?: string;
  config?: GenerationConfig;
}

export interface GenerationResponse {
  text: string;
  model: string;
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
  finishReason?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'illustration' | 'diagram';
  subject?: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageData?: string; // Base64 encoded
  imageType?: 'png' | 'jpg' | 'svg';
  error?: string;
  width?: number;
  height?: number;
}

/**
 * Abstract base class for AI model providers
 */
export abstract class AIModelProvider {
  protected apiKey: string;
  protected modelName: string;

  constructor(apiKey: string, modelName: string) {
    if (!apiKey) {
      throw new Error('API key is required for AI model provider');
    }
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  /**
   * Generate text completion
   */
  abstract generateText(request: GenerationRequest): Promise<GenerationResponse>;

  /**
   * Generate image (optional - not all providers support this)
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('Image generation not supported by this provider');
  }

  /**
   * Get the current model name
   */
  getModelName(): string {
    return this.modelName;
  }

  /**
   * Check if provider supports image generation
   */
  supportsImageGeneration(): boolean {
    return false;
  }

  /**
   * Estimate token count (provider-specific)
   */
  estimateTokens(text: string): number {
    // Default rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

/**
 * Model configuration options
 */
export interface ModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  modelName: string;
  apiKey: string;
  fallbackModel?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  textGeneration: boolean;
  imageGeneration: boolean;
  codeGeneration: boolean;
  maxTokens: number;
  supportsSystemPrompt: boolean;
}
