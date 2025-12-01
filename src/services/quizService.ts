// src/services/quizService.ts
import type { Question, CreateQuestionData, UpdateQuestionData, Quiz } from '@/src/types/quiz';

const API_BASE_URL = '/api/quizzes';

export const getQuizzesByCourse = async (courseID: number): Promise<Quiz[]> => {
  const response = await fetch(`/api/courses/${courseID}/quizzes`);
  if (!response.ok) {
    throw new Error('Failed to fetch quizzes for course');
  }
  return response.json();
};

export const getQuestions = async (quizID?: number): Promise<Question[]> => {
  const url = quizID ? `${API_BASE_URL}?quizID=${quizID}` : API_BASE_URL;
  const response = await fetch(url);
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
