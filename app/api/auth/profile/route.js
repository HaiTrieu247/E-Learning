import authController from '@/backend/controllers/authController.js';

export async function GET(request) {
    // Get userID from query or session (simplified version)
    const url = new URL(request.url);
    const userID = url.searchParams.get('userID');
    
    if (!userID) {
        return NextResponse.json(
            { message: 'User ID is required' },
            { status: 400 }
        );
    }
    
    return await authController.getProfile(parseInt(userID));
}

export async function PUT(request) {
    // Get userID from query or session
    const url = new URL(request.url);
    const userID = url.searchParams.get('userID');
    
    if (!userID) {
        return NextResponse.json(
            { message: 'User ID is required' },
            { status: 400 }
        );
    }
    
    return await authController.updateProfile(request, parseInt(userID));
}
