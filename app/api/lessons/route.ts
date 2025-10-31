import { NextRequest, NextResponse } from 'next/server';
import { createLesson, getAllLessons } from '@/lib/db/lessons-server';
import { generateLessonContent, getGenerationMode } from '@/lib/lesson-generation-service';
import { logExecutionMode } from '@/lib/execution-mode';
import { z } from 'zod';

// Schema for request validation
const createLessonSchema = z.object({
  outline: z.string().min(5, 'Outline must be at least 5 characters').max(500, 'Outline must be less than 500 characters'),
});

/**
 * GET /api/lessons - Get all lessons
 */
export async function GET() {
  try {
    const lessons = await getAllLessons();
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lessons - Create a new lesson and trigger generation
 */
export async function POST(request: NextRequest) {
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

    if (result.mode === 'async') {
      // Async mode (production): Return immediately, Inngest handles generation
      console.log(`✅ [API] Lesson ${lesson.id} queued for background generation\n`);

      return NextResponse.json({
        id: lesson.id,
        title: lesson.title,
        status: lesson.status,
        message: 'Lesson queued for generation',
        mode: 'async',
      }, { status: 201 });
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
        }, { status: 201 });
      } else {
        console.error(`❌ [API] Lesson ${lesson.id} generation failed\n`);

        return NextResponse.json({
          id: lesson.id,
          title: lesson.title,
          status: 'failed',
          message: 'Lesson generation failed',
          mode: 'sync',
        }, { status: 201 }); // Still 201 since lesson was created, just failed to generate
      }
    }

  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}

