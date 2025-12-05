import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/backend/config/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const quizID = params.id;
  const { searchParams } = new URL(request.url);
  const userID = searchParams.get('userID');

  console.log('🔍 Quiz Permission Check - quizID:', quizID, 'userID:', userID);

  if (!userID) {
    console.log('❌ No userID provided');
    return NextResponse.json({ canEdit: false });
  }

  if (!quizID) {
    console.log('❌ No quizID found');
    return NextResponse.json({ canEdit: false });
  }

  let connection;
  let canEdit = false;
  
  try {
    connection = await createConnection();

    // Step 1: Get instructorID from userID
    const [instructorRows] = await connection.execute(
      `SELECT instructorID FROM instructors WHERE userID = ?`,
      [userID]
    );

    console.log('🔍 Query 1 - instructors table:', instructorRows);

    if (!Array.isArray(instructorRows) || instructorRows.length === 0) {
      console.log('❌ No instructor found for userID:', userID);
      canEdit = false;
    } else {
      const instructorID = (instructorRows[0] as any).instructorID;
      console.log('✅ Found instructorID:', instructorID);

      // Step 2: Find courseID from quizID
      const [courseRows] = await connection.execute(
        `SELECT cm.courseID
         FROM Quizzes q
         JOIN lessonAssignments la ON q.assignmentID = la.assignmentID
         JOIN moduleLessons ml ON la.lessonID = ml.lessonID
         JOIN courseModules cm ON ml.moduleID = cm.moduleID
         WHERE q.quizID = ?`,
        [quizID]
      );

      console.log('🔍 Query 2 - course from quiz:', courseRows);

      if (!Array.isArray(courseRows) || courseRows.length === 0) {
        console.log('❌ No course found for quizID:', quizID);
        canEdit = false;
      } else {
        const courseID = (courseRows[0] as any).courseID;
        console.log('✅ Found courseID:', courseID);

        // Step 3: Check if instructor is assigned to this course
        const [assignmentRows] = await connection.execute(
          `SELECT instructorID 
           FROM courseDesignments 
           WHERE courseID = ? AND instructorID = ?`,
          [courseID, instructorID]
        );

        console.log('🔍 Query 3 - courseDesignments:', assignmentRows);
        console.log('🔍 Query 3 params:', { courseID, instructorID });

        canEdit = Array.isArray(assignmentRows) && assignmentRows.length > 0;
        console.log('✅ Final canEdit:', canEdit);
      }
    }
  } catch (error: any) {
    console.error('❌ Error checking quiz instructor access:', error.message);
    canEdit = false;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }

  return NextResponse.json({ canEdit });
}
