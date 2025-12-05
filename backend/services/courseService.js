import { createConnection } from '../config/db.js';

export class CourseService {
    async getAllCourses() {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(`
                SELECT 
                    c.courseID, 
                    c.courseTitle, 
                    c.courseDescription, 
                    c.categoryID,
                    cc.categoryName,
                    c.approvalStatus,
                    c.courseStatus,
                    c.createdDate,
                    c.lastModified
                FROM courses c
                LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
            `);
            return rows;
        } catch (error) {
            console.error("Error fetching courses:", error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (e) {
                    console.error("Error closing connection:", e);
                }
            }
        }
    }

    async getCourseById(courseId) {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(
                `SELECT 
                    c.courseID, 
                    c.courseTitle, 
                    c.courseDescription, 
                    c.categoryID,
                    cc.categoryName,
                    c.approvalStatus,
                    c.courseStatus,
                    c.createdDate,
                    c.lastModified
                FROM courses c
                LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
                WHERE c.courseID = ?`,
                [courseId]
            );
            return rows[0];
        } catch (error) {
            console.error("Error fetching course:", error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (e) {
                    console.error("Error closing connection:", e);
                }
            }
        }
    }

    async getCoursesByCategory(categoryId) {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(
                `SELECT 
                    c.courseID, 
                    c.courseTitle, 
                    c.courseDescription, 
                    c.categoryID,
                    cc.categoryName,
                    c.approvalStatus,
                    c.courseStatus,
                    c.createdDate,
                    c.lastModified
                FROM courses c
                LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
                WHERE c.categoryID = ?`,
                [categoryId]
            );
            return rows;
        } catch (error) {
            console.error("Error fetching courses by category:", error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (e) {
                    console.error("Error closing connection:", e);
                }
            }
        }
    }
}

export default new CourseService();
