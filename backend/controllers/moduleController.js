import moduleService from '@/backend/services/moduleService.js';

class ModuleController {
    async getModulesByCourse(req) {
        try {
            const courseId = req.url.split('/').slice(-2, -1)[0];
            const modules = await moduleService.getModulesByCourse(courseId);
            
            return new Response(JSON.stringify(modules), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error in getModulesByCourse:', error);
            return new Response(JSON.stringify({ message: 'Failed to fetch modules' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async getModuleDetails(req) {
        try {
            const url = new URL(req.url);
            const pathParts = url.pathname.split('/');
            const moduleId = pathParts[pathParts.length - 2];
            
            const details = await moduleService.getModuleDetails(moduleId);
            
            return new Response(JSON.stringify(details), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Error in getModuleDetails:', error);
            return new Response(JSON.stringify({ message: 'Failed to fetch module details' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

export default new ModuleController();
