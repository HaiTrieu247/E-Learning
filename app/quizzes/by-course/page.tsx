"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, BookOpen, Clock, Target, FileText, ArrowLeft } from "lucide-react";
import type { Quiz } from "@/src/types/quiz";
import { getQuizzesByCourse } from "@/src/services/quizService";

function QuizzesByCourseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseID = searchParams.get('courseID');
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string>('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseID) {
        setError("No course selected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getQuizzesByCourse(parseInt(courseID));
        setQuizzes(data);
        
        // Get course name from the first quiz if available
        if (data.length > 0 && data[0].courseID) {
          // Fetch course details to get the name
          const courseResponse = await fetch(`/api/courses`);
          if (courseResponse.ok) {
            const courses = await courseResponse.json();
            const course = courses.find((c: any) => c.courseID === parseInt(courseID));
            if (course) {
              setCourseName(course.courseTitle);
            }
          }
        }
      } catch (e: any) {
        setError(e.message || "Failed to load quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseID]);

  const handleQuizClick = (quizID: number) => {
    router.push(`/quizzes/${quizID}`);
  };

  const handleBackToCourses = () => {
    router.push('/courses');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="mt-4 font-medium">Loading Quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-rose-600 bg-rose-50 rounded-2xl">
        <AlertCircle className="mx-auto w-12 h-12 mb-3" />
        <p className="font-bold text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBackToCourses}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Courses</span>
        </button>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {courseName || `Course ${courseID}`} - Quizzes
        </h1>
        <p className="text-slate-600">
          Select a quiz to view and manage questions
        </p>
      </div>

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <div className="text-center py-24 text-slate-500 bg-white rounded-2xl shadow-sm">
          <BookOpen className="mx-auto w-16 h-16 mb-4 text-slate-300" />
          <h3 className="font-bold text-xl text-slate-700">No Quizzes Found</h3>
          <p className="text-sm mt-2">This course doesn't have any quizzes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.quizID}
              onClick={() => handleQuizClick(quiz.quizID)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              {/* Quiz Title */}
              <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
                {quiz.quizTitle}
              </h3>

              {/* Module and Lesson Info */}
              {quiz.moduleTitle && (
                <div className="text-sm text-slate-600 mb-4">
                  <p className="font-medium">📚 {quiz.moduleTitle}</p>
                  {quiz.lessonTitle && (
                    <p className="text-slate-500">📖 {quiz.lessonTitle}</p>
                  )}
                </div>
              )}

              {/* Quiz Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText size={16} className="text-indigo-500" />
                  <span>{quiz.questionCount || 0} Questions</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target size={16} className="text-emerald-500" />
                  <span>
                    {quiz.currentTotalScore || 0} / {quiz.totalMarks} Points
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} className="text-amber-500" />
                  <span>{quiz.quizDuration} minutes</span>
                </div>
              </div>

              {/* Passing Score Badge */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Passing Score:</span>
                  <span className="font-semibold text-slate-700">
                    {quiz.passingMarks} points
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((quiz.currentTotalScore || 0) / quiz.totalMarks) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {Math.round(
                    ((quiz.currentTotalScore || 0) / quiz.totalMarks) * 100
                  )}% configured
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuizzesByCourse() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="mt-4 font-medium">Loading...</p>
      </div>
    }>
      <QuizzesByCourseContent />
    </Suspense>
  );
}
