import { NextRequest, NextResponse } from 'next/server';
import { createLesson, getAllLessons } from '@/lib/db/lessons-server';
import { generateLessonContent, getGenerationMode } from '@/lib/lesson-generation-service';
import { logExecutionMode } from '@/lib/execution-mode';
import { apiRateLimiter, lessonCreationRateLimiter, getClientIdentifier } from '@/lib/rate-limit';
import { z } from 'zod';

// Schema for request validation
const createLessonSchema = z.object({
  outline: z.string().min(5, 'Outline must be at least 5 characters').max(500, 'Outline must be less than 500 characters'),
});

/**
 * Safely format error message for client response
 * Don't expose internal errors in production
 */
function getErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'Unknown error occurred';
  }
  return 'An error occurred while processing your request';
}

/**
 * GET /api/lessons - Get all lessons
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = apiRateLimiter.check(clientId);

  if (rateLimit.limited) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const lessons = await getAllLessons();
    return NextResponse.json(lessons, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });
  } catch (error) {
    console.error('[API] Error fetching lessons:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lessons - Create a new lesson and trigger generation
 */
export async function POST(request: NextRequest) {
  // Rate limiting for lesson creation (stricter limits)
  const clientId = getClientIdentifier(request);
  const rateLimit = lessonCreationRateLimiter.check(clientId);

  if (rateLimit.limited) {
    return NextResponse.json(
      {
        error: 'Too many lesson creation requests. Please wait before creating more lessons.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createLessonSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { outline } = validationResult.data;

    // Log execution mode configuration
    logExecutionMode();

    // Generate a temporary title
    const tempTitle = `Lesson: ${outline.slice(0, 40)}...`;

    // Create lesson in database with 'generating' status
    const lesson = await createLesson(tempTitle, outline);

    console.log(`\n📝 [API] Created lesson ${lesson.id}`);
    console.log(`   Outline: "${outline}"`);
    console.log(`   Mode: ${getGenerationMode()}`);

    // Generate lesson content (auto-detects sync vs async based on environment)
    const result = await generateLessonContent(lesson.id, outline);

    // Rate limit headers for successful responses
    const rateLimitHeaders = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
    };

    if (result.mode === 'async') {
      // Async mode (production): Return immediately, Inngest handles generation
      console.log(`✅ [API] Lesson ${lesson.id} queued for background generation\n`);

      return NextResponse.json({
        id: lesson.id,
        title: lesson.title,
        status: lesson.status,
        message: 'Lesson queued for generation',
        mode: 'async',
      }, {
        status: 201,
        headers: rateLimitHeaders,
      });
    } else {
      // Sync mode (local): Generation completed, return result
      if (result.success) {
        console.log(`✅ [API] Lesson ${lesson.id} generated successfully\n`);

        return NextResponse.json({
          id: lesson.id,
          title: lesson.title,
          status: 'completed',
          message: 'Lesson generated successfully',
          mode: 'sync',
        }, {
          status: 201,
          headers: rateLimitHeaders,
        });
      } else {
        console.error(`❌ [API] Lesson ${lesson.id} generation failed\n`);

        return NextResponse.json({
          id: lesson.id,
          title: lesson.title,
          status: 'failed',
          message: 'Lesson generation failed',
          mode: 'sync',
        }, {
          status: 201, // Still 201 since lesson was created, just failed to generate
          headers: rateLimitHeaders,
        });
      }
    }

  } catch (error) {
    console.error('[API] Error creating lesson:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

