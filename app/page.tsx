'use client';

import { useState, useEffect } from 'react';
import { LessonForm } from '@/components/lesson-form';
import { LessonTable } from '@/components/lesson-table';
import { Lesson } from '@/types/lesson';

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleLessonCreated = () => {
    // Refresh lessons list
    fetchLessons();
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-display gradient-text mb-6 text-balance">
            Digital Lessons
          </h1>
          <p className="text-heading-4 text-foreground/90 mb-3">
            Learn Anything, Anytime
          </p>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Create personalized, interactive lessons powered by AI technology
          </p>
        </div>

        {/* Lesson Creation Form */}
        <div className="mb-16">
          <LessonForm onLessonCreated={handleLessonCreated} />
        </div>

        {/* Lessons Table */}
        {isLoading ? (
          <div className="card-elegant text-center animate-fade-in max-w-4xl mx-auto">
            <svg className="w-16 h-16 mx-auto mb-6 text-muted-foreground animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h3 className="text-heading-3 text-foreground">
              Loading your lessons
            </h3>
          </div>
        ) : (
          <LessonTable initialLessons={lessons} />
        )}

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="space-y-3">
            <p className="text-body text-muted-foreground">
              Empowering learners with AI-driven education
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Powered by AI
              </span>
              <span>•</span>
              <span>Built with Next.js & Supabase</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
