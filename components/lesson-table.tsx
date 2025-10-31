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
      router.push(`/lessons/${lesson.id}`);
    }
  };

  // Get icon and gradient based on lesson type or default
  const getLessonIcon = (lesson: Lesson) => {
    const type = lesson.type?.toLowerCase() || 'general';
    const iconClass = "w-20 h-20 animate-float";

    switch (type) {
      case 'math':
        return <Calculator className={`${iconClass} text-blue-600`} />;
      case 'reading':
        return <BookOpen className={`${iconClass} text-purple-600`} />;
      case 'quiz':
        return <Zap className={`${iconClass} text-yellow-600`} />;
      case 'flashcard':
        return <Brain className={`${iconClass} text-pink-600`} />;
      case 'interactive':
      case 'matching':
        return <Puzzle className={`${iconClass} text-green-600`} />;
      default:
        return <Sparkles className={`${iconClass} text-indigo-600`} />;
    }
  };

  const getGradientForType = (lesson: Lesson): "purple" | "blue" | "green" | "yellow" | "pink" => {
    const type = lesson.type?.toLowerCase() || 'general';
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

          return (
            <PlayfulCard
              key={lesson.id}
              gradient={gradient}
              hover={isClickable}
              animate
              className={isClickable ? 'cursor-pointer' : 'cursor-default'}
              onClick={() => isClickable && handleRowClick(lesson)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon Header */}
              <PlayfulCardHeader gradient={gradient}>
                {getLessonIcon(lesson)}
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
