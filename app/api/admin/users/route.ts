import { createConnection } from '@/backend/config/db.js';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
    userID: number;
    FNAME: string;
    LNAME: string;
    phoneNumber: string;
    email: string;
    username: string;
    role: string;
    approvalStatus: string;
    accountStatus: string;
    createdDate: string;
    instructorID?: number;
    learnerID?: number;
    adminID?: number;
}

// GET all users with filters
export async function GET(request: Request) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const approvalStatus = searchParams.get('approvalStatus');
        const accountStatus = searchParams.get('accountStatus');

        connection = await createConnection();
        
        let query = `
            SELECT u.userID, u.FNAME, u.LNAME, u.phoneNumber, u.email, 
                   u.username, u.role, u.approvalStatus, u.accountStatus, 
                   u.createdDate,
                   i.instructorID, 
                   l.learnerID, 
                   a.adminID 
            FROM users u
            LEFT JOIN instructors i ON u.userID = i.userID
            LEFT JOIN learners l ON u.userID = l.userID
            LEFT JOIN administrators a ON u.userID = a.adminID
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        if (approvalStatus) {
            query += ' AND u.approvalStatus = ?';
            params.push(approvalStatus);
        }

        if (accountStatus) {
            query += ' AND u.accountStatus = ?';
            params.push(accountStatus);
        }

        query += ' ORDER BY u.createdDate DESC';

        const [rows] = await connection.execute(query, params);

        return NextResponse.json({ users: rows }, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { message: 'Failed to fetch users', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
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

// PATCH - Update user approval/account status (Admin only)
export async function PATCH(request: Request) {
    let connection;
    try {
        const body = await request.json();
        const { userID, approvalStatus, accountStatus, adminID, actionNotes } = body;

        if (!userID) {
            return NextResponse.json(
                { message: 'userID is required' },
                { status: 400 }
            );
        }

        connection = await createConnection();
        await connection.beginTransaction();

        const updates = [];
        const params = [];

        if (approvalStatus) {
            updates.push('approvalStatus = ?');
            params.push(approvalStatus);
        }

        if (accountStatus) {
            updates.push('accountStatus = ?');
            params.push(accountStatus);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { message: 'No valid fields to update' },
                { status: 400 }
            );
        }

        params.push(userID);

        await connection.execute(
            `UPDATE users SET ${updates.join(', ')} WHERE userID = ?`,
            params
        );

        // Log admin action
        if (adminID) {
            const actionType = approvalStatus || accountStatus;
            await connection.execute(
                `INSERT INTO adminManagement (adminID, targetType, targetID, actionType, actionNotes)
                 VALUES (?, 'user', ?, ?, ?)`,
                [adminID, userID, actionType, actionNotes || '']
            );
        }

        await connection.commit();

        // Get updated user
        const [users] = await connection.execute<UserRow[]>(
            `SELECT userID, FNAME, LNAME, email, username, role, phoneNumber, 
                    approvalStatus, accountStatus, createdDate 
             FROM users WHERE userID = ?`,
            [userID]
        );

        return NextResponse.json({
            message: 'User updated successfully',
            user: users[0]
        }, { status: 200 });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating user:', error);
        return NextResponse.json(
            { message: 'Failed to update user', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
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
