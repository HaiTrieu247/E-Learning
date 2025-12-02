export interface CourseLearner {
  FNAME: string;
  LNAME: string;
  email: string;
  enrollmentDate: string;
  progressPercentage: number;
  status?: string;
}

export interface StudentQuizPerformance {
  StudentAccount: string;
  FullName: string;
  quizTitle: string;
  MaxPossibleScore: number;
  HighestScoreObtained: number;
  AttemptsCount: number;
}
