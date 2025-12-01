// src/types/quiz.ts
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  content: string;
  options: Option[];
  correctOptionId: string;
  points: number;
  createdAt: string;
}
