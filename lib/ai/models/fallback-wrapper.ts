/**
 * Fallback Wrapper for AI Model Providers
 *
 * Provides automatic fallback to alternative providers when primary fails
 * Useful for production resilience
 */

import {
  AIModelProvider,
  GenerationRequest,
  GenerationResponse,
  StreamGenerationRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from './base';

export interface FallbackConfig {
  primary: AIModelProvider;
  fallbacks: AIModelProvider[];
  maxRetries?: number;
  retryDelay?: number; // ms
}

export class FallbackAIProvider extends AIModelProvider {
  private primary: AIModelProvider;
  private fallbacks: AIModelProvider[];
  private maxRetries: number;
  private retryDelay: number;
  private providerMetrics: Map<
    string,
    { requests: number; errors: number; totalTime: number }
  >;

  constructor(config: FallbackConfig) {
    // Initialize base class with primary provider's details
    super(
      config.primary['apiKey'],
      config.primary.getModelName()
    );

    this.primary = config.primary;
    this.fallbacks = config.fallbacks;
    this.maxRetries = config.maxRetries ?? 2;
    this.retryDelay = config.retryDelay ?? 1000;
    this.providerMetrics = new Map();

    // Initialize metrics for all providers
    this.initializeMetrics();
  }

  private initializeMetrics() {
    const allProviders = [this.primary, ...this.fallbacks];
    allProviders.forEach((provider) => {
      const name = provider.getProviderName();
      this.providerMetrics.set(name, {
        requests: 0,
        errors: 0,
        totalTime: 0,
      });
    });
  }

  getProviderName(): string {
    return `fallback(${this.primary.getProviderName()})`;
  }

  /**
   * Attempt generation with fallback logic
   */
  async generateText(request: GenerationRequest): Promise<GenerationResponse> {
    const providers = [this.primary, ...this.fallbacks];
    let lastError: Error | null = null;

    for (const provider of providers) {
      const providerName = provider.getProviderName();
      const startTime = Date.now();

      try {
        console.log(`🔄 Attempting generation with ${providerName}...`);

        const response = await provider.generateText(request);

        // Record successful metrics
        const metrics = this.providerMetrics.get(providerName)!;
        metrics.requests++;
        metrics.totalTime += Date.now() - startTime;

        console.log(`✅ ${providerName} succeeded`);

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Record error metrics
        const metrics = this.providerMetrics.get(providerName)!;
        metrics.errors++;

        console.warn(
          `❌ ${providerName} failed:`,
          error instanceof Error ? error.message : error
        );

        // If this is not the last provider, wait before trying next
        if (provider !== providers[providers.length - 1]) {
          console.log(`⏳ Waiting ${this.retryDelay}ms before trying next provider...`);
          await this.sleep(this.retryDelay);
        }
      }
    }

    // All providers failed
    throw new Error(
      `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Attempt streaming generation with fallback logic
   */
  async generateTextStream(request: StreamGenerationRequest): Promise<GenerationResponse> {
    const providers = [this.primary, ...this.fallbacks];
    let lastError: Error | null = null;

    for (const provider of providers) {
      const providerName = provider.getProviderName();
      const startTime = Date.now();

      try {
        console.log(`🔄 Attempting streaming generation with ${providerName}...`);

        const response = await provider.generateTextStream(request);

        // Record successful metrics
        const metrics = this.providerMetrics.get(providerName)!;
        metrics.requests++;
        metrics.totalTime += Date.now() - startTime;

        console.log(`✅ ${providerName} streaming succeeded`);

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Record error metrics
        const metrics = this.providerMetrics.get(providerName)!;
        metrics.errors++;

        console.warn(
          `❌ ${providerName} streaming failed:`,
          error instanceof Error ? error.message : error
        );

        // If this is not the last provider, wait before trying next
        if (provider !== providers[providers.length - 1]) {
          console.log(`⏳ Waiting ${this.retryDelay}ms before trying next provider...`);
          await this.sleep(this.retryDelay);
        }
      }
    }

    // All providers failed
    throw new Error(
      `All AI providers failed for streaming. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Health check all providers
   */
  async healthCheck(): Promise<boolean> {
    const providers = [this.primary, ...this.fallbacks];
    const results = await Promise.all(
      providers.map((p) =>
        p.healthCheck().catch(() => false)
      )
    );

    // At least one provider must be healthy
    return results.some((r) => r);
  }

  /**
   * Get metrics for all providers
   */
  getMetrics() {
    const metrics: Record<string, any> = {};

    this.providerMetrics.forEach((data, provider) => {
      const avgTime =
        data.requests > 0 ? data.totalTime / data.requests : 0;
      const errorRate =
        data.requests > 0 ? (data.errors / data.requests) * 100 : 0;

      metrics[provider] = {
        requests: data.requests,
        errors: data.errors,
        avgResponseTime: Math.round(avgTime),
        errorRate: Math.round(errorRate * 100) / 100,
      };
    });

    return metrics;
  }

  /**
   * Get status of all providers
   */
  getProviderStatuses() {
    const providers = [this.primary, ...this.fallbacks];
    return providers.map((p) => ({
      provider: p.getProviderName(),
      model: p.getModelName(),
      health: p.getHealthStatus(),
    }));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create a fallback provider with automatic failover
 *
 * Example usage:
 * ```typescript
 * const provider = createFallbackProvider({
 *   primary: geminiProvider,
 *   fallbacks: [openaiProvider],
 *   maxRetries: 2,
 *   retryDelay: 1000
 * });
 * ```
 */
export function createFallbackProvider(
  config: FallbackConfig
): FallbackAIProvider {
  return new FallbackAIProvider(config);
}
