// src/types/quiz.ts
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  quizID?: number;
  quizTitle?: string;
  content: string; // maps to qText in database
  options: Option[];
  correctOptionId: string;
  points: number; // maps to score in database
  createdAt: string;
}

// Quiz metadata (from Quiz table in create_table.sql)
export interface Quiz {
  quizID: number;
  quizTitle: string; // from Assignment.title
  totalMarks: number; // maps to totalScore in database
  passingMarks: number; // maps to Passing_Score in database
  quizDuration: number; // maps to Duration in database
  assignmentID: number; // maps to AssignmentID
  lessonID?: number; // maps to LessonID
  lessonTitle?: string;
  moduleID?: number; // maps to ModuleID
  moduleTitle?: string;
  courseID?: number; // maps to CourseID
  questionCount?: number;
  currentTotalScore?: number;
}

// Assignment from create_table.sql
export interface Assignment {
  AssignmentID: number;
  startDate: Date;
  dueDate: Date;
  title: string;
  CourseID: number;
  ModuleID: number;
  LessonID: number;
}

// Type for creating/updating questions (used in forms and API)
export interface CreateQuestionData {
  quizID: number;
  content: string; // will be stored as qText
  options: Option[];
  correctOptionId: string;
  points: number; // will be stored as score
}

export interface UpdateQuestionData {
  quizID?: number;
  content: string; // will be stored as qText
  options: Option[];
  correctOptionId: string;
  points: number; // will be stored as score
}

// Backend service types
export interface QuizStatistics {
  quizTitle: string;
  MaxAllowedScore: number;
  TotalQuestions: number;
  CurrentTotalScore: number;
}
