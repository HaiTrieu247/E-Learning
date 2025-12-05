import moduleController from '@/backend/controllers/moduleController.js';

export async function GET(request) {
    return await moduleController.getModuleDetails(request);
}
