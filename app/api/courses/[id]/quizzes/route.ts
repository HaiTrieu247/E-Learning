// app/api/courses/[id]/quizzes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import * as quizService from '@/backend/services/quizService';

// GET: Fetch all quizzes for a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseID = parseInt(id);
    
    if (isNaN(courseID)) {
      return NextResponse.json({ 
        message: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    const quizzes = await quizService.getQuizzesByCourse(courseID);
    return NextResponse.json(quizzes);
  } catch (error: any) {
    console.error("Error fetching quizzes for course:", error);
    return NextResponse.json({ 
      message: "Error fetching quizzes",
      error: error.message 
    }, { status: 500 });
  }
}
