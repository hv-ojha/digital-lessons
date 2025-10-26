'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

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

      // Clear form
      setOutline('');

      // Notify parent component
      onLessonCreated();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card-elevated animate-slide-up">
      <div className="mb-8">
        <h2 className="text-heading-2 gradient-text mb-3 text-balance">
          Create Your Lesson
        </h2>
        <p className="text-body text-muted-foreground">
          Tell us what you want to learn, and we'll craft a personalized lesson just for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="outline"
            className="block text-lg font-semibold text-foreground"
          >
            What would you like to learn?
          </label>
          <div className="relative">
            <textarea
              id="outline"
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="Example: A 10 question pop quiz on Florida's history and geography"
              className="w-full px-5 py-4 text-base bg-background border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-transparent transition-all duration-200 min-h-[140px] resize-none placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGenerating}
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
              {outline.length}/500
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 animate-fade-in">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-destructive font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isGenerating || outline.trim().length < 5}
          className="w-full py-6 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Your Lesson
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate Lesson
            </span>
          )}
        </Button>
      </form>

      <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border/50 backdrop-blur-sm">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground mb-3">
              Need inspiration? Try these examples
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start group cursor-pointer" onClick={() => setOutline("A one-pager on how to divide with long division")}>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground/40 mt-2 group-hover:bg-accent-foreground transition-colors"></div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                  A one-pager on how to divide with long division
                </span>
              </li>
              <li className="flex gap-3 items-start group cursor-pointer" onClick={() => setOutline("An explanation of how the Cartesian Grid works")}>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground/40 mt-2 group-hover:bg-accent-foreground transition-colors"></div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                  An explanation of how the Cartesian Grid works
                </span>
              </li>
              <li className="flex gap-3 items-start group cursor-pointer" onClick={() => setOutline("A test on counting numbers from 1 to 100")}>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground/40 mt-2 group-hover:bg-accent-foreground transition-colors"></div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                  A test on counting numbers from 1 to 100
                </span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Click any example to use it as your prompt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
