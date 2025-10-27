import { NextRequest, NextResponse } from 'next/server';
import { getLesson, updateLessonStatus } from '@/lib/db/lessons-server';
import { inngest } from '@/lib/inngest/client';

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

    // Trigger Inngest background job for retry
    await inngest.send({
      name: 'lesson/generate.requested',
      data: {
        lessonId: id,
        outline: lesson.outline,
      },
    });

    console.log(`✅ Lesson ${id} retry queued via Inngest`);

    return NextResponse.json({
      id: id,
      status: 'generating',
      message: 'Lesson retry queued for generation',
    });

  } catch (error) {
    console.error('Error retrying lesson:', error);
    return NextResponse.json(
      { error: 'Failed to retry lesson generation' },
      { status: 500 }
    );
  }
}

