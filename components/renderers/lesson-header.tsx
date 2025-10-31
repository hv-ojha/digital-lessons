'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
import { PlayfulProgress } from '@/components/ui/playful-progress';
import { Button } from '@/components/ui/button';

interface LessonHeaderProps {
  title: string;
  description?: string;
  progress?: {
    current: number;
    total: number;
  };
  score?: number;
}

export function LessonHeader({ title, description, progress, score }: LessonHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  // Determine Sparky's mood based on progress
  const getProgressPercentage = () => {
    if (!progress) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };

  const progressPercentage = getProgressPercentage();
  const isComplete = progress && progress.current === progress.total;

  return (
    <div className="relative bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-3xl shadow-playful-lg p-6 md:p-8 overflow-hidden animate-slide-in-up">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-200/30 to-pink-200/30 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        {/* Back Button */}
        <Button
          onClick={handleBack}
          variant="outline"
          size="default"
          className="mb-4 bg-white/80 border-2 border-purple-300 text-purple-700 hover:bg-white hover:border-purple-500 transition-all duration-200 hover:-translate-x-1 font-semibold shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Lessons
        </Button>

        {/* Title with Sparky */}
        <div className="flex items-start gap-4 mb-4">
          {/* Sparky Mascot */}
          <div className="flex-shrink-0">
            <svg
              viewBox="0 0 200 200"
              className={`w-16 h-16 md:w-20 md:h-20 ${isComplete ? 'animate-tada' : 'animate-float'}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="starGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>
              </defs>
              {/* Star Body */}
              <path
                d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z"
                fill="url(#starGradientHeader)"
                stroke="#7C3AED"
                strokeWidth="3"
              />
              {/* Eyes */}
              <circle cx="85" cy="85" r="8" fill="white" />
              <circle cx="115" cy="85" r="8" fill="white" />
              <circle cx="87" cy="87" r="4" fill="#1F2937" />
              <circle cx="117" cy="87" r="4" fill="#1F2937" />
              {/* Mouth - Happy if complete, encouraging otherwise */}
              {isComplete ? (
                <path
                  d="M 75 100 Q 100 125 125 100"
                  stroke="#1F2937"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <path
                  d="M 80 105 Q 100 120 120 105"
                  stroke="#1F2937"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </div>

          {/* Title and Description */}
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-5xl font-extrabold gradient-text-magic mb-2 leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mb-4">
            <PlayfulProgress
              value={progressPercentage}
              showStars
              className="h-4"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                {isComplete ? (
                  <span className="gradient-text-success">Complete! 🎉</span>
                ) : (
                  `Progress: ${progress.current} of ${progress.total}`
                )}
              </p>
              {score !== undefined && (
                <p className="text-sm font-bold text-purple-700 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Score: {score}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Score Badge (if no progress) */}
        {!progress && score !== undefined && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full font-bold shadow-md">
            <Star className="w-5 h-5 fill-gray-900" />
            Score: {score}
          </div>
        )}
      </div>
    </div>
  );
}
