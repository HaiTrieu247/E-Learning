import courseService from '../services/courseService.js';
import { NextResponse } from "next/server";

export class CourseController {
    async getCourses() {
        try {
            const courses = await courseService.getAllCourses();
            return NextResponse.json(courses, { status: 200 });
        } catch (error) {
            console.error("Error in getCourses controller:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    }

    async getCourseById(courseId) {
        try {
            const course = await courseService.getCourseById(courseId);
            if (!course) {
                return NextResponse.json(
                    { error: "Course not found" }, 
                    { status: 404 }
                );
            }
            return NextResponse.json(course, { status: 200 });
        } catch (error) {
            console.error("Error in getCourseById controller:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    }

    async getCoursesByCategory(categoryId) {
        try {
            const courses = await courseService.getCoursesByCategory(categoryId);
            return NextResponse.json(courses, { status: 200 });
        } catch (error) {
            console.error("Error in getCoursesByCategory controller:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    }
}

export default new CourseController();
