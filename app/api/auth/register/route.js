import authController from '@/backend/controllers/authController.js';

export async function POST(request) {
    return await authController.register(request);
}
