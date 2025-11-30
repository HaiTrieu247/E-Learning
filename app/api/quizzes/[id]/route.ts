// app/api/quizzes/[id]/route.ts
import { NextResponse } from 'next/server';
// We need access to the 'questions' array from the parent route.
// In a real app, this would come from a database.
// For this simulation, we'll have to re-declare it or find a way to share it.
// To keep it simple, we'll just re-declare it here. A proper solution would use a shared module or DB.

import type { Question } from '@/types/quiz';

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


// Note: This is not a robust way to share state between routes.
// In a real application, you would use a database.

// PUT: Update a question
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const updatedData = await request.json();
    const questionIndex = questions.findIndex(q => q.id === id);

    if (questionIndex === -1) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    questions[questionIndex] = { ...questions[questionIndex], ...updatedData };
    return NextResponse.json(questions[questionIndex]);
  } catch (error) {
    return NextResponse.json({ message: "Error updating question", error }, { status: 500 });
  }
}

// DELETE: Delete a question
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const initialLength = questions.length;
    questions = questions.filter(q => q.id !== id);

    if (questions.length === initialLength) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    return NextResponse.json({ message: "Error deleting question", error }, { status: 500 });
  }
}
