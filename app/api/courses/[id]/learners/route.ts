import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseID } = await params;
    const url = new URL(request.url);
    const enrollmentStatus = url.searchParams.get('enrollmentStatus') || 'active';

    console.log('[API] Received request for courseID:', courseID, 'status:', enrollmentStatus);

    if (!courseID) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Call the service
    const learnerService = require('@/backend/services/learnerService');
    console.log('[API] Calling learnerService...');
    
    const learners = await learnerService.getActiveLearnersInCourse(
      parseInt(courseID),
      enrollmentStatus
    );

    console.log('[API] Received learners:', learners);
    console.log('[API] Is array?', Array.isArray(learners));

    // Ensure we return an array
    const result = Array.isArray(learners) ? learners : [];
    console.log('[API] Returning result with', result.length, 'items');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Error fetching active learners:');
    console.error('[API] Error message:', error.message);
    console.error('[API] Error stack:', error.stack);
    console.error('[API] Full error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
