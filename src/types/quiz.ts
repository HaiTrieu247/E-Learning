// src/types/quiz.ts
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  quizID?: number;
  quizTitle?: string;
  content: string;
  options: Option[];
  correctOptionId: string;
  points: number;
  createdAt: string;
}

// Quiz metadata (from Quizzes table)
export interface Quiz {
  quizID: number;
  quizTitle: string;
  totalMarks: number;
  passingMarks: number;
  quizDuration: number;
  assignmentID: number;
  lessonID?: number;
  lessonTitle?: string;
  moduleID?: number;
  moduleTitle?: string;
  courseID?: number;
  questionCount?: number;
  currentTotalScore?: number;
}

// Type for creating/updating questions (used in forms and API)
export interface CreateQuestionData {
  quizID: number;
  content: string;
  options: Option[];
  correctOptionId: string;
  points: number;
}

export interface UpdateQuestionData {
  quizID?: number;
  content: string;
  options: Option[];
  correctOptionId: string;
  points: number;
}

// Backend service types
export interface QuizStatistics {
  quizTitle: string;
  MaxAllowedScore: number;
  TotalQuestions: number;
  CurrentTotalScore: number;
}
