'use client';

import { memo, useMemo } from 'react';
import { Lesson } from '@/types/lesson';
import {
  PlayfulCard,
  PlayfulCardHeader,
  PlayfulCardContent,
  PlayfulCardTitle,
  PlayfulCardDescription,
} from '@/components/ui/playful-card';
import { PlayfulBadge } from '@/components/ui/playful-badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  isRetrying: boolean;
  isLoading: boolean;
  onRetry: (lessonId: string, event: React.MouseEvent) => void;
  onRowClick: (lesson: Lesson) => void;
  animationDelay: number;
}

/**
 * Get gradient color based on lesson type
 */
const getGradientForType = (lesson: Lesson): "purple" | "blue" | "green" | "yellow" | "pink" => {
  const type = lesson.lesson_type?.toLowerCase() || 'general';
  switch (type) {
    case 'math':
      return 'blue';
    case 'reading':
      return 'purple';
    case 'quiz':
      return 'yellow';
    case 'flashcard':
      return 'pink';
    case 'interactive':
    case 'matching':
      return 'green';
    default:
      return 'purple';
  }
};

/**
 * Get random SVG illustration for lesson (deterministic based on lesson ID)
 */
const getLessonSVG = (lessonId: string) => {
  // Use lesson ID to consistently get same SVG for same lesson
  const svgIndex = parseInt(lessonId.slice(0, 8), 16) % 8;
  const svgs = [
    // Happy Star
    <svg key="star" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`star-${lessonId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <path d="M100 20 L115 70 L165 75 L125 110 L135 160 L100 135 L65 160 L75 110 L35 75 L85 70 Z" fill={`url(#star-${lessonId})`} stroke="#7C3AED" strokeWidth="3" />
      <circle cx="85" cy="85" r="6" fill="white" />
      <circle cx="115" cy="85" r="6" fill="white" />
      <circle cx="87" cy="87" r="3" fill="#1F2937" />
      <circle cx="117" cy="87" r="3" fill="#1F2937" />
      <path d="M 80 100 Q 100 115 120 100" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>,
    // Rocket
    <svg key="rocket" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`rocket-${lessonId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="20" ry="30" fill={`url(#rocket-${lessonId})`} />
      <path d="M 80 120 L 60 160 L 80 150 Z" fill="#F59E0B" />
      <path d="M 120 120 L 140 160 L 120 150 Z" fill="#F59E0B" />
      <path d="M 90 120 L 85 170 L 100 160 Z" fill="#EF4444" />
      <path d="M 110 120 L 115 170 L 100 160 Z" fill="#EF4444" />
      <ellipse cx="100" cy="90" rx="25" ry="35" fill={`url(#rocket-${lessonId})`} />
      <circle cx="100" cy="90" r="10" fill="white" opacity="0.5" />
      <polygon points="100,50 85,90 115,90" fill="#DC2626" />
    </svg>,
    // Book with Sparkles
    <svg key="book" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="70" width="80" height="90" rx="5" fill="#A855F7" stroke="#7C3AED" strokeWidth="3" />
      <rect x="65" y="75" width="70" height="80" rx="3" fill="white" />
      <line x1="75" y1="90" x2="125" y2="90" stroke="#A855F7" strokeWidth="2" />
      <line x1="75" y1="105" x2="125" y2="105" stroke="#A855F7" strokeWidth="2" />
      <line x1="75" y1="120" x2="110" y2="120" stroke="#A855F7" strokeWidth="2" />
      <path d="M 30 50 L 35 60 L 45 65 L 35 70 L 30 80 L 25 70 L 15 65 L 25 60 Z" fill="#FBBF24" />
      <path d="M 160 40 L 163 47 L 170 50 L 163 53 L 160 60 L 157 53 L 150 50 L 157 47 Z" fill="#FBBF24" />
    </svg>,
    // Light Bulb
    <svg key="bulb" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bulb-${lessonId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="85" rx="35" ry="45" fill={`url(#bulb-${lessonId})`} stroke="#D97706" strokeWidth="3" />
      <rect x="85" y="125" width="30" height="15" rx="3" fill="#9CA3AF" />
      <rect x="88" y="140" width="24" height="8" rx="2" fill="#6B7280" />
      <line x1="70" y1="70" x2="85" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M 50 60 L 53 67 L 60 70 L 53 73 L 50 80 L 47 73 L 40 70 L 47 67 Z" fill="#FBBF24" />
      <path d="M 145 65 L 148 72 L 155 75 L 148 78 L 145 85 L 142 78 L 135 75 L 142 72 Z" fill="#FBBF24" />
    </svg>,
    // Trophy
    <svg key="trophy" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`trophy-${lessonId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path d="M 70 60 L 65 90 L 80 95 L 75 60 Z" fill={`url(#trophy-${lessonId})`} stroke="#D97706" strokeWidth="2" />
      <path d="M 130 60 L 135 90 L 120 95 L 125 60 Z" fill={`url(#trophy-${lessonId})`} stroke="#D97706" strokeWidth="2" />
      <rect x="75" y="55" width="50" height="60" rx="5" fill={`url(#trophy-${lessonId})`} stroke="#D97706" strokeWidth="3" />
      <rect x="85" y="115" width="30" height="25" rx="3" fill="#9CA3AF" />
      <rect x="75" y="140" width="50" height="8" rx="4" fill="#6B7280" />
      <circle cx="100" cy="80" r="8" fill="#DC2626" />
      <path d="M 95 80 L 100 70 L 105 80 L 112 82 L 105 87 L 107 95 L 100 90 L 93 95 L 95 87 L 88 82 Z" fill="#EF4444" />
    </svg>,
    // Rainbow
    <svg key="rainbow" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 130 Q 100 40 160 130" stroke="#EF4444" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 50 130 Q 100 55 150 130" stroke="#F59E0B" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 60 130 Q 100 70 140 130" stroke="#FBBF24" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 70 130 Q 100 85 130 130" stroke="#10B981" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 80 130 Q 100 100 120 130" stroke="#3B82F6" strokeWidth="12" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="140" rx="15" ry="10" fill="white" opacity="0.8" />
      <ellipse cx="170" cy="140" rx="15" ry="10" fill="white" opacity="0.8" />
    </svg>,
    // Planet with Stars
    <svg key="planet" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`planet-${lessonId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="45" fill={`url(#planet-${lessonId})`} />
      <ellipse cx="100" cy="100" rx="70" ry="15" fill="none" stroke="#A855F7" strokeWidth="4" opacity="0.6" />
      <circle cx="85" cy="90" r="8" fill="#C084FC" opacity="0.7" />
      <circle cx="115" cy="105" r="6" fill="#C084FC" opacity="0.7" />
      <circle cx="105" cy="85" r="5" fill="#C084FC" opacity="0.7" />
      <path d="M 40 40 L 43 47 L 50 50 L 43 53 L 40 60 L 37 53 L 30 50 L 37 47 Z" fill="#FBBF24" />
      <path d="M 155 45 L 158 52 L 165 55 L 158 58 L 155 65 L 152 58 L 145 55 L 152 52 Z" fill="#FBBF24" />
      <path d="M 160 120 L 162 125 L 167 127 L 162 129 L 160 134 L 158 129 L 153 127 L 158 125 Z" fill="#FBBF24" />
    </svg>,
    // Heart with Wings
    <svg key="heart" viewBox="0 0 200 200" className="w-24 h-24 animate-float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`heart-${lessonId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
      <path d="M 100 140 L 70 110 Q 60 100 60 85 Q 60 65 75 60 Q 90 55 100 70 Q 110 55 125 60 Q 140 65 140 85 Q 140 100 130 110 Z" fill={`url(#heart-${lessonId})`} stroke="#DB2777" strokeWidth="3" />
      <path d="M 65 95 Q 50 90 40 95 Q 35 100 40 105 Q 50 110 65 100" fill="#A855F7" opacity="0.7" />
      <path d="M 135 95 Q 150 90 160 95 Q 165 100 160 105 Q 150 110 135 100" fill="#A855F7" opacity="0.7" />
      <circle cx="85" cy="85" r="4" fill="white" opacity="0.8" />
      <circle cx="105" cy="90" r="3" fill="white" opacity="0.8" />
    </svg>
  ];

  return svgs[svgIndex];
};

/**
 * Memoized Lesson Card Component
 * Only re-renders when its specific lesson data or state changes
 */
export const LessonCard = memo<LessonCardProps>(({
  lesson,
  isRetrying,
  isLoading,
  onRetry,
  onRowClick,
  animationDelay
}) => {
  const gradient = useMemo(() => getGradientForType(lesson), [lesson]);
  const isClickable = lesson.status === 'completed';
  const svg = useMemo(() => getLessonSVG(lesson.id), [lesson.id]);

  return (
    <PlayfulCard
      gradient={gradient}
      hover={isClickable && !isLoading}
      animate
      className={`${isClickable ? 'cursor-pointer' : 'cursor-default'} ${isLoading ? 'relative' : ''}`}
      onClick={() => isClickable && !isLoading && onRowClick(lesson)}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 animate-fade-in">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
          <p className="font-display text-xl font-bold text-purple-700">Loading Lesson...</p>
          <p className="text-sm text-gray-600 mt-2">Get ready for an amazing adventure!</p>
        </div>
      )}

      {/* SVG Illustration Header */}
      <PlayfulCardHeader gradient={gradient}>
        {svg}
      </PlayfulCardHeader>

      {/* Content */}
      <PlayfulCardContent>
        <div className="space-y-4">
          {/* Title */}
          <PlayfulCardTitle className="line-clamp-2">
            {lesson.title}
          </PlayfulCardTitle>

          {/* Description/Outline */}
          <PlayfulCardDescription className="line-clamp-3 min-h-[4.5rem]">
            {lesson.outline || 'An exciting learning adventure awaits!'}
          </PlayfulCardDescription>

          {/* Status Badge */}
          <div className="flex items-center justify-between gap-3">
            {lesson.status === 'generating' && (
              <PlayfulBadge variant="magic" icon={<Loader2 className="w-4 h-4 animate-spin" />} size="sm">
                Creating...
              </PlayfulBadge>
            )}
            {lesson.status === 'completed' && (
              <PlayfulBadge variant="success" icon={<CheckCircle className="w-4 h-4" />} size="sm">
                Ready!
              </PlayfulBadge>
            )}
            {lesson.status === 'failed' && (
              <PlayfulBadge variant="default" icon={<AlertCircle className="w-4 h-4" />} size="sm">
                Failed
              </PlayfulBadge>
            )}

            {/* Date */}
            <span className="text-xs text-gray-500">
              {new Date(lesson.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Action Button or Retry */}
          {lesson.status === 'completed' && (
            <Button variant="playful" size="lg" className="w-full">
              <Sparkles className="w-5 h-5" />
              Start Learning
            </Button>
          )}

          {lesson.status === 'generating' && (
            <div className="py-3 text-center">
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-500" />
              <p className="text-sm text-gray-600 mt-2">Sparky is creating your lesson...</p>
            </div>
          )}

          {lesson.status === 'failed' && (
            <div className="space-y-2">
              <Button
                variant="magic"
                size="lg"
                className="w-full"
                onClick={(e) => onRetry(lesson.id, e)}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </>
                )}
              </Button>
              {lesson.error_message && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {lesson.error_message}
                </p>
              )}
            </div>
          )}
        </div>
      </PlayfulCardContent>
    </PlayfulCard>
  );
});

LessonCard.displayName = 'LessonCard';
