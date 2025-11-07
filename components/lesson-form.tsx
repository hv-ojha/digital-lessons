'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Plus, Lightbulb } from 'lucide-react';

interface LessonFormProps {
  onLessonCreated: () => void;
}

// Example prompts - memoized constant to prevent recreation
const EXAMPLE_PROMPTS = [
  "A one-pager on how to divide with long division",
  "An explanation of how the Cartesian Grid works",
  "A test on counting numbers from 1 to 100"
] as const;

/**
 * Optimized Lesson Form Component
 * - Uses useCallback to memoize event handlers
 * - Extracts examples as constants
 * - Prevents unnecessary re-renders
 */
export function LessonForm({ onLessonCreated }: LessonFormProps) {
  const [outline, setOutline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (outline.trim().length < 5) {
      setError('Please enter at least 5 characters for your lesson outline');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline }),
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      // Clear form and stop loading immediately after lesson is created in DB
      setOutline('');
      setIsGenerating(false);

      // Notify parent component
      onLessonCreated();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsGenerating(false);
    }
  }, [outline, onLessonCreated]);

  // Memoized example click handler
  const handleExampleClick = useCallback((example: string) => {
    setOutline(example);
  }, []);

  // Show generating state
  if (isGenerating) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 md:p-12 text-center">
        {/* Loading Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" />
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Creating Your Lesson!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Your personalized lesson is being prepared. This usually takes just a few moments!
        </p>

        {/* Estimated time */}
        <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-6 py-3 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-purple-800 dark:text-purple-300">Adding to your lessons...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header - Clean and Focused */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create New Lesson
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered learning experience
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Describe what you'd like to learn, and we'll create a personalized, interactive lesson for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="outline"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4 text-purple-500" />
            What would you like to learn?
          </label>
          <div className="relative">
            <textarea
              id="outline"
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="Example: A 10 question pop quiz on Florida's history and geography"
              className="w-full px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[140px] resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={isGenerating}
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded">
              {outline.length}/500
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={outline.trim().length < 5}
          variant="playful"
          size="xl"
          className="w-full"
        >
          <Plus className="w-5 h-5" />
          Generate Lesson
        </Button>
      </form>

      {/* Examples Section - Simplified */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Need inspiration?
          </h3>
        </div>
        <div className="space-y-2">
          {EXAMPLE_PROMPTS.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors group"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {example}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 text-center">
          Click any example to use it
        </p>
      </div>
    </div>
  );
}
