import { NextResponse } from 'next/server';
import { createConnection } from '@/backend/config/db.js';

export async function GET() {
    let connection;
    try {
        connection = await createConnection();
        const [rows] = await connection.execute(`
            SELECT 
                CategoryID, 
                Name as categoryName, 
                Parent_ID as ParentCategoryID
            FROM Course_category
            ORDER BY Name ASC
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
