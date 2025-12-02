import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseID } = await params;
    const url = new URL(request.url);
    const minScore = url.searchParams.get('minScore') || '0';

    if (!courseID) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Call the service
    const learnerService = require('@/backend/services/learnerService');
    const performance = await learnerService.getStudentQuizPerformance(
      parseInt(courseID),
      parseFloat(minScore)
    );

    // Ensure we return an array
    const result = Array.isArray(performance) ? performance : [];
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching student quiz performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
