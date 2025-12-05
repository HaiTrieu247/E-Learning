export interface CourseModule {
  moduleID: number;
  courseID: number;
  moduleTitle: string;
  moduleOrder: number;
  lessonCount: number;
  quizCount: number;
}

export interface ModuleLesson {
  lessonID: number;
  moduleID: number;
  lessonTitle: string;
  lessonOrder: number;
  lessonDuration: number;
  lessonMaterialURL: string;
}

export interface ModuleQuiz {
  quizID: number;
  quizTitle: string;
  totalMarks: number;
  passingMarks: number;
  quizDuration: number;
  questionCount: number;
}

export interface ModuleExercise {
  exerciseID: number;
  exerciseTitle: string;
  exerciseDescription: string;
}

export interface LessonAssignment {
  assignmentID: number;
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
