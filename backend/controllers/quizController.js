import quizService from '../services/quizService.js';

const quizController = {
  async createQuiz(lessonID, quizTitle, totalMarks, passingMarks, quizDuration, startDate, dueDate) {
    try {
      // First, create assignment with specified dates
      const assignmentID = await quizService.createAssignment(lessonID, startDate, dueDate);
      
      // Then create the quiz
      const quizID = await quizService.createQuiz(
        assignmentID,
        quizTitle,
        totalMarks,
        passingMarks,
        quizDuration
      );

      return {
        success: true,
        quizID,
        assignmentID,
        message: 'Quiz created successfully'
      };
    } catch (error) {
      console.error('Error in quizController.createQuiz:', error);
      throw error;
    }
  }
};

export default quizController;
