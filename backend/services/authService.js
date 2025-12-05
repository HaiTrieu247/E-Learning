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

            // Check if username or email already exists
            const [existingUsers] = await connection.execute(
                'SELECT userID FROM users WHERE username = ? OR email = ?',
                [userData.username, userData.email]
            );

            if (existingUsers.length > 0) {
                throw new Error('Username or email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create manageObject first
            const [objectResult] = await connection.execute(
                `INSERT INTO manageObjects (objectType, objectApprovalStatus, createdDate, objectStatus) 
                 VALUES ('user', 'approved', CURDATE(), 'active')`
            );
            const objectID = objectResult.insertId;

            // Insert user
            const [userResult] = await connection.execute(
                `INSERT INTO users (objectID, FNAME, LNAME, phoneNumber, email, username, password_hashed, role) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    objectID,
                    userData.firstName,
                    userData.lastName,
                    userData.phoneNumber,
                    userData.email,
                    userData.username,
                    hashedPassword,
                    userData.role
                ]
            );
            const userID = userResult.insertId;

            // Insert into role-specific table
            if (userData.role === 'learner') {
                await connection.execute(
                    'INSERT INTO learners (userID, enrollmentDate) VALUES (?, CURDATE())',
                    [userID]
                );
            } else if (userData.role === 'instructor') {
                await connection.execute(
                    'INSERT INTO instructors (userID, Bio, specialty) VALUES (?, ?, ?)',
                    [userID, '', '']
                );
            } else if (userData.role === 'admin') {
                await connection.execute(
                    'INSERT INTO administrators (userID, accessLevel) VALUES (?, ?)',
                    [userID, 'content_manager']
                );
            }

            await connection.commit();

            // Return user without password
            const [newUser] = await connection.execute(
                'SELECT userID, FNAME, LNAME, email, username, role, phoneNumber FROM users WHERE userID = ?',
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
    async login(username, password) {
        let connection;
        try {
            connection = await createConnection();
            
            // Get user by username
            const [users] = await connection.execute(
                'SELECT userID, FNAME, LNAME, email, username, password_hashed, role, phoneNumber FROM users WHERE username = ?',
                [username]
            );

            if (users.length === 0) {
                throw new Error('Invalid username or password');
            }

            const user = users[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hashed);
            
            if (!isPasswordValid) {
                throw new Error('Invalid username or password');
            }

            // Remove password from response
            delete user.password_hashed;

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
                'SELECT userID, FNAME, LNAME, email, username, role, phoneNumber FROM users WHERE userID = ?',
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
            
            const allowedFields = ['FNAME', 'LNAME', 'email', 'phoneNumber'];
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
                `UPDATE users SET ${updateFields.join(', ')} WHERE userID = ?`,
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
            
            // Get current password hash
            const [users] = await connection.execute(
                'SELECT password_hashed FROM users WHERE userID = ?',
                [userID]
            );

            if (users.length === 0) {
                throw new Error('User not found');
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hashed);
            
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await connection.execute(
                'UPDATE users SET password_hashed = ? WHERE userID = ?',
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
