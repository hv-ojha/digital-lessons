'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
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

  const isComplete = progress && progress.current === progress.total;

  return (
    <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-3xl shadow-playful-lg p-6 md:p-8 animate-slide-in-up">
      <div className="flex flex-col gap-4">
        {/* Back Button */}
        <Button
          onClick={handleBack}
          variant="outline"
          size="default"
          className="self-start bg-white/80 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-800 transition-all duration-200 hover:-translate-x-1 font-semibold shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Lessons
        </Button>

        {/* Title with Sparky */}
        <div className="flex items-start gap-4">
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

        {/* Progress Info */}
        {progress && (
          <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-purple-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <p className="text-base font-bold text-gray-800">
                {isComplete ? (
                  <span className="gradient-text-success">Complete! 🎉</span>
                ) : (
                  `${progress.current} of ${progress.total} answered`
                )}
              </p>
            </div>
            {score !== undefined && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-gray-900 fill-gray-900" />
                <p className="text-base font-bold text-gray-900">
                  {score} points
                </p>
              </div>
            )}
          </div>
        )}

        {/* Score Badge (if no progress) */}
        {!progress && score !== undefined && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full font-bold shadow-md self-start">
            <Star className="w-5 h-5 fill-gray-900" />
            <span>Score: {score}</span>
          </div>
        )}
      </div>
    </div>
  );
}
