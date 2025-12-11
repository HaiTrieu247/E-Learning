export interface CourseLearner {
  FullName: string; // from USER.FullName
  Email: string; // from USER.Email
  enrollmentDate: string; // from ENROLL.Date_signed
  progressPercentage: number; // from ENROLL.Progress
  Status?: string; // from ENROLL.Status
}

export interface StudentQuizPerformance {
  StudentAccount: string;
  FullName: string;
  quizTitle: string;
  MaxPossibleScore: number;
  HighestScoreObtained: number;
  AttemptsCount: number;
}
