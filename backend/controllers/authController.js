import authService from '../services/authService.js';
import { NextResponse } from 'next/server';

export class AuthController {
    /**
     * Register new user
     */
    async register(request) {
        try {
            const body = await request.json();
            
            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'username', 'phoneNumber', 'password', 'role'];
            for (const field of requiredFields) {
                if (!body[field]) {
                    return NextResponse.json(
                        { message: `${field} is required` },
                        { status: 400 }
                    );
                }
            }

            // Validate role
            if (!['learner', 'instructor', 'admin'].includes(body.role)) {
                return NextResponse.json(
                    { message: 'Invalid role' },
                    { status: 400 }
                );
            }

            // Register user
            const user = await authService.register(body);

            return NextResponse.json({
                message: 'Registration successful',
                user
            }, { status: 201 });
        } catch (error) {
            console.error('Error in register controller:', error);
            
            if (error.message.includes('already exists')) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { message: 'Registration failed', error: error.message },
                { status: 500 }
            );
        }
    }

    /**
     * Login user
     */
    async login(request) {
        try {
            const body = await request.json();
            const { username, password } = body;

            if (!username || !password) {
                return NextResponse.json(
                    { message: 'Username and password are required' },
                    { status: 400 }
                );
            }

            const user = await authService.login(username, password);

            return NextResponse.json({
                message: 'Login successful',
                user
            }, { status: 200 });
        } catch (error) {
            console.error('Error in login controller:', error);
            
            return NextResponse.json(
                { message: error.message || 'Login failed' },
                { status: 401 }
            );
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(userID) {
        try {
            const user = await authService.getUserById(userID);

            if (!user) {
                return NextResponse.json(
                    { message: 'User not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ user }, { status: 200 });
        } catch (error) {
            console.error('Error in getProfile controller:', error);
            return NextResponse.json(
                { message: 'Failed to get profile' },
                { status: 500 }
            );
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(request, userID) {
        try {
            const updates = await request.json();
            const user = await authService.updateProfile(userID, updates);

            return NextResponse.json({
                message: 'Profile updated successfully',
                user
            }, { status: 200 });
        } catch (error) {
            console.error('Error in updateProfile controller:', error);
            return NextResponse.json(
                { message: 'Failed to update profile', error: error.message },
                { status: 500 }
            );
        }
    }

    /**
     * Change password
     */
    async changePassword(request, userID) {
        try {
            const { currentPassword, newPassword } = await request.json();

            if (!currentPassword || !newPassword) {
                return NextResponse.json(
                    { message: 'Current password and new password are required' },
                    { status: 400 }
                );
            }

            if (newPassword.length < 6) {
                return NextResponse.json(
                    { message: 'Password must be at least 6 characters' },
                    { status: 400 }
                );
            }

            await authService.changePassword(userID, currentPassword, newPassword);

            return NextResponse.json({
                message: 'Password changed successfully'
            }, { status: 200 });
        } catch (error) {
            console.error('Error in changePassword controller:', error);
            
            if (error.message.includes('incorrect')) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { message: 'Failed to change password' },
                { status: 500 }
            );
        }
    }
}

export default new AuthController();
