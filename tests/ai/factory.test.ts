/**
 * Tests for AI Model Factory
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createModelProvider,
  clearModelRegistry,
  getModelProvider,
} from '@/lib/ai/models/factory';
import { GeminiModelProvider } from '@/lib/ai/models/gemini';
import { OpenAIModelProvider } from '@/lib/ai/models/openai';

describe('AI Model Factory', () => {
  beforeEach(() => {
    clearModelRegistry();
  });

  describe('createModelProvider', () => {
    it('should create Gemini provider', () => {
      const provider = createModelProvider({
        provider: 'gemini',
        modelName: 'gemini-2.5-flash',
        apiKey: 'test-key',
      });

      expect(provider).toBeInstanceOf(GeminiModelProvider);
      expect(provider.getModelName()).toBe('gemini-2.5-flash');
      expect(provider.getProviderName()).toBe('gemini');
    });

    it('should create OpenAI provider', () => {
      const provider = createModelProvider({
        provider: 'openai',
        modelName: 'gpt-4o',
        apiKey: 'test-key',
      });

      expect(provider).toBeInstanceOf(OpenAIModelProvider);
      expect(provider.getModelName()).toBe('gpt-4o');
      expect(provider.getProviderName()).toBe('openai');
    });

    it('should throw error for unsupported provider', () => {
      expect(() =>
        createModelProvider({
          provider: 'anthropic',
          modelName: 'claude-3',
          apiKey: 'test-key',
        })
      ).toThrow('Anthropic provider not yet implemented');
    });
  });

  describe('getModelProvider', () => {
    it('should cache provider instances', () => {
      const provider1 = getModelProvider({
        provider: 'gemini',
        modelName: 'gemini-2.5-flash',
        apiKey: 'test-key',
      });

      const provider2 = getModelProvider({
        provider: 'gemini',
        modelName: 'gemini-2.5-flash',
        apiKey: 'test-key',
      });

      // Should return same instance
      expect(provider1).toBe(provider2);
    });

    it('should create different instances for different configs', () => {
      const provider1 = getModelProvider({
        provider: 'gemini',
        modelName: 'gemini-2.5-flash',
        apiKey: 'test-key',
      });

      const provider2 = getModelProvider({
        provider: 'openai',
        modelName: 'gpt-4o',
        apiKey: 'test-key',
      });

      expect(provider1).not.toBe(provider2);
    });
  });

  describe('clearModelRegistry', () => {
    it('should clear cached providers', () => {
      const provider1 = getModelProvider({
        provider: 'gemini',
        modelName: 'gemini-2.5-flash',
        apiKey: 'test-key',
      });

      clearModelRegistry();

      const provider2 = getModelProvider({
        provider: 'gemini',
        modelName: 'gemini-2.5-flash',
        apiKey: 'test-key',
      });

      // Should be different instances after clearing
      expect(provider1).not.toBe(provider2);
    });
  });
});
