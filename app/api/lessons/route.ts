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

    // IMPORTANT: Must await generation to prevent serverless function from terminating
    // before the AI call completes. Serverless functions can be killed after sending
    // the response, so fire-and-forget doesn't work reliably in production.
    await generateAndUpdateLesson(lesson.id, outline);

    // Fetch updated lesson (now with generated content or error)
    const updatedLesson = await getAllLessons().then(lessons =>
      lessons.find(l => l.id === lesson.id) || lesson
    );

    return NextResponse.json({
      id: updatedLesson.id,
      title: updatedLesson.title,
      status: updatedLesson.status,
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
    console.log(`[LESSON ${lessonId}] Starting generation...`);
    console.log(`[LESSON ${lessonId}] Outline: "${outline}"`);

    // Check environment variables
    console.log(`[LESSON ${lessonId}] Environment check:`);
    console.log(`  - GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'SET (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'NOT SET'}`);
    console.log(`  - AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set (will use default)'}`);
    console.log(`  - AI_MODEL_NAME: ${process.env.AI_MODEL_NAME || 'not set (will use default)'}`);
    console.log(`  - ENABLE_IMAGE_GENERATION: ${process.env.ENABLE_IMAGE_GENERATION || 'not set (default: false)'}`);
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);

    // Generate the lesson using AI
    console.log(`[LESSON ${lessonId}] Calling generateLesson()...`);
    const result = await generateLesson(outline);
    console.log(`[LESSON ${lessonId}] Generation result:`, {
      success: result.success,
      hasContent: !!result.content,
      contentLength: result.content?.length || 0,
      error: result.error,
    });

    if (result.success && result.content) {
      // Update lesson with generated content
      console.log(`[LESSON ${lessonId}] Updating database with generated content...`);
      await updateLessonStatus(lessonId, 'completed', result.content);
      console.log(`[LESSON ${lessonId}] ✅ Successfully generated and saved`);
    } else {
      // Update lesson with error
      const errorMessage = result.error || 'Generation failed';
      console.error(`[LESSON ${lessonId}] ❌ Generation failed: ${errorMessage}`);
      await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);
    }
  } catch (error) {
    // Update lesson with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`[LESSON ${lessonId}] ❌ EXCEPTION in generateAndUpdateLesson:`);
    console.error(`  Message: ${errorMessage}`);
    console.error(`  Stack: ${errorStack}`);
    console.error(`  Full error:`, error);

    await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);
  }
}
