/**
 * OpenAI Model Provider
 *
 * Implementation for OpenAI GPT models
 * Implements the same AIModelProvider interface for easy switching
 *
 * Note: Requires 'openai' package to be installed
 * Install with: bun add openai
 */

import {
  AIModelProvider,
  GenerationRequest,
  GenerationResponse,
  ModelCapabilities,
} from './base';

// Dynamic import type to avoid errors if openai package is not installed
type OpenAI = any;

export class OpenAIModelProvider extends AIModelProvider {
  private client: OpenAI | null = null;

  constructor(apiKey: string, modelName: string = 'gpt-4o') {
    super(apiKey, modelName);
    this.initializeClient();
  }

  /**
   * Initialize OpenAI client
   * Uses dynamic import to avoid errors if package is not installed
   */
  private async initializeClient(): Promise<void> {
    try {
      const OpenAI = (await import('openai')).default;
      this.client = new OpenAI({ apiKey: this.apiKey });
    } catch (error) {
      console.warn('⚠️  OpenAI package not installed. Install with: bun add openai');
    }
  }

  /**
   * Ensure client is initialized
   */
  private async ensureClient(): Promise<void> {
    if (!this.client) {
      await this.initializeClient();
    }
    if (!this.client) {
      throw new Error(
        'OpenAI client not initialized. Install openai package with: bun add openai'
      );
    }
  }

  /**
   * Generate text completion using OpenAI
   */
  async generateText(request: GenerationRequest): Promise<GenerationResponse> {
    await this.ensureClient();

    const { prompt, systemPrompt, config } = request;

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        messages,
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxOutputTokens,
        top_p: config?.topP,
      });

      const text = completion.choices[0]?.message?.content || '';

      return {
        text,
        model: this.modelName,
        tokensUsed: {
          input: completion.usage?.prompt_tokens || 0,
          output: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
        finishReason: completion.choices[0]?.finish_reason || 'stop',
      };
    } catch (error) {
      console.error('❌ OpenAI API call failed:', error);
      throw new Error(
        `OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'openai';
  }

  /**
   * Get model capabilities
   */
  getCapabilities(): ModelCapabilities {
    return {
      textGeneration: true,
      imageGeneration: false, // GPT-4 doesn't generate images
      codeGeneration: true,
      maxTokens: 8192, // Depends on model
      supportsSystemPrompt: true,
    };
  }
}
