import { NextRequest, NextResponse } from 'next/server';
import { getLesson, updateLessonStatus } from '@/lib/db/lessons-server';
import { generateLessonContent, getGenerationMode } from '@/lib/lesson-generation-service';
import { logExecutionMode } from '@/lib/execution-mode';
import { lessonCreationRateLimiter, getClientIdentifier } from '@/lib/rate-limit';

/**
 * POST /api/lessons/[id]/retry - Retry generating a failed lesson
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting (same as lesson creation)
  const clientId = getClientIdentifier(request);
  const rateLimit = lessonCreationRateLimiter.check(clientId);

  if (rateLimit.limited) {
    return NextResponse.json(
      {
        error: 'Too many retry requests. Please wait before retrying again.',
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
    const { id } = await params;

    // Get the existing lesson
    const lesson = await getLesson(id);

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Only allow retrying failed or generating lessons
    if (lesson.status === 'completed') {
      return NextResponse.json(
        { error: 'Lesson already completed. Cannot retry.' },
        { status: 400 }
      );
    }

    // Log execution mode configuration
    logExecutionMode();

    // Update status back to generating
    await updateLessonStatus(id, 'generating');

    console.log(`\n🔄 [API] Retrying lesson ${id}`);
    console.log(`   Outline: "${lesson.outline}"`);
    console.log(`   Mode: ${getGenerationMode()}`);

    // Generate lesson content (auto-detects sync vs async based on environment)
    const result = await generateLessonContent(id, lesson.outline);

    // Rate limit headers for successful responses
    const rateLimitHeaders = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
    };

    if (result.mode === 'async') {
      // Async mode (production): Return immediately, Inngest handles generation
      console.log(`✅ [API] Lesson ${id} retry queued for background generation\n`);

      return NextResponse.json({
        id: id,
        status: 'generating',
        message: 'Lesson retry queued for generation',
        mode: 'async',
      }, {
        headers: rateLimitHeaders,
      });
    } else {
      // Sync mode (local): Generation completed, return result
      if (result.success) {
        console.log(`✅ [API] Lesson ${id} retry generated successfully\n`);

        return NextResponse.json({
          id: id,
          status: 'completed',
          message: 'Lesson retry generated successfully',
          mode: 'sync',
        }, {
          headers: rateLimitHeaders,
        });
      } else {
        console.error(`❌ [API] Lesson ${id} retry generation failed\n`);

        return NextResponse.json({
          id: id,
          status: 'failed',
          message: 'Lesson retry generation failed',
          mode: 'sync',
        }, {
          headers: rateLimitHeaders,
        });
      }
    }

  } catch (error) {
    console.error('Error retrying lesson:', error);
    return NextResponse.json(
      { error: 'Failed to retry lesson generation' },
      { status: 500 }
    );
  }
}

