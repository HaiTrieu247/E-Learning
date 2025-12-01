import userController from '@/backend/controllers/userController.js';

export async function GET() {
    return await userController.getUsers();
}
