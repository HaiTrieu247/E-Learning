// app/api/quizzes/route.ts
import { NextResponse } from 'next/server';
import type { Question } from '@/types/quiz';

// --- Mock Data (Simulating a database) ---
let questions: Question[] = [
  {
    id: 1,
    content: "Which SQL statement is used to extract data from a database?",
    options: [
      { id: "A", text: "GET" },
      { id: "B", text: "OPEN" },
      { id: "C", text: "SELECT" },
      { id: "D", text: "EXTRACT" },
    ],
    correctOptionId: "C",
    points: 1.0,
    createdAt: "2023-10-01",
  },
  {
    id: 2,
    content: "Which of the following is NOT a type of NoSQL database?",
    options: [
      { id: "A", text: "Key-Value" },
      { id: "B", text: "Relational" },
      { id: "C", text: "Document" },
      { id: "D", text: "Graph" },
    ],
    correctOptionId: "B",
    points: 1.5,
    createdAt: "2023-10-05",
  },
];

// GET: Fetch all questions
export async function GET() {
  return NextResponse.json(questions);
}

// POST: Create a new question
export async function POST(request: Request) {
  try {
    const newQuestionData = await request.json();
    const newQuestion: Question = {
      id: Date.now(), // Use timestamp for unique ID
      createdAt: new Date().toISOString(),
      ...newQuestionData,
    };
    questions.unshift(newQuestion); // Add to the beginning of the array
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating question", error }, { status: 500 });
  }
}
