'use client';

import { useState, useCallback, useEffect } from 'react';
import { LessonForm } from '@/components/lesson-form';
import { LessonTable } from '@/components/lesson-table';
import { Modal } from '@/components/ui/modal';
import { Lesson } from '@/types/lesson';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';

interface HomeClientWrapperProps {
  initialLessons: Lesson[];
}

export function HomeClientWrapper({ initialLessons }: HomeClientWrapperProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLessonCreated = useCallback(async () => {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-3xl" />
            <div className="h-64 bg-gray-200 rounded-3xl" />
            <div className="h-96 bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Header - Following UX Best Practices */}
          <header className="py-6 border-b border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center justify-between">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-rainbow bg-clip-text text-transparent">
                    Digital Lessons
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Learning</p>
                </div>
              </div>

              {/* Primary CTA - Following UX Principle: Clear Call-to-Action */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create New Lesson</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </header>

          {/* Hero Section - Following UX Principle: Clear Value Proposition */}
          <section className="py-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Your Personalized Learning Journey
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Create interactive lessons on any topic with the power of AI. Start learning today!
              </p>
            </div>
          </section>

          {/* Main Content - Lessons Section */}
          <section className="pb-20">
            <LessonTable initialLessons={lessons} />
          </section>

          {/* Footer - Clean and Minimal */}
          <footer className="border-t border-purple-200/50 dark:border-purple-800/50 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">Powered by AI</span>
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/showcase"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  Showcase
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <LessonForm onLessonCreated={handleLessonCreated} />
      </Modal>
    </>
  );
}
