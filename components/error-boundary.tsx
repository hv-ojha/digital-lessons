'use client';

/**
 * Error Boundary Component
 *
 * Catches React errors and displays a fallback UI
 * Prevents entire app from crashing due to component errors
 */

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-playful p-8 text-center space-y-4">
            <div className="text-6xl">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 font-display">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 font-body">
              We encountered an unexpected error. Don't worry, we're working on it!
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error details (development only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 hover:scale-105"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lesson-specific Error Boundary
 * Provides a more contextual error message for lesson rendering errors
 */
interface LessonErrorBoundaryProps {
  children: ReactNode;
  lessonId?: string;
  onError?: (error: Error) => void;
}

export function LessonErrorBoundary({ children, lessonId, onError }: LessonErrorBoundaryProps) {
  const fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-playful p-8 text-center space-y-4">
        <div className="text-6xl">📚</div>
        <h2 className="text-2xl font-bold text-gray-800 font-display">
          Lesson Loading Error
        </h2>
        <p className="text-gray-600 font-body">
          We couldn't load this lesson. It might be corrupted or in an unsupported format.
        </p>
        {lessonId && (
          <p className="text-sm text-gray-500">
            Lesson ID: {lessonId}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 hover:scale-105"
          >
            Try Again
          </button>
          <a
            href="/"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 hover:scale-105"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}
