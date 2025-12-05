import { NextResponse } from 'next/server';
import { createConnection } from '@/backend/config/db.js';

export async function GET() {
    let connection;
    try {
        connection = await createConnection();
        const [rows] = await connection.execute(`
            SELECT 
                categoryID, 
                categoryName, 
                ParentCategoryID
            FROM course_categories
            ORDER BY categoryName ASC
        `);
        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
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
