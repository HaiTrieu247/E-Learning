import { createConnection } from '../config/db.js';

export class UserService {
    async getAllUsers() {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(
                `SELECT u.UserID, 
                        u.FullName, 
                        u.Email, 
                        u.phoneNumber, 
                        u.Role,
                        u.DateCreated,
                        l.Birthday,
                        i.Bio,
                        i.Specialization,
                        a.adminID,
                        a.accessLevel
                 FROM USER u
                 LEFT JOIN LEARNER l ON u.UserID = l.UserID
                 LEFT JOIN INSTRUCTOR i ON u.UserID = i.UserID
                 LEFT JOIN ADMIN a ON u.UserID = a.UserID`
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
                `SELECT u.UserID, 
                        u.FullName, 
                        u.Email, 
                        u.phoneNumber, 
                        u.Role,
                        u.DateCreated,
                        l.Birthday,
                        i.Bio,
                        i.Specialization,
                        a.adminID,
                        a.accessLevel
                 FROM USER u
                 LEFT JOIN LEARNER l ON u.UserID = l.UserID
                 LEFT JOIN INSTRUCTOR i ON u.UserID = i.UserID
                 LEFT JOIN ADMIN a ON u.UserID = a.UserID
                 WHERE u.UserID = ?`,
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
                "SELECT UserID, FullName, Email, phoneNumber, Role, DateCreated FROM USER WHERE Role = ?",
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
