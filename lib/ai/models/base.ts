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

/**
 * Callback for streaming chunks
 */
export type StreamChunkCallback = (chunk: {
  text: string;
  isComplete: boolean;
  finishReason?: string;
}) => void | Promise<void>;

/**
 * Request for streaming generation
 */
export interface StreamGenerationRequest extends GenerationRequest {
  onChunk: StreamChunkCallback;
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
  protected lastHealthCheck: Date | null = null;
  protected isHealthy: boolean = true;

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
   * Generate text with streaming support
   * Returns the complete text after streaming is done
   */
  abstract generateTextStream(request: StreamGenerationRequest): Promise<GenerationResponse>;

  /**
   * Generate image (optional - not all providers support this)
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error('Image generation not supported by this provider');
  }

  /**
   * Health check - verify provider is accessible
   * Should be overridden by provider implementations for better performance
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple test with minimal tokens
      const response = await this.generateText({
        prompt: 'test',
        config: { maxOutputTokens: 10 },
      });
      this.isHealthy = !!response.text;
      this.lastHealthCheck = new Date();
      return this.isHealthy;
    } catch (error) {
      console.warn(`Health check failed for ${this.modelName}:`, error);
      this.isHealthy = false;
      this.lastHealthCheck = new Date();
      return false;
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): { isHealthy: boolean; lastCheck: Date | null } {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
    };
  }

  /**
   * Get the current model name
   */
  getModelName(): string {
    return this.modelName;
  }

  /**
   * Get provider name (must be implemented by subclasses)
   */
  abstract getProviderName(): string;

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
