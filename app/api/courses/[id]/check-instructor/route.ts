import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/backend/config/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const courseID = params.id;
  const { searchParams } = new URL(request.url);
  const userID = searchParams.get('userID');

  console.log('🔍 API Called - courseID:', courseID, 'userID:', userID);

  if (!userID) {
    console.log('❌ No userID provided');
    return NextResponse.json({ canEdit: false });
  }

  if (!courseID) {
    console.log('❌ No courseID found');
    return NextResponse.json({ canEdit: false });
  }

  let connection;
  let canEdit = false;
  
  try {
    connection = await createConnection();

    // Check if user is instructor in new schema (INSTRUCTOR table with UserID)
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

      // Check if this instructor is assigned to this course via DESIGN table
      const [rows] = await connection.execute(
        `SELECT Instructor_UserID 
         FROM DESIGN 
         WHERE Course_CourseID = ? AND Instructor_UserID = ?`,
        [courseID, instructorUserID]
      );

      console.log('🔍 Query 2 - DESIGN table:', rows);
      console.log('🔍 Query 2 params:', { courseID, instructorUserID, courseIDType: typeof courseID, instructorUserIDType: typeof instructorUserID });

      canEdit = Array.isArray(rows) && rows.length > 0;
      console.log('✅ Final canEdit:', canEdit);
    }
  } catch (error: any) {
    console.error('Error checking instructor access:', error.message);
    canEdit = false;
  } finally {
    // Always close connection in finally block
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore connection close error
      }
    }
  }
  
  return NextResponse.json({ canEdit });
}
