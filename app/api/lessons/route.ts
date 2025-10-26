import { NextRequest, NextResponse } from 'next/server';
import { createLesson, getAllLessons, updateLessonStatus } from '@/lib/db/lessons-server';
import { generateLesson } from '@/lib/ai/generator';
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

    // Start async generation (don't await - let it run in background)
    generateAndUpdateLesson(lesson.id, outline).catch(error => {
      console.error('Background generation error:', error);
    });

    // Return immediately with the lesson ID
    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      status: lesson.status,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}

/**
 * Background function to generate lesson and update database
 */
async function generateAndUpdateLesson(lessonId: string, outline: string) {
  try {
    console.log(`Starting generation for lesson ${lessonId}`);

    // Generate the lesson using AI
    const result = await generateLesson(outline);

    if (result.success && result.content) {
      // Update lesson with generated content
      await updateLessonStatus(lessonId, 'completed', result.content);
      console.log(`Successfully generated lesson ${lessonId}`);
    } else {
      // Update lesson with error
      await updateLessonStatus(
        lessonId,
        'failed',
        undefined,
        result.error || 'Generation failed'
      );
      console.error(`Failed to generate lesson ${lessonId}:`, result.error);
    }
  } catch (error) {
    // Update lesson with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);
    console.error(`Error in generateAndUpdateLesson for ${lessonId}:`, error);
  }
}
