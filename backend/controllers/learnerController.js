const learnerService = require('../services/learnerService');

const learnerController = {
  // Get active learners in course
  async getActiveLearnersInCourse(req, res) {
    try {
      const { courseID, enrollmentStatus } = req.query;
      
      if (!courseID) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      const learners = await learnerService.getActiveLearnersInCourse(
        parseInt(courseID),
        enrollmentStatus || 'active'
      );
      
      res.json(learners);
    } catch (error) {
      console.error('Error in getActiveLearnersInCourse:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get student quiz performance
  async getStudentQuizPerformance(req, res) {
    try {
      const { courseID, minScore } = req.query;
      
      if (!courseID) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      const performance = await learnerService.getStudentQuizPerformance(
        parseInt(courseID),
        parseFloat(minScore) || 0
      );
      
      res.json(performance);
    } catch (error) {
      console.error('Error in getStudentQuizPerformance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = learnerController;
