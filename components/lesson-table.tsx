'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types/lesson';
import { Badge } from '@/components/ui/badge';
import { subscribeToLessonsChanges } from '@/lib/db/lessons-client';
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
  BookOpen,
  Calculator,
  Sparkles,
  Zap,
  Brain,
  Puzzle,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface LessonTableProps {
  initialLessons: Lesson[];
}

export function LessonTable({ initialLessons }: LessonTableProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToLessonsChanges((updatedLessons) => {
      setLessons(updatedLessons);
      // Clear retrying state for lessons that have completed or failed again
      setRetryingIds((prev) => {
        const newSet = new Set(prev);
        updatedLessons.forEach((lesson) => {
          if (lesson.status !== 'generating' && newSet.has(lesson.id)) {
            newSet.delete(lesson.id);
          }
        });
        return newSet;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click

    setRetryingIds((prev) => new Set(prev).add(lessonId));

    try {
      const response = await fetch(`/api/lessons/${lessonId}/retry`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retry');
      }

      // Real-time updates will handle the UI update
    } catch (error) {
      console.error('Retry error:', error);
      alert(error instanceof Error ? error.message : 'Failed to retry lesson generation');
      setRetryingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (lesson: Lesson) => {
    const isRetrying = retryingIds.has(lesson.id);

    switch (lesson.status) {
      case 'generating':
        return (
          <Badge className="bg-warning/90 text-warning-foreground px-4 py-2 text-sm font-semibold hover:bg-warning transition-colors">
            <svg className="inline-block w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-success/90 text-success-foreground px-4 py-2 text-sm font-semibold hover:bg-success transition-colors">
            <svg className="inline-block w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Ready
          </Badge>
        );
      case 'failed':
        return (
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => handleRetry(lesson.id, e)}
              disabled={isRetrying}
              className="px-4 py-2 bg-info text-info-foreground rounded-lg text-sm font-semibold hover:bg-info/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              title="Click to retry generating this lesson"
            >
              {isRetrying ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Retrying
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </>
              )}
            </button>
            {lesson.error_message && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md max-w-md border border-destructive/20">
                {lesson.error_message}
              </div>
            )}
          </div>
        );
      default:
        return <Badge>{lesson.status}</Badge>;
    }
  };

  const handleRowClick = (lesson: Lesson) => {
    if (lesson.status === 'completed') {
      setLoadingLessonId(lesson.id);
      router.push(`/lessons/${lesson.id}`);
    }
  };

  // Get random SVG illustration for lesson
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

  if (lessons.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-playful p-12 text-center animate-bounce-in">
        <div className="mb-6">
          <BookOpen className="w-32 h-32 mx-auto text-purple-300 animate-float" />
        </div>
        <h3 className="font-display text-3xl font-bold text-gray-800 mb-4">
          No Lessons Yet
        </h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          Create your first lesson above to get started on your amazing learning journey! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold gradient-text-magic mb-2">
          Your Learning Adventures
        </h2>
        <p className="text-lg text-gray-600">
          Click on any ready lesson to start learning! 🌟
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, index) => {
          const gradient = getGradientForType(lesson);
          const isRetrying = retryingIds.has(lesson.id);
          const isClickable = lesson.status === 'completed';
          const isLoading = loadingLessonId === lesson.id;

          return (
            <PlayfulCard
              key={lesson.id}
              gradient={gradient}
              hover={isClickable && !isLoading}
              animate
              className={`${isClickable ? 'cursor-pointer' : 'cursor-default'} ${isLoading ? 'relative' : ''}`}
              onClick={() => isClickable && !isLoading && handleRowClick(lesson)}
              style={{ animationDelay: `${index * 0.1}s` }}
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
                {getLessonSVG(lesson.id)}
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
                        onClick={(e) => handleRetry(lesson.id, e)}
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
        })}
      </div>
    </div>
  );
}
