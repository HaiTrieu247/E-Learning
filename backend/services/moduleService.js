import { createConnection } from '../config/db.js';

export class ModuleService {
    async getModulesByCourse(courseId) {
        let connection;
        try {
            connection = await createConnection();
            const [rows] = await connection.execute(`
                SELECT 
                    m.ModuleID,
                    m.CourseID,
                    m.Title as moduleTitle,
                    m.Order_Num as moduleOrder,
                    COUNT(DISTINCT l.LessonID) as lessonCount,
                    COUNT(DISTINCT q.quizID) as quizCount
                FROM Module m
                LEFT JOIN Lesson l ON m.ModuleID = l.ModuleID
                LEFT JOIN Assignment a ON l.LessonID = a.LessonID
                LEFT JOIN Quiz q ON a.AssignmentID = q.AssignmentID
                WHERE m.CourseID = ?
                GROUP BY m.ModuleID, m.CourseID, m.Title, m.Order_Num
                ORDER BY m.Order_Num ASC
            `, [courseId]);
            return rows;
        } catch (error) {
            console.error("Error fetching modules:", error);
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

    async getModuleDetails(moduleId) {
        let connection;
        try {
            connection = await createConnection();
            
            // Get all lessons with their assignments (quiz + exercise) from create_table.sql schema
            const [lessons] = await connection.execute(`
                SELECT 
                    l.LessonID,
                    l.Title as lessonTitle,
                    l.Order_Num as lessonOrder,
                    l.Duration as lessonDuration,
                    l.ModuleID,
                    m.materialURL as lessonMaterialURL,
                    a.AssignmentID,
                    a.startDate,
                    a.dueDate,
                    a.title as assignmentTitle,
                    q.quizID,
                    q.Passing_Score as passingMarks,
                    q.Duration as quizDuration,
                    q.totalScore as totalMarks,
                    COUNT(DISTINCT qst.questionID) as questionCount,
                    e.ExerciseID,
                    e.Title as exerciseTitle,
                    e.Description as exerciseDescription
                FROM Lesson l
                LEFT JOIN Material m ON l.LessonID = m.LessonID
                LEFT JOIN Assignment a ON l.LessonID = a.LessonID
                LEFT JOIN Quiz q ON a.AssignmentID = q.AssignmentID
                LEFT JOIN Question qst ON q.quizID = qst.quizID
                LEFT JOIN Exercise e ON a.AssignmentID = e.AssignmentID
                WHERE l.ModuleID = ?
                GROUP BY l.LessonID, l.Title, l.Order_Num, l.Duration, l.ModuleID, m.materialURL,
                         a.AssignmentID, a.startDate, a.dueDate, a.title,
                         q.quizID, q.Passing_Score, q.Duration, q.totalScore,
                         e.ExerciseID, e.Title, e.Description
                ORDER BY l.Order_Num ASC, a.AssignmentID ASC
            `, [moduleId]);

            // Transform data: group assignments under each lesson
            const lessonsMap = new Map();
            
            lessons.forEach(row => {
                // Create lesson entry if not exists
                if (!lessonsMap.has(row.LessonID)) {
                    lessonsMap.set(row.LessonID, {
                        lessonID: row.LessonID,
                        moduleID: row.ModuleID,
                        lessonTitle: row.lessonTitle,
                        lessonOrder: row.lessonOrder,
                        lessonDuration: row.lessonDuration,
                        lessonMaterialURL: row.lessonMaterialURL || '#',
                        assignments: [] // Array of assignments
                    });
                }
                
                const lesson = lessonsMap.get(row.LessonID);
                
                // Add assignment if exists and not already added
                if (row.AssignmentID && !lesson.assignments.find(a => a.assignmentID === row.AssignmentID)) {
                    const assignment = {
                        assignmentID: row.AssignmentID,
                        assignmentTitle: row.assignmentTitle,
                        startDate: row.startDate,
                        dueDate: row.dueDate,
                        quiz: null,
                        exercise: null
                    };
                    
                    // Add quiz if exists
                    if (row.quizID) {
                        assignment.quiz = {
                            quizID: row.quizID,
                            quizTitle: row.assignmentTitle,
                            totalMarks: row.totalMarks,
                            passingMarks: row.passingMarks,
                            quizDuration: row.quizDuration,
                            questionCount: row.questionCount
                        };
                    }
                    
                    // Add exercise if exists
                    if (row.ExerciseID) {
                        assignment.exercise = {
                            exerciseID: row.ExerciseID,
                            exerciseTitle: row.exerciseTitle,
                            exerciseDescription: row.exerciseDescription
                        };
                    }
                    
                    lesson.assignments.push(assignment);
                }
            });

            return Array.from(lessonsMap.values());
        } catch (error) {
            console.error("Error fetching module details:", error);
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

export default new ModuleService();
