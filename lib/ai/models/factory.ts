/**
 * Model Factory
 *
 * Factory pattern to create AI model instances based on configuration
 * Allows easy switching between different providers
 */

import { AIModelProvider, ModelConfig } from './base';
import { GeminiModelProvider } from './gemini';
import { OpenAIModelProvider } from './openai';

/**
 * Create an AI model provider instance based on configuration
 */
export function createModelProvider(config: ModelConfig): AIModelProvider {
  const { provider, modelName, apiKey } = config;

  switch (provider) {
    case 'gemini':
      return new GeminiModelProvider(apiKey, modelName);

    case 'openai':
      return new OpenAIModelProvider(apiKey, modelName);

    case 'anthropic':
      throw new Error('Anthropic provider not yet implemented');

    case 'custom':
      throw new Error('Custom provider not yet implemented');

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Create model provider from environment variables
 */
export function createModelProviderFromEnv(): AIModelProvider {
  const provider = (process.env.AI_PROVIDER || 'gemini') as ModelConfig['provider'];
  const modelName = process.env.AI_MODEL_NAME || getDefaultModelForProvider(provider);
  const apiKey = getApiKeyForProvider(provider);

  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}`);
  }

  return createModelProvider({
    provider,
    modelName,
    apiKey,
  });
}

/**
 * Get default model name for each provider
 */
function getDefaultModelForProvider(provider: ModelConfig['provider']): string {
  switch (provider) {
    case 'gemini':
      return 'gemini-2.5-flash';
    case 'openai':
      return 'gpt-4';
    case 'anthropic':
      return 'claude-3-5-sonnet-20241022';
    default:
      return 'gemini-2.5-flash';
  }
}

/**
 * Get API key for each provider from environment variables
 */
function getApiKeyForProvider(provider: ModelConfig['provider']): string | undefined {
  switch (provider) {
    case 'gemini':
      return process.env.GEMINI_API_KEY;
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    default:
      return process.env.GEMINI_API_KEY;
  }
}

/**
 * Model registry for caching instances
 */
const modelRegistry = new Map<string, AIModelProvider>();

/**
 * Get or create a model provider (singleton per configuration)
 */
export function getModelProvider(config?: ModelConfig): AIModelProvider {
  const cacheKey = config
    ? `${config.provider}-${config.modelName}`
    : 'default';

  if (modelRegistry.has(cacheKey)) {
    return modelRegistry.get(cacheKey)!;
  }

  const provider = config
    ? createModelProvider(config)
    : createModelProviderFromEnv();

  modelRegistry.set(cacheKey, provider);
  return provider;
}

/**
 * Clear model registry (useful for testing)
 */
export function clearModelRegistry(): void {
  modelRegistry.clear();
}
