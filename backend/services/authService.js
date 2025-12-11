import { createConnection } from '../config/db.js';
import bcrypt from 'bcryptjs';

export class AuthService {
    /**
     * Register a new user
     */
    async register(userData) {
        let connection;
        try {
            connection = await createConnection();
            await connection.beginTransaction();

            // Check if email already exists in USER table
            const [existingUsers] = await connection.execute(
                'SELECT UserID FROM USER WHERE Email = ?',
                [userData.email]
            );

            if (existingUsers.length > 0) {
                throw new Error('Email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Insert user into USER table
            const [userResult] = await connection.execute(
                `INSERT INTO USER (FullName, username, phoneNumber, Email, Password_hash, Role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    `${userData.firstName} ${userData.lastName}`,
                    userData.username || userData.email.split('@')[0],
                    userData.phoneNumber,
                    userData.email,
                    hashedPassword,
                    userData.role
                ]
            );
            const userID = userResult.insertId;

            // Insert into role-specific table
            if (userData.role === 'learner') {
                await connection.execute(
                    'INSERT INTO LEARNER (UserID, Birthday) VALUES (?, ?)',
                    [userID, userData.birthday || null]
                );
            } else if (userData.role === 'instructor') {
                await connection.execute(
                    'INSERT INTO INSTRUCTOR (UserID, Bio, Specialization) VALUES (?, ?, ?)',
                    [userID, '', '']
                );
            } else if (userData.role === 'admin') {
                await connection.execute(
                    'INSERT INTO ADMIN (UserID, adminID, accessLevel) VALUES (?, ?, ?)',
                    [userID, userID, 2]
                );
            }

            await connection.commit();

            // Return user without password
            const [newUser] = await connection.execute(
                'SELECT UserID, FullName, Email, Role, phoneNumber FROM USER WHERE UserID = ?',
                [userID]
            );

            return newUser[0];
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error in register:', error);
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

    /**
     * Login user
     */
    async login(email, password) {
        let connection;
        try {
            connection = await createConnection();
            
            // Get user by email from USER table
            const [users] = await connection.execute(
                'SELECT UserID, FullName, Email, Password_hash, Role, phoneNumber FROM USER WHERE Email = ?',
                [email]
            );

            if (users.length === 0) {
                throw new Error('Invalid email or password');
            }

            const user = users[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.Password_hash);
            
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Remove password from response
            delete user.Password_hash;

            return user;
        } catch (error) {
            console.error('Error in login:', error);
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

    /**
     * Get user by ID
     */
    async getUserById(userID) {
        let connection;
        try {
            connection = await createConnection();
            
            const [users] = await connection.execute(
                'SELECT UserID, FullName, Email, Role, phoneNumber FROM USER WHERE UserID = ?',
                [userID]
            );

            return users[0] || null;
        } catch (error) {
            console.error('Error in getUserById:', error);
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

    /**
     * Update user profile
     */
    async updateProfile(userID, updates) {
        let connection;
        try {
            connection = await createConnection();
            
            const allowedFields = ['FullName', 'Email', 'phoneNumber'];
            const updateFields = [];
            const values = [];

            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    values.push(updates[field]);
                }
            }

            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            values.push(userID);

            await connection.execute(
                `UPDATE USER SET ${updateFields.join(', ')} WHERE UserID = ?`,
                values
            );

            return await this.getUserById(userID);
        } catch (error) {
            console.error('Error in updateProfile:', error);
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

    /**
     * Change password
     */
    async changePassword(userID, currentPassword, newPassword) {
        let connection;
        try {
            connection = await createConnection();
            
            // Get current password hash from USER table
            const [users] = await connection.execute(
                'SELECT Password_hash FROM USER WHERE UserID = ?',
                [userID]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, users[0].Password_hash);
            
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password in USER table
            await connection.execute(
                'UPDATE USER SET Password_hash = ? WHERE UserID = ?',
                [hashedPassword, userID]
            );

            return true;
        } catch (error) {
            console.error('Error in changePassword:', error);
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

export default new AuthService();
