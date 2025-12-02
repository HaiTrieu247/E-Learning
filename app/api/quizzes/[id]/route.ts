// app/api/quizzes/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import * as quizService from '@/backend/services/quizService';

// GET: Retrieve a single question from database
export async function GET(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const id = parseInt(params.id, 10);
    const question = await quizService.getQuestionById(id);

    if (!question) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error: any) {
    const params = await paramsPromise;
    console.error(`Error fetching question ${params.id}:`, error);
    return NextResponse.json({ 
      message: "Error fetching question",
      error: error.message 
    }, { status: 500 });
  }
}

// PUT: Update a question using sp_UpdateQuestion
export async function PUT(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const id = parseInt(params.id, 10);
    const updatedData = await request.json();
    
    // Validate required fields
    if (!updatedData.content || !updatedData.options || !updatedData.correctOptionId) {
      return NextResponse.json({ 
        message: 'Missing required fields: content, options, correctOptionId' 
      }, { status: 400 });
    }
    
    if (updatedData.options.length !== 4) {
      return NextResponse.json({ 
        message: 'Exactly 4 options are required' 
      }, { status: 400 });
    }
    
    const updatedQuestion = await quizService.updateQuestion(id, updatedData);

    if (!updatedQuestion) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(updatedQuestion);
  } catch (error: any) {
    const params = await paramsPromise;
    console.error(`Error updating question ${params.id}:`, error);
    
    if (error.message?.includes('Total question score exceeds')) {
      return NextResponse.json({ 
        message: 'Cannot update question: Total score would exceed quiz maximum',
        error: error.message 
      }, { status: 400 });
    }
    
    if (error.message?.includes('Question ID not found')) {
      return NextResponse.json({ 
        message: 'Question not found',
        error: error.message 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "Error updating question",
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE: Delete a question using sp_DeleteQuestion
export async function DELETE(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const id = parseInt(params.id, 10);
    const success = await quizService.deleteQuestion(id);

    if (!success) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error: any) {
    const params = await paramsPromise;
    console.error(`Error deleting question ${params.id}:`, error);
    
    if (error.message?.includes('Cannot delete question')) {
      return NextResponse.json({ 
        message: 'Cannot delete question: Options exist',
        error: error.message 
      }, { status: 400 });
    }
    
    if (error.message?.includes('Question ID not found')) {
      return NextResponse.json({ 
        message: 'Question not found',
        error: error.message 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "Error deleting question",
      error: error.message 
    }, { status: 500 });
  }
}
