// src/services/quizService.ts
import type { Question } from '@/types/quiz';

const API_BASE_URL = '/api/quizzes';

// Type for the data sent to create a question (omitting id, createdAt)
export type CreateQuestionData = Omit<Question, 'id' | 'createdAt'>;
export type UpdateQuestionData = Partial<CreateQuestionData>;


export const getQuestions = async (): Promise<Question[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return response.json();
};

export const createQuestion = async (questionData: CreateQuestionData): Promise<Question> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    throw new Error('Failed to create question');
  }
  return response.json();
};

export const updateQuestion = async (id: number, questionData: UpdateQuestionData): Promise<Question> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    throw new Error('Failed to update question');
  }
  return response.json();
};

export const deleteQuestion = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete question');
  }
};
