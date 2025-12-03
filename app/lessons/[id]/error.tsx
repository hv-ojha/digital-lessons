'use client';

import { useEffect } from 'react';

/**
 * Error UI for Lesson Detail Page
 * Automatically catches errors in the lesson page and its children
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Lesson page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-12 text-center max-w-2xl animate-bounce-in">
        {/* Sad Sparky */}
        <svg
          viewBox="0 0 200 200"
          className="w-32 h-32 mx-auto mb-6 animate-wiggle"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sadStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="50%" stopColor="var(--color-accent-orange)" />
              <stop offset="100%" stopColor="var(--color-accent-yellow)" />
            </linearGradient>
          </defs>
          <path
            d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
            fill="url(#sadStarGradient)"
            stroke="hsl(var(--destructive))"
            strokeWidth="3"
          />
          <circle cx="85" cy="85" r="8" fill="white" />
          <circle cx="115" cy="85" r="8" fill="white" />
          <circle cx="87" cy="87" r="4" fill="hsl(var(--foreground))" />
          <circle cx="117" cy="87" r="4" fill="hsl(var(--foreground))" />
          {/* Sad mouth */}
          <path
            d="M 80 115 Q 100 100 120 115"
            stroke="hsl(var(--foreground))"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <h1 className="font-display text-4xl font-extrabold text-foreground mb-4">
          Oops! Something Went Wrong
        </h1>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          We encountered an unexpected error while loading this lesson.
        </p>

        {/* Show error details in development */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-4 mb-8">
            <p className="text-xs text-destructive font-mono text-left overflow-x-auto">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 [background:var(--gradient-magic)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 [background:var(--gradient-professional)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
