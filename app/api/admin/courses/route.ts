import { createConnection } from '@/backend/config/db.js';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

interface CourseRow extends RowDataPacket {
    courseID: number;
    courseTitle: string;
    courseDescription: string;
    categoryID?: number;
    categoryName?: string;
    approvalStatus: string;
    courseStatus: string;
    createdDate: string;
    lastModified?: string;
    enrolledCount?: number;
    instructorCount?: number;
}

// GET all courses with filters
export async function GET(request: Request) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const approvalStatus = searchParams.get('approvalStatus');
        const courseStatus = searchParams.get('courseStatus');
        const categoryID = searchParams.get('categoryID');

        connection = await createConnection();
        
        let query = `
            SELECT 
                c.courseID,
                c.courseTitle,
                c.courseDescription,
                c.categoryID,
                cc.categoryName,
                c.approvalStatus,
                c.courseStatus,
                c.createdDate,
                c.lastModified,
                COUNT(DISTINCT ce.learnerID) AS enrolledCount,
                COUNT(DISTINCT cd.instructorID) AS instructorCount
            FROM courses c
            LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
            LEFT JOIN courseEnrollments ce ON c.courseID = ce.courseID
            LEFT JOIN courseDesignments cd ON c.courseID = cd.courseID
            WHERE 1=1
        `;
        const params: any[] = [];

        if (approvalStatus) {
            query += ' AND c.approvalStatus = ?';
            params.push(approvalStatus);
        }

        if (courseStatus) {
            query += ' AND c.courseStatus = ?';
            params.push(courseStatus);
        }

        if (categoryID) {
            query += ' AND c.categoryID = ?';
            params.push(parseInt(categoryID));
        }

        query += ' GROUP BY c.courseID ORDER BY c.createdDate DESC';

        const [rows] = await connection.execute<CourseRow[]>(query, params);

        return NextResponse.json({ courses: rows }, { status: 200 });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { message: 'Failed to fetch courses', error: error instanceof Error ? error.message : 'Unknown error' },
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

// POST - Create new course
export async function POST(request: Request) {
    let connection;
    try {
        const body = await request.json();
        const { courseTitle, courseDescription, categoryID, instructorID } = body;

        if (!courseTitle || !courseDescription) {
            return NextResponse.json(
                { message: 'courseTitle and courseDescription are required' },
                { status: 400 }
            );
        }

        connection = await createConnection();
        await connection.beginTransaction();

        // Insert course with default status
        const [result] = await connection.execute(
            `INSERT INTO courses (courseTitle, courseDescription, categoryID, approvalStatus, courseStatus, createdDate)
             VALUES (?, ?, ?, 'pending', 'draft', CURRENT_TIMESTAMP)`,
            [courseTitle, courseDescription, categoryID || null]
        );

        const courseID = (result as any).insertId;

        // Assign instructor if provided
        if (instructorID) {
            await connection.execute(
                `INSERT INTO courseDesignments (instructorID, courseID, assignedDate)
                 VALUES (?, ?, CURRENT_TIMESTAMP)`,
                [instructorID, courseID]
            );
        }

        await connection.commit();

        // Get created course
        const [courses] = await connection.execute<CourseRow[]>(
            `SELECT c.*, cc.categoryName
             FROM courses c
             LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
             WHERE c.courseID = ?`,
            [courseID]
        );

        return NextResponse.json({
            message: 'Course created successfully',
            course: courses[0]
        }, { status: 201 });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating course:', error);
        return NextResponse.json(
            { message: 'Failed to create course', error: error instanceof Error ? error.message : 'Unknown error' },
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

// PATCH - Update course approval/status (Admin only)
export async function PATCH(request: Request) {
    let connection;
    try {
        const body = await request.json();
        const { courseID, approvalStatus, courseStatus, adminID, actionNotes } = body;

        if (!courseID) {
            return NextResponse.json(
                { message: 'courseID is required' },
                { status: 400 }
            );
        }

        connection = await createConnection();
        await connection.beginTransaction();

        const updates = [];
        const params: any[] = [];

        if (approvalStatus) {
            updates.push('approvalStatus = ?');
            params.push(approvalStatus);
        }

        if (courseStatus) {
            updates.push('courseStatus = ?');
            params.push(courseStatus);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { message: 'No valid fields to update' },
                { status: 400 }
            );
        }

        updates.push('lastModified = CURRENT_TIMESTAMP');
        params.push(courseID);

        await connection.execute(
            `UPDATE courses SET ${updates.join(', ')} WHERE courseID = ?`,
            params
        );

        // Log admin action
        if (adminID) {
            const actionType = approvalStatus || courseStatus;
            await connection.execute(
                `INSERT INTO adminManagement (adminID, targetType, targetID, actionType, actionNotes)
                 VALUES (?, 'course', ?, ?, ?)`,
                [adminID, courseID, actionType, actionNotes || '']
            );
        }

        await connection.commit();

        // Get updated course
        const [courses] = await connection.execute<CourseRow[]>(
            `SELECT c.*, cc.categoryName
             FROM courses c
             LEFT JOIN course_categories cc ON c.categoryID = cc.categoryID
             WHERE c.courseID = ?`,
            [courseID]
        );

        return NextResponse.json({
            message: 'Course updated successfully',
            course: courses[0]
        }, { status: 200 });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating course:', error);
        return NextResponse.json(
            { message: 'Failed to update course', error: error instanceof Error ? error.message : 'Unknown error' },
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
