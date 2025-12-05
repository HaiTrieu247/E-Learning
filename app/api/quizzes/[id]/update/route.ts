import { NextResponse } from 'next/server';
import createConnection from '@/backend/config/db.js';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quizID = parseInt(params.id);
    const body = await request.json();
    const { quizTitle, totalMarks, passingMarks, quizDuration, startDate, dueDate, assignmentID } = body;

    // Validate input
    if (!quizTitle || !totalMarks || !passingMarks || !quizDuration) {
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

    let connection;
    
    try {
      connection = await createConnection();
      
      // Update quiz
      await connection.execute(
        `UPDATE Quizzes 
         SET quizTitle = ?, totalMarks = ?, passingMarks = ?, quizDuration = ?
         WHERE quizID = ?`,
        [quizTitle, totalMarks, passingMarks, quizDuration, quizID]
      );

      // Update assignment dates if provided
      if (assignmentID && startDate && dueDate) {
        await connection.execute(
          `UPDATE lessonAssignments 
           SET startDate = ?, dueDate = ?
           WHERE assignmentID = ?`,
          [startDate, dueDate, assignmentID]
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Quiz updated successfully'
      });
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error('Error closing connection:', e);
        }
      }
    }
  } catch (error: any) {
    console.error('Error in PUT /api/quizzes/[id]/update:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update quiz' },
      { status: 500 }
    );
  }
}
