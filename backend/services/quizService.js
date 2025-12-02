import createConnection from '../config/db.js';

/**
 * Get all quiz questions with their options from a specific quiz
 * Uses sp_GetQuizDetails stored procedure from ELearning.sql (section 2.3)
 */
export const getQuizQuestions = async (quizID = 1) => {
    const connection = await createConnection();
    try {
        // Call stored procedure sp_GetQuizDetails
        const [results] = await connection.query('CALL sp_GetQuizDetails(?)', [quizID]);
        
        // Transform the flat result into nested structure matching frontend Question type
        const questionsMap = new Map();
        
        // If no results, return empty array
        if (!results[0] || results[0].length === 0) {
            return [];
        }
        
        results[0].forEach(row => {
            if (!questionsMap.has(row.questionID)) {
                questionsMap.set(row.questionID, {
                    id: row.questionID,
                    content: row.questionDescription,
                    points: row.questionScore,
                    options: [],
                    correctOptionId: null,
                    createdAt: new Date().toISOString()
                });
            }
            
            const question = questionsMap.get(row.questionID);
            
            // Determine option ID (A, B, C, D)
            const optionIndex = question.options.length;
            const optionId = String.fromCharCode(65 + optionIndex); // A=65, B=66, C=67, D=68
            
            question.options.push({
                id: optionId,
                text: row.optionText
            });
            
            // Set correct option if this is the correct answer
            if (row.IsCorrectAnswer === 'True') {
                question.correctOptionId = optionId;
            }
        });
        
        return Array.from(questionsMap.values());
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        throw error;
    }
};

/**
 * Get a single question by ID with its options
 */
export const getQuestionById = async (questionID) => {
    const connection = await createConnection();
    try {
        // Get question details
        const [questionRows] = await connection.query(
            'SELECT questionID, questionDescription, questionScore FROM quizQuestions WHERE questionID = ?',
            [questionID]
        );
        
        if (questionRows.length === 0) {
            return null;
        }
        
        const question = questionRows[0];
        
        // Get options
        const [optionRows] = await connection.query(
            'SELECT optionID, optionText, isCorrect FROM questionOptions WHERE questionID = ? ORDER BY optionID',
            [questionID]
        );
        
        // Transform to frontend format
        const options = optionRows.map((opt, index) => ({
            id: String.fromCharCode(65 + index), // A, B, C, D
            text: opt.optionText
        }));
        
        const correctOptionIndex = optionRows.findIndex(opt => opt.isCorrect === 1);
        const correctOptionId = correctOptionIndex >= 0 ? String.fromCharCode(65 + correctOptionIndex) : null;
        
        return {
            id: question.questionID,
            content: question.questionDescription,
            points: question.questionScore,
            options,
            correctOptionId,
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching question by ID:', error);
        throw error;
    }
};

/**
 * Add a new question with options to a quiz
 * Uses sp_AddQuestion stored procedure from ELearning.sql (section 2.1)
 * 
 * The stored procedure includes these validations:
 * - quizID must exist
 * - description cannot be empty
 * - score must be > 0
 * - Trigger tg_check_quiz_total_score ensures total score doesn't exceed quiz totalMarks
 */
export const addQuestion = async (quizID, questionData) => {
    const connection = await createConnection();
    try {
        // Start transaction
        await connection.beginTransaction();
        
        // Call stored procedure sp_AddQuestion
        await connection.query(
            'CALL sp_AddQuestion(?, ?, ?)',
            [quizID, questionData.content, questionData.points]
        );
        
        // Get the new question ID
        const [newQuestion] = await connection.query(
            'SELECT LAST_INSERT_ID() as questionID'
        );
        const questionID = newQuestion[0].questionID;
        
        // Add options (must be exactly 4 options)
        for (let i = 0; i < questionData.options.length; i++) {
            const option = questionData.options[i];
            const isCorrect = option.id === questionData.correctOptionId;
            
            await connection.query(
                'INSERT INTO questionOptions (questionID, optionText, isCorrect) VALUES (?, ?, ?)',
                [questionID, option.text, isCorrect]
            );
        }
        
        // Commit transaction
        await connection.commit();
        
        // Return the newly created question
        return await getQuestionById(questionID);
    } catch (error) {
        // Rollback on error
        await connection.rollback();
        console.error('Error adding question:', error);
        throw error;
    }
};

/**
 * Update an existing question
 * Uses sp_UpdateQuestion stored procedure from ELearning.sql (section 2.1)
 * 
 * The stored procedure includes these validations:
 * - questionID must exist
 * - description cannot be empty
 * - score must be > 0
 * - Trigger tg_check_quiz_total_score_update ensures total score doesn't exceed quiz totalMarks
 */
export const updateQuestion = async (questionID, questionData) => {
    const connection = await createConnection();
    try {
        // Start transaction
        await connection.beginTransaction();
        
        // Call stored procedure sp_UpdateQuestion
        await connection.query(
            'CALL sp_UpdateQuestion(?, ?, ?)',
            [questionID, questionData.content, questionData.points]
        );
        
        // Delete old options
        await connection.query(
            'DELETE FROM questionOptions WHERE questionID = ?',
            [questionID]
        );
        
        // Add new options
        for (let i = 0; i < questionData.options.length; i++) {
            const option = questionData.options[i];
            const isCorrect = option.id === questionData.correctOptionId;
            
            await connection.query(
                'INSERT INTO questionOptions (questionID, optionText, isCorrect) VALUES (?, ?, ?)',
                [questionID, option.text, isCorrect]
            );
        }
        
        // Commit transaction
        await connection.commit();
        
        // Return the updated question
        return await getQuestionById(questionID);
    } catch (error) {
        // Rollback on error
        await connection.rollback();
        console.error('Error updating question:', error);
        throw error;
    }
};

/**
 * Delete a question
 * Uses sp_DeleteQuestion stored procedure from ELearning.sql (section 2.1)
 * 
 * Note: The stored procedure requires that all options be deleted first
 * to ensure data integrity. We handle this automatically.
 */
export const deleteQuestion = async (questionID) => {
    const connection = await createConnection();
    try {
        // Start transaction
        await connection.beginTransaction();
        
        // First delete all options (as required by the stored procedure)
        await connection.query(
            'DELETE FROM questionOptions WHERE questionID = ?',
            [questionID]
        );
        
        // Then call stored procedure sp_DeleteQuestion
        await connection.query(
            'CALL sp_DeleteQuestion(?)',
            [questionID]
        );
        
        // Commit transaction
        await connection.commit();
        
        return true;
    } catch (error) {
        // Rollback on error
        await connection.rollback();
        console.error('Error deleting question:', error);
        throw error;
    }
};

/**
 * Get quiz statistics
 * Uses sp_GetQuizStatistics stored procedure from ELearning.sql (section 2.3)
 */
export const getQuizStatistics = async (assignmentID, minQuestions = 0) => {
    const connection = await createConnection();
    try {
        const [results] = await connection.query(
            'CALL sp_GetQuizStatistics(?, ?)',
            [assignmentID, minQuestions]
        );
        
        return results[0];
    } catch (error) {
        console.error('Error fetching quiz statistics:', error);
        throw error;
    }
};

/**
 * Get all quizzes for a specific course
 * Uses sp_GetQuizzesByCourse stored procedure
 * Returns quiz metadata with question count and total score
 */
export const getQuizzesByCourse = async (courseID) => {
    const connection = await createConnection();
    try {
        const [results] = await connection.query(
            'CALL sp_GetQuizzesByCourse(?)',
            [courseID]
        );
        
        // Transform database result to match Quiz type
        const quizzes = results[0].map(row => ({
            quizID: row.quizID,
            quizTitle: row.quizTitle,
            totalMarks: row.totalMarks,
            passingMarks: row.passingMarks,
            quizDuration: row.quizDuration,
            assignmentID: row.assignmentID,
            lessonID: row.lessonID,
            lessonTitle: row.lessonTitle,
            moduleID: row.moduleID,
            moduleTitle: row.moduleTitle,
            courseID: row.courseID,
            questionCount: row.questionCount,
            currentTotalScore: row.currentTotalScore
        }));
        
        return quizzes;
    } catch (error) {
        console.error('Error fetching quizzes by course:', error);
        throw error;
    }
};