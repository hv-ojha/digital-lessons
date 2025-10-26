/**
 * OpenAI Model Provider (Placeholder)
 *
 * Future implementation for OpenAI GPT models
 * Implements the same AIModelProvider interface for easy switching
 */

import {
  AIModelProvider,
  GenerationRequest,
  GenerationResponse,
  ModelCapabilities,
} from './base';

export class OpenAIModelProvider extends AIModelProvider {
  constructor(apiKey: string, modelName: string = 'gpt-4') {
    super(apiKey, modelName);
    // TODO: Initialize OpenAI client when needed
    // import OpenAI from 'openai';
    // this.client = new OpenAI({ apiKey });
  }

  /**
   * Generate text completion using OpenAI
   */
  async generateText(request: GenerationRequest): Promise<GenerationResponse> {
    throw new Error('OpenAI provider not yet implemented. Install openai package and implement this method.');

    // Future implementation:
    /*
    const { prompt, systemPrompt, config } = request;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages,
      temperature: config?.temperature,
      max_tokens: config?.maxOutputTokens,
    });

    const text = completion.choices[0].message.content || '';

    return {
      text,
      model: this.modelName,
      tokensUsed: {
        input: completion.usage?.prompt_tokens || 0,
        output: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0,
      },
      finishReason: completion.choices[0].finish_reason,
    };
    */
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
