import { useState, useCallback, useRef } from 'react';

export interface StreamingProgress {
  stage: 'title' | 'content' | 'validating' | 'complete' | 'error';
  percentage: number;
  message: string;
  partialContent?: string;
  isComplete: boolean;
  error?: string;
}

export interface StreamingLessonResult {
  lessonId?: string;
  title?: string;
  success: boolean;
  error?: string;
}

/**
 * Custom hook for streaming lesson generation
 * Provides real-time progress updates via Server-Sent Events (SSE)
 */
export function useStreamingLessonGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<StreamingProgress | null>(null);
  const [result, setResult] = useState<StreamingLessonResult | null>(null);
  const isGeneratingRef = useRef(false);

  const generateLesson = useCallback(async (outline: string) => {
    // Prevent duplicate requests using ref
    if (isGeneratingRef.current) {
      console.log('⚠️  Generation already in progress, ignoring duplicate request');
      return;
    }

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setProgress(null);
    setResult(null);

    try {
      const response = await fetch('/api/lessons/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline }),
      });

      if (!response.ok) {
        throw new Error('Failed to create streaming lesson');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      // Create a reader for the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete event in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE event
          const eventMatch = line.match(/^event: (.+)\ndata: ([\s\S]+)$/);
          if (!eventMatch) continue;

          const [, eventType, eventData] = eventMatch;

          try {
            const data = JSON.parse(eventData);

            switch (eventType) {
              case 'start':
                console.log('Streaming started:', data);
                setProgress({
                  stage: 'title',
                  percentage: 0,
                  message: 'Starting generation...',
                  isComplete: false,
                });
                setResult({ lessonId: data.lessonId, success: true });
                break;

              case 'progress':
                console.log('Progress update:', data);
                setProgress({
                  stage: data.stage,
                  percentage: data.percentage,
                  message: data.message,
                  partialContent: data.partialContent,
                  isComplete: data.isComplete,
                });
                break;

              case 'complete':
                console.log('Streaming complete:', data);
                setProgress({
                  stage: 'complete',
                  percentage: 100,
                  message: 'Lesson generated successfully!',
                  isComplete: true,
                });
                setResult({
                  lessonId: data.lessonId,
                  title: data.title,
                  success: true,
                });
                setIsGenerating(false);
                isGeneratingRef.current = false;
                break;

              case 'error':
                console.error('Streaming error:', data);
                setProgress({
                  stage: 'error',
                  percentage: 0,
                  message: data.error || 'An error occurred',
                  isComplete: true,
                  error: data.error,
                });
                setResult({
                  lessonId: data.lessonId,
                  success: false,
                  error: data.error,
                });
                setIsGenerating(false);
                isGeneratingRef.current = false;
                break;
            }
          } catch (err) {
            console.error('Failed to parse SSE event:', err);
          }
        }
      }
    } catch (error) {
      console.error('Streaming generation failed:', error);
      setProgress({
        stage: 'error',
        percentage: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
        isComplete: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(null);
    setResult(null);
    isGeneratingRef.current = false;
  }, []);

  return {
    generateLesson,
    isGenerating,
    progress,
    result,
    reset,
  };
}
