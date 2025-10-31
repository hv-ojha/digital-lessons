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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Mascot */}
        <div className="text-center mb-16 animate-bounce-in">
          {/* Sparky Mascot */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-30 animate-pulse-slow" />
              <svg
                viewBox="0 0 200 200"
                className="w-32 h-32 animate-float relative"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                </defs>
                <path
                  d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
                  fill="url(#starGradient)"
                  stroke="#7C3AED"
                  strokeWidth="3"
                />
                <circle cx="85" cy="85" r="8" fill="white" />
                <circle cx="115" cy="85" r="8" fill="white" />
                <circle cx="87" cy="87" r="4" fill="#1F2937" />
                <circle cx="117" cy="87" r="4" fill="#1F2937" />
                <path
                  d="M 80 105 Q 100 120 120 105"
                  stroke="#1F2937"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-balance">
            <span className="gradient-text-rainbow">
              Digital Lessons
            </span>
          </h1>
          <p className="font-display text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Learn Anything, Anytime! 🚀
          </p>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Create personalized, interactive lessons powered by AI technology and embark on amazing learning adventures!
          </p>
        </div>

        {/* Lesson Creation Form */}
        <div className="mb-16">
          <LessonForm onLessonCreated={handleLessonCreated} />
        </div>

        {/* Lessons Table */}
        {isLoading ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-playful-lg p-12 text-center max-w-4xl mx-auto animate-bounce-in">
            {/* Loading Sparky */}
            <svg
              viewBox="0 0 200 200"
              className="w-24 h-24 mx-auto mb-6 animate-float"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="loadingStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>
              </defs>
              <path
                d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
                fill="url(#loadingStarGradient)"
                stroke="#7C3AED"
                strokeWidth="3"
              />
              <circle cx="85" cy="85" r="8" fill="white" />
              <circle cx="115" cy="85" r="8" fill="white" />
              <circle cx="87" cy="87" r="4" fill="#1F2937" />
              <circle cx="117" cy="87" r="4" fill="#1F2937" />
              <path
                d="M 80 105 Q 100 120 120 105"
                stroke="#1F2937"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Animated dots */}
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>

            <h3 className="font-display text-3xl font-extrabold gradient-text-magic mb-2">
              Loading Your Lessons
            </h3>
            <p className="text-lg text-gray-600">
              Sparky is gathering your learning adventures!
            </p>
          </div>
        ) : (
          <LessonTable initialLessons={lessons} />
        )}

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="space-y-6">
            {/* Fun Stats or Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-playful hover:shadow-playful-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Interactive</h3>
                <p className="text-gray-600 text-sm">Engaging lessons that make learning fun!</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-playful hover:shadow-playful-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-display font-bold text-xl text-gray-800 mb-2">AI-Powered</h3>
                <p className="text-gray-600 text-sm">Personalized content just for you!</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-playful hover:shadow-playful-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Fun Learning</h3>
                <p className="text-gray-600 text-sm">Learn while having a great time!</p>
              </div>
            </div>

            <p className="text-lg text-gray-700 font-display font-semibold">
              Empowering learners with AI-driven education ✨
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-full font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Powered by AI
              </span>
              <span>•</span>
              <span className="font-semibold">Built with Next.js & Supabase</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
