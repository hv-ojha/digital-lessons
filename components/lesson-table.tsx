'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types/lesson';
import { Badge } from '@/components/ui/badge';
import { subscribeToLessonsChanges } from '@/lib/db/lessons-client';

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
            <div className="flex items-center gap-2">
              <Badge className="bg-destructive/90 text-destructive-foreground px-4 py-2 text-sm font-semibold">
                <svg className="inline-block w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Failed
              </Badge>
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
            </div>
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

  if (lessons.length === 0) {
    return (
      <div className="card-elegant text-center animate-fade-in">
        <svg className="w-24 h-24 mx-auto mb-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-heading-3 mb-3">
          No Lessons Yet
        </h3>
        <p className="text-body text-muted-foreground">
          Create your first lesson above to get started on your learning journey
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden animate-slide-up">
      <div className="bg-gradient-to-br from-accent to-accent/70 px-8 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="text-heading-3 text-accent-foreground">
            Your Lessons
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground tracking-wide">
                Lesson Title
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground tracking-wide">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lessons.map((lesson) => (
              <tr
                key={lesson.id}
                onClick={() => handleRowClick(lesson)}
                className={`transition-all duration-200 ${
                  lesson.status === 'completed'
                    ? 'cursor-pointer hover:bg-accent/20 group'
                    : 'cursor-default'
                }`}
              >
                <td className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      lesson.status === 'completed' ? 'bg-success/10' :
                      lesson.status === 'failed' ? 'bg-destructive/10' :
                      'bg-warning/10'
                    }`}>
                      {lesson.status === 'completed' ? (
                        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : lesson.status === 'failed' ? (
                        <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-warning animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-foreground group-hover:text-accent-foreground transition-colors">
                        {lesson.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {lesson.outline}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {getStatusBadge(lesson)}
                </td>
                <td className="px-6 py-5 text-muted-foreground text-sm">
                  {new Date(lesson.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lessons.some(l => l.status === 'completed') && (
        <div className="bg-accent/10 px-8 py-4 border-t border-border">
          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span><strong>Click on a completed lesson</strong> to view it</span>
          </p>
        </div>
      )}
    </div>
  );
}
