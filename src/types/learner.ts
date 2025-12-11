export interface CourseLearner {
  FullName: string; // from USER.FullName via sp_GetActiveLearnersInCourse
  Email: string; // from USER.Email via sp_GetActiveLearnersInCourse
  enrollmentDate: string; // from ENROLL.Date_signed via sp_GetActiveLearnersInCourse
  progressPercentage: number; // from ENROLL.Progress via sp_GetActiveLearnersInCourse
  Status?: string; // from ENROLL.Status via sp_GetActiveLearnersInCourse
}

export interface StudentQuizPerformance {
  StudentAccount: string;
  FullName: string;
  quizTitle: string;
  MaxPossibleScore: number;
  HighestScoreObtained: number;
  AttemptsCount: number;
}
