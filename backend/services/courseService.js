import { createConnection } from '../config/db.js';

export class CourseService {
    async getAllCourses() {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(`
                SELECT 
                    c.CourseID, 
                    c.CTitle, 
                    c.Description, 
                    c.Created_date,
                    c.Status,
                    c.CategoryID,
                    cc.Name as CategoryName
                FROM Course c
                LEFT JOIN Course_category cc ON c.CategoryID = cc.CategoryID
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
                    c.CourseID, 
                    c.CTitle, 
                    c.Description, 
                    c.Created_date,
                    c.Status,
                    c.CategoryID,
                    cc.Name as CategoryName
                FROM Course c
                LEFT JOIN Course_category cc ON c.CategoryID = cc.CategoryID
                WHERE c.CourseID = ?`,
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
                    c.CourseID, 
                    c.CTitle, 
                    c.Description, 
                    c.Created_date,
                    c.Status,
                    c.CategoryID,
                    cc.Name as CategoryName
                FROM Course c
                LEFT JOIN Course_category cc ON c.CategoryID = cc.CategoryID
                WHERE c.CategoryID = ?`,
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
