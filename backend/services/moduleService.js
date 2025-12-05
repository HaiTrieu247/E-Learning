import { createConnection } from '../config/db.js';

export class ModuleService {
    async getModulesByCourse(courseId) {
        try {
            const connection = await createConnection();
            const [rows] = await connection.execute(`
                SELECT 
                    cm.moduleID,
                    cm.courseID,
                    cm.moduleTitle,
                    cm.moduleOrder,
                    COUNT(DISTINCT ml.lessonID) as lessonCount,
                    COUNT(DISTINCT q.quizID) as quizCount
                FROM courseModules cm
                LEFT JOIN moduleLessons ml ON cm.moduleID = ml.moduleID
                LEFT JOIN lessonAssignments la ON ml.lessonID = la.lessonID
                LEFT JOIN Quizzes q ON la.assignmentID = q.assignmentID
                WHERE cm.courseID = ?
                GROUP BY cm.moduleID, cm.courseID, cm.moduleTitle, cm.moduleOrder
                ORDER BY cm.moduleOrder ASC
            `, [courseId]);
            return rows;
        } catch (error) {
            console.error("Error fetching modules:", error);
            throw error;
        }
    }

    async getModuleDetails(moduleId) {
        try {
            const connection = await createConnection();
            
            // Get all lessons with their assignments (quiz + exercise)
            const [lessons] = await connection.execute(`
                SELECT 
                    ml.*,
                    la.assignmentID,
                    la.startDate,
                    la.dueDate,
                    q.quizID,
                    q.quizTitle,
                    q.totalMarks,
                    q.passingMarks,
                    q.quizDuration,
                    COUNT(DISTINCT qq.questionID) as questionCount,
                    e.exerciseID,
                    e.exerciseTitle,
                    e.exerciseDescription
                FROM moduleLessons ml
                LEFT JOIN lessonAssignments la ON ml.lessonID = la.lessonID
                LEFT JOIN Quizzes q ON la.assignmentID = q.assignmentID
                LEFT JOIN quizQuestions qq ON q.quizID = qq.quizID
                LEFT JOIN exercises e ON la.assignmentID = e.assignmentID
                WHERE ml.moduleID = ?
                GROUP BY ml.lessonID, ml.moduleID, ml.lessonTitle, ml.lessonOrder, ml.lessonDuration, 
                         ml.lessonMaterialURL, la.assignmentID, la.startDate, la.dueDate,
                         q.quizID, q.quizTitle, q.totalMarks, q.passingMarks, q.quizDuration,
                         e.exerciseID, e.exerciseTitle, e.exerciseDescription
                ORDER BY ml.lessonOrder ASC, la.assignmentID ASC
            `, [moduleId]);

            // Transform data: group assignments under each lesson
            const lessonsMap = new Map();
            
            lessons.forEach(row => {
                // Create lesson entry if not exists
                if (!lessonsMap.has(row.lessonID)) {
                    lessonsMap.set(row.lessonID, {
                        lessonID: row.lessonID,
                        moduleID: row.moduleID,
                        lessonTitle: row.lessonTitle,
                        lessonOrder: row.lessonOrder,
                        lessonDuration: row.lessonDuration,
                        lessonMaterialURL: row.lessonMaterialURL,
                        assignments: [] // Array of assignments
                    });
                }
                
                const lesson = lessonsMap.get(row.lessonID);
                
                // Add assignment if exists and not already added
                if (row.assignmentID && !lesson.assignments.find(a => a.assignmentID === row.assignmentID)) {
                    const assignment = {
                        assignmentID: row.assignmentID,
                        startDate: row.startDate,
                        dueDate: row.dueDate,
                        quiz: null,
                        exercise: null
                    };
                    
                    // Add quiz if exists
                    if (row.quizID) {
                        assignment.quiz = {
                            quizID: row.quizID,
                            quizTitle: row.quizTitle,
                            totalMarks: row.totalMarks,
                            passingMarks: row.passingMarks,
                            quizDuration: row.quizDuration,
                            questionCount: row.questionCount
                        };
                    }
                    
                    // Add exercise if exists
                    if (row.exerciseID) {
                        assignment.exercise = {
                            exerciseID: row.exerciseID,
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
        }
    }
}

export default new ModuleService();
