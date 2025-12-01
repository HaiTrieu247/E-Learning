import courseController from '@/backend/controllers/courseController.js';

export async function GET() {
    return await courseController.getCourses();
}
