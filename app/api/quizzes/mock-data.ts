// app/api/quizzes/mock-data.ts
import type { Question } from '@/types/quiz';

// This is a common pattern to persist in-memory data across Next.js hot-reloads in development.
// We attach our "database" to the global object to ensure all requests use the same data instance.
const globalForDb = global as typeof globalThis & {
  questionsDB?: Question[];
};

if (!globalForDb.questionsDB) {
  globalForDb.questionsDB = [
    {
      id: 1,
      content: "Which SQL statement is used to extract data from a database?",
      options: [
        { id: "A", text: "GET" },
        { id: "B", text: "OPEN" },
        { id: "C", text: "SELECT" },
        { id: "D", text: "EXTRACT" },
      ],
      correctOptionId: "C",
      points: 1.0,
      createdAt: "2023-10-01T10:00:00Z",
    },
    {
      id: 2,
      content: "Which of the following is NOT a type of NoSQL database?",
      options: [
        { id: "A", text: "Key-Value" },
        { id: "B", text: "Relational" },
        { id: "C", text: "Document" },
        { id: "D", text: "Graph" },
      ],
      correctOptionId: "B",
      points: 1.5,
      createdAt: "2023-10-05T11:30:00Z",
    },
  ];
}

const questions = globalForDb.questionsDB;

// In-memory database functions
export const getAllQuestions = () => questions;

export const getQuestionById = (id: number) => questions.find(q => q.id === id);

export const addQuestion = (newQuestionData: Omit<Question, 'id' | 'createdAt'>) => {
  const newQuestion: Question = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...newQuestionData,
  };
  questions.unshift(newQuestion);
  return newQuestion;
};

export const updateQuestionById = (id: number, updatedData: Partial<Omit<Question, 'id' | 'createdAt'>>) => {
  const questionIndex = questions.findIndex(q => q.id === id);
  if (questionIndex === -1) {
    return null;
  }
  questions[questionIndex] = { 
    ...questions[questionIndex], 
    ...updatedData 
  };
  return questions[questionIndex];
};

export const deleteQuestionById = (id: number): boolean => {
  const questionIndex = questions.findIndex(q => q.id === id);
  if (questionIndex > -1) {
    questions.splice(questionIndex, 1); // Mutate the array in place
    return true;
  }
  return false;
};
