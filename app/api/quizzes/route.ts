// app/api/quizzes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import * as quizService from '@/backend/services/quizService';

// GET: Fetch all questions from database using sp_GetQuizDetails
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizIDParam = searchParams.get('quizID');
    
    let questions;
    if (quizIDParam) {
      // Get questions for specific quiz
      const quizID = parseInt(quizIDParam);
      questions = await quizService.getQuizQuestions(quizID);
    } else {
      // Get ALL questions from ALL quizzes
      questions = await quizService.getAllQuestions();
    }
    
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ 
      message: "Error fetching questions",
      error: error.message 
    }, { status: 500 });
  }
}

// POST: Create a new question using sp_AddQuestion
export async function POST(request: NextRequest) {
  try {
    const newQuestionData = await request.json();
    const quizID = newQuestionData.quizID || 1;
    
    // Validate required fields
    if (!newQuestionData.content || !newQuestionData.options || !newQuestionData.correctOptionId) {
      return NextResponse.json({ 
        message: 'Missing required fields: content, options, correctOptionId' 
      }, { status: 400 });
    }
    
    if (newQuestionData.options.length !== 4) {
      return NextResponse.json({ 
        message: 'Exactly 4 options are required' 
      }, { status: 400 });
    }
    
    const newQuestion = await quizService.addQuestion(quizID, newQuestionData);
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error: any) {
    console.error("Error creating question:", error);
    
    if (error.message?.includes('Total question score exceeds')) {
      return NextResponse.json({ 
        message: 'Cannot add question: Total score would exceed quiz maximum',
        error: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: "Error creating question",
      error: error.message 
    }, { status: 500 });
  }
}
