import { NextResponse } from 'next/server';
import quizController from '@/backend/controllers/quizController';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonID, quizTitle, totalMarks, passingMarks, quizDuration, startDate, dueDate } = body;

    // Validate input
    if (!lessonID || !quizTitle || !totalMarks || !passingMarks || !quizDuration || !startDate || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (totalMarks < passingMarks) {
      return NextResponse.json(
        { error: 'Total marks must be greater than or equal to passing marks' },
        { status: 400 }
      );
    }

    if (new Date(dueDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: 'Due date must be after start date' },
        { status: 400 }
      );
    }

    const result = await quizController.createQuiz(
      lessonID,
      quizTitle,
      totalMarks,
      passingMarks,
      quizDuration,
      startDate,
      dueDate
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in POST /api/quizzes/create:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
