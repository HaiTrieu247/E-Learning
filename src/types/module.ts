export interface CourseModule {
  ModuleID: number; // from Module table
  CourseID: number;
  moduleTitle: string; // from Title column
  moduleOrder: number; // from Order_Num column
  lessonCount: number;
  quizCount: number;
}

export interface ModuleLesson {
  LessonID: number; // from Lesson table
  ModuleID: number;
  lessonTitle: string; // from Title column
  lessonOrder: number; // from Order_Num column
  lessonDuration: number; // from Duration column
}

export interface ModuleQuiz {
  quizID: number; // from Quiz table
  quizTitle: string; // from Assignment.title
  totalMarks: number; // from totalScore
  passingMarks: number; // from Passing_Score
  quizDuration: number; // from Duration
  questionCount: number;
  assignmentID?: number; // from AssignmentID
  startDate?: string;
  dueDate?: string;
}

export interface ModuleExercise {
  ExerciseID: number; // from Exercise table
  exerciseTitle: string; // from Title
  exerciseDescription: string; // from Description
}

export interface LessonAssignment {
  AssignmentID: number; // from Assignment table
  assignmentTitle: string; // from title column
  startDate: string;
  dueDate: string;
  quiz: ModuleQuiz | null;
  exercise: ModuleExercise | null;
}

export interface LessonWithAssignments extends ModuleLesson {
  assignments: LessonAssignment[];
}

export interface ModuleDetails {
  lessons: ModuleLesson[];
  quizzes: ModuleQuiz[];
}
