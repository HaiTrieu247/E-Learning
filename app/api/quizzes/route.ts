// app/api/quizzes/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getAllQuestions, addQuestion } from './mock-data';

// GET: Fetch all questions
export async function GET() {
  // Add a delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  const questions = getAllQuestions();
  return NextResponse.json(questions);
}

// POST: Create a new question
export async function POST(request: NextRequest) {
  try {
    const newQuestionData = await request.json();
    const newQuestion = addQuestion(newQuestionData);
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    // It's good practice to log the actual error on the server
    console.error("Error creating question:", error);
    return NextResponse.json({ message: "Error creating question" }, { status: 500 });
  }
}
