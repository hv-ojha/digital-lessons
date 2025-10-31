'use client';

import { useRouter } from 'next/navigation';

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

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-lg p-6 md:p-8">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Lessons
      </button>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground text-base mb-4">{description}</p>
      )}

      {/* Progress and Score */}
      <div className="flex items-center justify-between">
        {progress && (
          <p className="text-muted-foreground text-sm">
            {progress.current === progress.total ? 'Complete' : `${progress.current} of ${progress.total}`}
          </p>
        )}
        {score !== undefined && (
          <p className="text-muted-foreground text-sm">
            Score: {score}
          </p>
        )}
      </div>
    </div>
  );
}
