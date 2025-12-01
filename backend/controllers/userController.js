import userService from '../services/userService.js';
import { NextResponse } from "next/server";

export class UserController {
    async getUsers() {
        try {
            const users = await userService.getAllUsers();
            return NextResponse.json(users, { status: 200 });
        } catch (error) {
            console.error("Error in getUsers controller:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    }

    async getUserById(userId) {
        try {
            const user = await userService.getUserById(userId);
            if (!user) {
                return NextResponse.json(
                    { error: "User not found" }, 
                    { status: 404 }
                );
            }
            return NextResponse.json(user, { status: 200 });
        } catch (error) {
            console.error("Error in getUserById controller:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    }

    async getUsersByRole(role) {
        try {
            const users = await userService.getUsersByRole(role);
            return NextResponse.json(users, { status: 200 });
        } catch (error) {
            console.error("Error in getUsersByRole controller:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    }
}

export default new UserController();
