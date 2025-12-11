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

    // Step 1: Check if user is an instructor (exists in INSTRUCTOR table)
    const [instructorRows] = await connection.execute(
      `SELECT UserID FROM INSTRUCTOR WHERE UserID = ?`,
      [userID]
    );

    console.log('🔍 Query 1 - INSTRUCTOR table:', instructorRows);

    if (!Array.isArray(instructorRows) || instructorRows.length === 0) {
      console.log('❌ No instructor found for userID:', userID);
      canEdit = false;
    } else {
      const instructorUserID = (instructorRows[0] as any).UserID;
      console.log('✅ Found instructor UserID:', instructorUserID);

      // Step 2: Find courseID from quizID using create_table.sql schema
      const [courseRows] = await connection.execute(
        `SELECT m.CourseID
         FROM Quiz q
         JOIN Assignment a ON q.AssignmentID = a.AssignmentID
         JOIN Lesson l ON a.LessonID = l.LessonID
         JOIN Module m ON l.ModuleID = m.ModuleID
         WHERE q.quizID = ?`,
        [quizID]
      );

      console.log('🔍 Query 2 - course from quiz:', courseRows);

      if (!Array.isArray(courseRows) || courseRows.length === 0) {
        console.log('❌ No course found for quizID:', quizID);
        canEdit = false;
      } else {
        const courseID = (courseRows[0] as any).CourseID;
        console.log('✅ Found courseID:', courseID);

        // Step 3: Check if instructor designed this course (DESIGN table)
        const [assignmentRows] = await connection.execute(
          `SELECT Instructor_UserID 
           FROM DESIGN 
           WHERE Course_CourseID = ? AND Instructor_UserID = ?`,
          [courseID, instructorUserID]
        );

        console.log('🔍 Query 3 - DESIGN table:', assignmentRows);
        console.log('🔍 Query 3 params:', { courseID, instructorUserID });

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
