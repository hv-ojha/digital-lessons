import { NextRequest } from 'next/server';
import { createLesson, updateLessonWithContent, updateLessonStatus } from '@/lib/db/lessons-server';
import { generateLessonJsonStream } from '@/lib/ai/generator-json';
import { lessonCreationRateLimiter, getClientIdentifier } from '@/lib/rate-limit';
import { z } from 'zod';

// Schema for request validation
const createLessonSchema = z.object({
  outline: z.string().min(5, 'Outline must be at least 5 characters').max(500, 'Outline must be less than 500 characters'),
});

/**
 * POST /api/lessons/stream - Create a new lesson with streaming generation
 *
 * Returns Server-Sent Events (SSE) for real-time progress updates
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = lessonCreationRateLimiter.check(clientId);

  if (rateLimit.limited) {
    const errorMessage = JSON.stringify({
      error: 'Too many lesson creation requests. Please wait before creating more lessons.',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
    });

    return new Response(errorMessage, {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
      },
    });
  }

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createLessonSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: validationResult.error.issues }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { outline } = validationResult.data;

    // Generate a temporary title
    const tempTitle = `Lesson: ${outline.slice(0, 40)}...`;

    // Create lesson in database with 'generating' status
    const lesson = await createLesson(tempTitle, outline);

    console.log(`\n📝 [STREAM API] Created lesson ${lesson.id}`);
    console.log(`   Outline: "${outline}"`);

    // Create a TransformStream for SSE
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<any> | null = null;

    const stream = new ReadableStream({
      start(ctrl) {
        controller = ctrl;

        // Start generation after controller is initialized
        (async () => {
          try {
            // Helper to send SSE events
            const sendEvent = (event: string, data: any) => {
              if (!controller) return;
              const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            };

            // Send initial event with lesson ID
            sendEvent('start', {
              lessonId: lesson.id,
              outline,
            });

        // Generate lesson with streaming
        const result = await generateLessonJsonStream(
          outline,
          async (progress) => {
            // Send progress updates as SSE events
            sendEvent('progress', {
              lessonId: lesson.id,
              stage: progress.stage,
              percentage: progress.percentage,
              message: progress.message,
              isComplete: progress.isComplete,
              error: progress.error,
              // Only send partial content occasionally to avoid overwhelming the client
              partialContent: progress.percentage % 10 === 0 ? progress.partialContent : undefined,
            });
          },
          lesson.id
        );

        // Update database and send completion event
        if (result.success && result.content && result.title) {
          // Save the generated content to the database
          await updateLessonWithContent(
            lesson.id,
            result.title,
            result.content,
            'flexible', // lesson type
            true // isJsonBased
          );

          console.log(`✅ [STREAM API] Lesson ${lesson.id} saved to database`);

          sendEvent('complete', {
            lessonId: lesson.id,
            title: result.title,
            success: true,
          });
        } else {
          // Update status to failed
          await updateLessonStatus(
            lesson.id,
            'failed',
            undefined,
            result.error || 'Generation failed'
          );

          sendEvent('error', {
            lessonId: lesson.id,
            error: result.error,
          });
        }

            // Close the stream
            if (controller) controller.close();
          } catch (error) {
            console.error('[STREAM API] Error during streaming:', error);

            // Update database status to failed
            await updateLessonStatus(
              lesson.id,
              'failed',
              undefined,
              error instanceof Error ? error.message : 'Unknown error occurred'
            );

            // Helper to send SSE events
            const sendEvent = (event: string, data: any) => {
              if (!controller) return;
              const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            };

            sendEvent('error', {
              lessonId: lesson.id,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            });

            if (controller) controller.close();
          }
        })();
      },
    });

    // Return SSE response
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });

  } catch (error) {
    console.error('[STREAM API] Error creating lesson:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
