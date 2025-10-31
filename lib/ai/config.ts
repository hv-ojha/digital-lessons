/**
 * AI Configuration
 *
 * Centralized configuration for AI models
 * Easy to modify and extend
 */

import { ModelConfig } from './models/base';

/**
 * Default AI configuration
 */
export const AI_CONFIG = {
  // Primary model for lesson generation
  lessonGeneration: {
    provider: (process.env.AI_PROVIDER || 'gemini') as ModelConfig['provider'],
    modelName: process.env.AI_MODEL_NAME || 'gemini-2.5-flash',
    temperature: 0.3, // Lower for consistent code generation
    maxTokens: 32768, // Increased to allow very large components with lots of content
  },

  // Model for title generation
  titleGeneration: {
    provider: (process.env.AI_PROVIDER || 'gemini') as ModelConfig['provider'],
    modelName: process.env.AI_TITLE_MODEL || 'gemini-2.5-flash',
    temperature: 0.7, // Higher for creative titles
    maxTokens: 100,
  },

  // Model for image generation
  imageGeneration: {
    provider: 'gemini' as const,
    modelName: process.env.AI_IMAGE_MODEL || 'gemini-2.5-flash-image',
    temperature: 0.7,
    maxTokens: 2048,
  },

  // SVG fallback generation
  svgGeneration: {
    provider: (process.env.AI_PROVIDER || 'gemini') as ModelConfig['provider'],
    modelName: process.env.AI_MODEL_NAME || 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 2048,
  },

  // Retry configuration
  retry: {
    maxRetries: 3,
    enabled: true,
  },

  // Feature flags
  features: {
    promptCaching: process.env.ENABLE_PROMPT_CACHING !== 'false', // Default: true (enabled), saves ~90% on input tokens
    svgGeneration: true, // Always enabled - inline SVG in visual blocks
    autoRetry: true,
  },
};

/**
 * Get model configuration for a specific task
 */
export function getModelConfig(task: 'lesson' | 'title' | 'image' | 'svg'): {
  provider: ModelConfig['provider'];
  modelName: string;
  temperature: number;
  maxTokens: number;
} {
  switch (task) {
    case 'lesson':
      return AI_CONFIG.lessonGeneration;
    case 'title':
      return AI_CONFIG.titleGeneration;
    case 'image':
      return AI_CONFIG.imageGeneration;
    case 'svg':
      return AI_CONFIG.svgGeneration;
    default:
      return AI_CONFIG.lessonGeneration;
  }
}

/**
 * Model presets for different use cases
 */
export const MODEL_PRESETS = {
  // Fast and cheap - for simple tasks
  fast: {
    provider: 'gemini' as const,
    modelName: 'gemini-2.5-flash',
    temperature: 0.3,
    maxTokens: 4096,
  },

  // Balanced - default for most tasks
  balanced: {
    provider: 'gemini' as const,
    modelName: 'gemini-2.5-flash',
    temperature: 0.5,
    maxTokens: 32768, // Increased for complex components
  },

  // High quality - for complex tasks
  quality: {
    provider: 'gemini' as const,
    modelName: 'gemini-2.5-pro', // When available
    temperature: 0.3,
    maxTokens: 32768, // Increased for complex components
  },

  // Creative - for titles, descriptions
  creative: {
    provider: 'gemini' as const,
    modelName: 'gemini-2.5-flash',
    temperature: 0.8,
    maxTokens: 2048,
  },
} as const;

/**
 * Environment-based configuration override
 */
export function getEnvironmentConfig(): Partial<typeof AI_CONFIG> {
  const overrides: any = {};

  // Allow environment variable overrides
  if (process.env.AI_TEMPERATURE) {
    const temp = parseFloat(process.env.AI_TEMPERATURE);
    if (!isNaN(temp)) {
      overrides.lessonGeneration = {
        ...AI_CONFIG.lessonGeneration,
        temperature: temp,
      };
    }
  }

  if (process.env.AI_MAX_TOKENS) {
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS);
    if (!isNaN(maxTokens)) {
      overrides.lessonGeneration = {
        ...overrides.lessonGeneration,
        maxTokens,
      };
    }
  }

  return overrides;
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if required API keys are present
  const provider = AI_CONFIG.lessonGeneration.provider;

  if (provider === 'gemini' && !process.env.GEMINI_API_KEY) {
    errors.push('GEMINI_API_KEY is required for Gemini provider');
  }

  if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is required for OpenAI provider');
  }

  if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY is required for Anthropic provider');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
