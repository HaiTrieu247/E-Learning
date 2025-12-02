const learnerService = {
  // Lấy danh sách học viên đã đăng ký khóa học
  async getActiveLearnersInCourse(courseID, enrollmentStatus = 'active') {
    try {
      console.log('[learnerService] Calling sp_GetActiveLearnersInCourse with:', { courseID, enrollmentStatus });
      
      // Import and get connection
      const createConnection = require('../config/db').default || require('../config/db');
      const connection = await createConnection();
      
      const [results] = await connection.query(
        'CALL sp_GetActiveLearnersInCourse(?, ?)',
        [courseID, enrollmentStatus]
      );
      
      console.log('[learnerService] Raw results:', results);
      console.log('[learnerService] First element:', results[0]);
      return results[0]; // Stored procedure returns results in first element
    } catch (error) {
      console.error('[learnerService] Error fetching active learners:', error.message);
      console.error('[learnerService] Error details:', error);
      throw error;
    }
  },

  // Lấy thành tích quiz của học sinh trong khóa học
  async getStudentQuizPerformance(courseID, minScore = 0) {
    try {
      console.log('[learnerService] Calling sp_GetStudentQuizPerformance with:', { courseID, minScore });
      
      // Import and get connection
      const createConnection = require('../config/db').default || require('../config/db');
      const connection = await createConnection();
      
      const [results] = await connection.query(
        'CALL sp_GetStudentQuizPerformance(?, ?)',
        [courseID, minScore]
      );
      
      console.log('[learnerService] Performance raw results:', results);
      console.log('[learnerService] Performance first element:', results[0]);
      return results[0]; // Stored procedure returns results in first element
    } catch (error) {
      console.error('[learnerService] Error fetching student quiz performance:', error.message);
      console.error('[learnerService] Error details:', error);
      throw error;
    }
  }
};

module.exports = learnerService;
