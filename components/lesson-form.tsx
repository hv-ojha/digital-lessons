'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SparklyMascot } from '@/components/ui/sparky-mascot';
import { Sparkles, Loader2, Plus, Lightbulb } from 'lucide-react';

interface LessonFormProps {
  onLessonCreated: () => void;
}

export function LessonForm({ onLessonCreated }: LessonFormProps) {
  const [outline, setOutline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  // Show generating state with Sparky in center
  if (isGenerating) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 md:p-12 text-center animate-bounce-in">
        <SparklyMascot mood="thinking" size="xl" animate />
        <h2 className="font-display text-3xl md:text-4xl font-bold gradient-text-magic mt-6 mb-4">
          Sparky is Creating Your Lesson!
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto">
          Hold tight! Your personalized learning adventure is being crafted just for you...
        </p>
        <div className="flex items-center justify-center gap-2 text-purple-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-semibold">Adding to your lessons...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-8 md:p-10 animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-block mb-4">
          <Sparkles className="w-16 h-16 text-purple-500 animate-float" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold gradient-text-rainbow mb-3">
          Create Your Lesson
        </h2>
        <p className="text-lg text-gray-700">
          Tell us what you want to learn, and we'll craft a personalized lesson just for you! ✨
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="outline"
            className="block font-display text-xl font-bold text-gray-800 flex items-center gap-2"
          >
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            What would you like to learn?
          </label>
          <div className="relative">
            <textarea
              id="outline"
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="Example: A 10 question pop quiz on Florida's history and geography"
              className="w-full px-6 py-5 text-lg text-gray-900 bg-white border-3 border-purple-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-200 min-h-[160px] resize-none placeholder:text-gray-400 shadow-inner font-body"
              disabled={isGenerating}
              maxLength={500}
            />
            <div className="absolute bottom-4 right-4 bg-purple-100 text-purple-700 font-semibold text-sm px-3 py-1 rounded-full">
              {outline.length}/500
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 animate-wiggle">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-base text-red-700 font-semibold">
                {error}
              </p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={outline.trim().length < 5}
          variant="playful"
          size="xl"
          className="w-full"
        >
          <Plus className="w-6 h-6" />
          Generate Lesson
        </Button>
      </form>

      <div className="mt-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 shadow-playful">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-md">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold text-gray-800 mb-4">
              Need inspiration? Try these examples! 💡
            </h3>
            <ul className="space-y-3">
              <li
                className="flex gap-3 items-center p-3 bg-white/80 rounded-xl group cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => setOutline("A one-pager on how to divide with long division")}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-150 transition-transform"></div>
                <span className="text-base text-gray-700 group-hover:text-purple-700 font-medium transition-colors flex-1">
                  A one-pager on how to divide with long division
                </span>
                <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li
                className="flex gap-3 items-center p-3 bg-white/80 rounded-xl group cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => setOutline("An explanation of how the Cartesian Grid works")}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:scale-150 transition-transform"></div>
                <span className="text-base text-gray-700 group-hover:text-blue-700 font-medium transition-colors flex-1">
                  An explanation of how the Cartesian Grid works
                </span>
                <Sparkles className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li
                className="flex gap-3 items-center p-3 bg-white/80 rounded-xl group cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => setOutline("A test on counting numbers from 1 to 100")}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 group-hover:scale-150 transition-transform"></div>
                <span className="text-base text-gray-700 group-hover:text-green-700 font-medium transition-colors flex-1">
                  A test on counting numbers from 1 to 100
                </span>
                <Sparkles className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4 font-semibold text-center">
              ✨ Click any example to use it as your prompt ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
