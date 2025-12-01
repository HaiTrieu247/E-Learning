import { createConnection } from '../config/db.js';

export class UserService {
    async getAllUsers() {
        try {
            const connection = await createConnection();
            const [rows] = await connection.execute("SELECT * FROM users");
            return rows;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const connection = await createConnection();
            const [rows] = await connection.execute(
                "SELECT * FROM users WHERE userID = ?",
                [userId]
            );
            return rows[0];
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }

    async getUsersByRole(role) {
        try {
            const connection = await createConnection();
            const [rows] = await connection.execute(
                "SELECT * FROM users WHERE role = ?",
                [role]
            );
            return rows;
        } catch (error) {
            console.error("Error fetching users by role:", error);
            throw error;
        }
    }
}

export default new UserService();
