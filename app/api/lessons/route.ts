import { NextRequest, NextResponse } from 'next/server';
import { createLesson, getAllLessons } from '@/lib/db/lessons-server';
import { inngest } from '@/lib/inngest/client';
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

    // Generate a temporary title
    const tempTitle = `Lesson: ${outline.slice(0, 40)}...`;

    // Create lesson in database with 'generating' status
    const lesson = await createLesson(tempTitle, outline);

    // Trigger Inngest background job for lesson generation
    // This returns immediately - Inngest handles the background processing
    await inngest.send({
      name: 'lesson/generate.requested',
      data: {
        lessonId: lesson.id,
        outline: outline,
      },
    });

    console.log(`✅ Lesson ${lesson.id} queued for generation via Inngest`);

    // Return immediately - frontend will poll or receive real-time updates via Supabase
    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      status: lesson.status,
      message: 'Lesson queued for generation',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}

