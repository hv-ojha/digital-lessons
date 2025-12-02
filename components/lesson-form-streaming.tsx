'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';

interface LessonFormStreamingProps {
  onLessonCreated: () => void;
  onSubmit?: () => void; // Called immediately after form submission
}

// Example prompts - memoized constant to prevent recreation
const EXAMPLE_PROMPTS = [
  "A comprehensive guide to photosynthesis with diagrams and examples",
  "A detailed lesson on the American Revolutionary War with timeline",
  "An interactive tutorial on solving quadratic equations step by step"
] as const;

/**
 * Lesson Form Component
 * Submits lesson for background generation (no streaming)
 */
export function LessonFormStreaming({ onLessonCreated, onSubmit }: LessonFormStreamingProps) {
  const [outline, setOutline] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized submit handler - uses non-streaming endpoint for background jobs
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (outline.trim().length < 5) {
      setError('Please enter at least 5 characters for your lesson outline');
      setIsSubmitting(false);
      return;
    }

    try {
      // Use non-streaming endpoint for true background generation
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lesson');
      }

      // Close modal immediately after submission - generation continues in background
      if (onSubmit) {
        onSubmit();
      }

      // Reset form
      setOutline('');
    } catch (error) {
      console.error('Failed to create lesson:', error);
      setError(error instanceof Error ? error.message : 'Failed to create lesson');
    } finally {
      setIsSubmitting(false);
    }
  }, [outline, onSubmit]);

  // Memoized example click handler
  const handleExampleClick = useCallback((example: string) => {
    setOutline(example);
  }, []);

  // Show form
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
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
              AI-powered generation in the background
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Describe what you'd like to learn, and we'll create a comprehensive, detailed lesson in the background.
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
              placeholder="Example: A comprehensive guide to the water cycle with detailed explanations and diagrams"
              className="w-full px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[140px] resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={isSubmitting}
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
          disabled={outline.trim().length < 5 || isSubmitting}
          variant="playful"
          size="xl"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Lesson...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Create Lesson
            </>
          )}
        </Button>
      </form>

      {/* Examples Section */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Try these detailed examples:
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
          Click any example to use it • Lesson will be generated in the background
        </p>
      </div>
    </div>
  );
}
