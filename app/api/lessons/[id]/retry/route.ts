import { NextRequest, NextResponse } from 'next/server';
import { getLesson, updateLessonStatus } from '@/lib/db/lessons-server';
import { generateLesson } from '@/lib/ai/generator';

/**
 * POST /api/lessons/[id]/retry - Retry generating a failed lesson
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Update status back to generating
    await updateLessonStatus(id, 'generating');

    // IMPORTANT: Must await generation to prevent serverless function from terminating
    // before the AI call completes. Serverless functions can be killed after sending
    // the response, so fire-and-forget doesn't work reliably in production.
    await generateAndUpdateLesson(id, lesson.outline);

    // Fetch updated lesson (now with generated content or error)
    const updatedLesson = await getLesson(id);

    return NextResponse.json({
      id: updatedLesson?.id || id,
      status: updatedLesson?.status || 'generating',
      message: 'Lesson generation completed',
    });

  } catch (error) {
    console.error('Error retrying lesson:', error);
    return NextResponse.json(
      { error: 'Failed to retry lesson generation' },
      { status: 500 }
    );
  }
}

/**
 * Background function to generate lesson and update database
 */
async function generateAndUpdateLesson(lessonId: string, outline: string) {
  try {
    console.log(`Retrying generation for lesson ${lessonId}`);

    // Generate the lesson using AI
    const result = await generateLesson(outline);

    if (result.success && result.content) {
      // Update lesson with generated content
      await updateLessonStatus(lessonId, 'completed', result.content);
      console.log(`Successfully regenerated lesson ${lessonId}`);
    } else {
      // Update lesson with error
      await updateLessonStatus(
        lessonId,
        'failed',
        undefined,
        result.error || 'Generation failed'
      );
      console.error(`Failed to regenerate lesson ${lessonId}:`, result.error);
    }
  } catch (error) {
    // Update lesson with error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateLessonStatus(lessonId, 'failed', undefined, errorMessage);
    console.error(`Error in generateAndUpdateLesson for ${lessonId}:`, error);
  }
}
