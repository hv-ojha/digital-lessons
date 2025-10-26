'use client';

import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as React from 'react';

interface LessonRendererProps {
  code: string;
  title: string;
}

export function LessonRenderer({ code, title }: LessonRendererProps) {
  // Provide React hooks in scope for react-live
  const scope = {
    useState,
    useEffect,
    useCallback,
    useMemo,
    React,
  };

  // Prepare the code for execution
  // Remove export default and just keep the component
  const preparedCode = code
    .replace(/^import\s+.*from\s+['"]react['"];?\n*/gm, '') // Remove React imports (react-live provides them)
    .replace(/export\s+default\s+/, ''); // Remove export default

  // Extract component name
  const componentMatch = preparedCode.match(/function\s+(\w+)/);
  const componentName = componentMatch ? componentMatch[1] : 'Lesson';

  // Add render call at the end if not present
  const executableCode = preparedCode.includes('<' + componentName)
    ? preparedCode
    : `${preparedCode}\n\nrender(<${componentName} />);`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8 animate-fade-in">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-card text-foreground font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-border hover:bg-accent group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Lessons</span>
          </a>
        </div>

        {/* Lesson Title */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-display gradient-text text-balance">
            {title}
          </h1>
        </div>

        {/* Lesson Content - Container is transparent to let lesson control its own styling */}
        <div className="rounded-2xl shadow-lg overflow-hidden animate-scale-in">
          <LiveProvider
            code={executableCode}
            scope={scope}
            noInline={true}
          >
            <LivePreview className="p-0" />
            <LiveError style={{ display: 'none' }} />
          </LiveProvider>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 card-elegant">
            <summary className="cursor-pointer font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Debug Info (Development Only)
            </summary>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex gap-2">
                <strong className="text-muted-foreground min-w-[140px]">Component Name:</strong>
                <span className="text-foreground font-mono">{componentName}</span>
              </div>
              <div>
                <strong className="text-muted-foreground block mb-2">Code Preview:</strong>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs font-mono border border-border">
                  <code>{executableCode.slice(0, 500)}...</code>
                </pre>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
