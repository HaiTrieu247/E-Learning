import { createConnection } from '../config/db.js';

export class UserService {
    async getAllUsers() {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(
                `SELECT u.*, 
                        i.instructorID, 
                        l.learnerID, 
                        a.adminID 
                 FROM users u
                 LEFT JOIN instructors i ON u.userID = i.userID
                 LEFT JOIN learners l ON u.userID = l.userID
                 LEFT JOIN administrators a ON u.userID = a.adminID`
            );
            return rows;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (e) {
                    console.error('Error closing connection:', e);
                }
            }
        }
    }

    async getUserById(userId) {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(
                `SELECT u.*, 
                        i.instructorID, 
                        l.learnerID, 
                        a.adminID 
                 FROM users u
                 LEFT JOIN instructors i ON u.userID = i.userID
                 LEFT JOIN learners l ON u.userID = l.userID
                 LEFT JOIN administrators a ON u.userID = a.adminID
                 WHERE u.userID = ?`,
                [userId]
            );
            return rows[0];
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (e) {
                    console.error('Error closing connection:', e);
                }
            }
        }
    }

    async getUsersByRole(role) {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(
                "SELECT * FROM users WHERE role = ?",
                [role]
            );
            return rows;
        } catch (error) {
            console.error("Error fetching users by role:", error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (e) {
                    console.error('Error closing connection:', e);
                }
            }
        }
    }
}

export default new UserService();
