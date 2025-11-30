// app/api/quizzes/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getQuestionById, updateQuestionById, deleteQuestionById } from '../mock-data';

// GET: Retrieve a single question
export async function GET(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const id = parseInt(params.id, 10);
    const question = getQuestionById(id);

    if (!question) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    const params = await paramsPromise;
    console.error(`Error fetching question ${params.id}:`, error);
    return NextResponse.json({ message: "Error fetching question" }, { status: 500 });
  }
}

// PUT: Update a question
export async function PUT(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const id = parseInt(params.id, 10);
    const updatedData = await request.json();
    
    const updatedQuestion = updateQuestionById(id, updatedData);

    if (!updatedQuestion) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    const params = await paramsPromise;
    console.error(`Error updating question ${params.id}:`, error);
    return NextResponse.json({ message: "Error updating question" }, { status: 500 });
  }
}

// DELETE: Delete a question
export async function DELETE(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const id = parseInt(params.id, 10);
    const success = deleteQuestionById(id);

    if (!success) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    const params = await paramsPromise;
    console.error(`Error deleting question ${params.id}:`, error);
    return NextResponse.json({ message: "Error deleting question" }, { status: 500 });
  }
}
