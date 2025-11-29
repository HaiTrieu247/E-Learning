import { createConnection } from '../config/db.js';

export class CourseService {
    async getAllCourses() {
        try {
            const connection = await createConnection();
            const [rows] = await connection.execute(`
                SELECT 
                    c.courseID, 
                    c.courseTitle, 
                    c.courseDescription, 
                    c.categoryID,
                    cc.categoryName
                FROM courses c
                LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
            `);
            return rows;
        } catch (error) {
            console.error("Error fetching courses:", error);
            throw error;
        }
    }

    async getCourseById(courseId) {
        try {
            const connection = await createConnection();
            const [rows] = await connection.execute(
                `SELECT 
                    c.courseID, 
                    c.courseTitle, 
                    c.courseDescription, 
                    c.categoryID,
                    cc.categoryName
                FROM courses c
                LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
                WHERE c.courseID = ?`,
                [courseId]
            );
            return rows[0];
        } catch (error) {
            console.error("Error fetching course:", error);
            throw error;
        }
    }

    async getCoursesByCategory(categoryId) {
        try {
            const connection = await createConnection();
            const [rows] = await connection.execute(
                `SELECT 
                    c.courseID, 
                    c.courseTitle, 
                    c.courseDescription, 
                    c.categoryID,
                    cc.categoryName
                FROM courses c
                LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
                WHERE c.categoryID = ?`,
                [categoryId]
            );
            return rows;
        } catch (error) {
            console.error("Error fetching courses by category:", error);
            throw error;
        }
    }
}

export default new CourseService();
