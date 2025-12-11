'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Users, BookOpen, Loader2, GraduationCap, Calendar, ChevronDown, ChevronRight, Clock, Trophy, Play, ExternalLink, FileText, Plus, Edit2 } from 'lucide-react';
import type { Course } from '@/src/types/course';
import type { CourseLearner } from '@/src/types/learner';
import type { CourseModule, LessonWithAssignments, ModuleQuiz } from '@/src/types/module';
import CreateQuizModal from '@/src/components/CreateQuizModal';
import EditQuizModal from '@/src/components/EditQuizModal';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CourseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Support both routing methods: /courses/1 OR /courses/1?courseID=1
  const courseID = searchParams.get('courseID') || params.id;

  const [activeTab, setActiveTab] = useState<'modules' | 'learners'>('modules');
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [learners, setLearners] = useState<CourseLearner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('active');
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [moduleDetails, setModuleDetails] = useState<{ [key: number]: LessonWithAssignments[] }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<{ id: number; title: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<ModuleQuiz | null>(null);
  const [canEditCourse, setCanEditCourse] = useState(false);

  // Fetch course details
  useEffect(() => {
    if (!courseID) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch('/api/courses');
        const courses = await res.json();
        const foundCourse = courses.find((c: Course) => c.CourseID === parseInt(courseID));
        setCourse(foundCourse || null);
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    fetchCourse();
  }, [courseID]);

  // Check if current user is assigned instructor for this course
  useEffect(() => {
    if (!courseID) return;

    const abortController = new AbortController();

    const checkInstructorAccess = async () => {
      try {
        // Get current user from localStorage (key is 'user' not 'currentUser')
        const userData = localStorage.getItem('user');
        
        if (!userData) {
          setCanEditCourse(false);
          return;
        }

        const user = JSON.parse(userData);
        
        // Check if user is instructor and assigned to this course
        const res = await fetch(`/api/courses/${courseID}/check-instructor?userID=${user.UserID}`, {
          signal: abortController.signal
        });
        
        if (!res.ok) {
          console.log('❌ API returned error:', res.status);
          setCanEditCourse(false);
          return;
        }
        
        const data = await res.json();
        console.log('✅ API Response:', data);
        console.log('✅ Setting canEditCourse to:', data.canEdit);
        setCanEditCourse(data.canEdit || false);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        console.error('Error checking instructor access:', error);
        setCanEditCourse(false);
      }
    };

    checkInstructorAccess();

    // Cleanup: cancel request if component unmounts or courseID changes
    return () => {
      abortController.abort();
    };
  }, [courseID]);

  // Fetch modules
  useEffect(() => {
    if (!courseID || activeTab !== 'modules') return;

    const fetchModules = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/courses/${courseID}/modules`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setModules(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [courseID, activeTab]);

  // Fetch module details when expanded
  const handleModuleExpand = async (moduleID: number) => {
    if (expandedModule === moduleID) {
      setExpandedModule(null);
      return;
    }

    setExpandedModule(moduleID);

    // If already fetched, don't fetch again
    if (moduleDetails[moduleID]) return;

    try {
      const res = await fetch(`/api/modules/${moduleID}/details`);
      if (!res.ok) throw new Error('Failed to fetch module details');
      
      const data = await res.json();
      setModuleDetails(prev => ({
        ...prev,
        [moduleID]: data
      }));
    } catch (error) {
      console.error('Error fetching module details:', error);
    }
  };

  // Handle open modal for creating quiz
  const handleCreateQuiz = (lessonID: number, lessonTitle: string) => {
    setSelectedLesson({ id: lessonID, title: lessonTitle });
    setIsModalOpen(true);
  };

  // Handle modal submit
  const handleModalSubmit = async (formData: {
    quizTitle: string;
    totalMarks: number;
    passingMarks: number;
    quizDuration: number;
    startDate: string;
    dueDate: string;
  }) => {
    if (!selectedLesson) return;

    try {
      const res = await fetch('/api/quizzes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonID: selectedLesson.id,
          ...formData
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create quiz');
      }

      const data = await res.json();
      
      // Close modal
      setIsModalOpen(false);
      setSelectedLesson(null);
      
      // Show success message
      alert(`✅ Quiz created successfully! You can now add questions to it.`);
      
      // Refresh module details to show new quiz
      if (expandedModule) {
        const resModule = await fetch(`/api/modules/${expandedModule}/details`);
        if (resModule.ok) {
          const moduleData = await resModule.json();
          setModuleDetails(prev => ({
            ...prev,
            [expandedModule]: moduleData
          }));
        }
      }
      
      // Navigate to quiz page to add questions
      if (data.quizID) {
        const shouldNavigate = confirm('Would you like to add questions to the quiz now?');
        if (shouldNavigate) {
          router.push(`/quizzes/${data.quizID}`);
        }
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      alert('❌ ' + (error.message || 'Failed to create quiz'));
    }
  };

  // Handle edit quiz
  const handleEditQuiz = (quiz: ModuleQuiz, assignmentID?: number, startDate?: string, dueDate?: string) => {
    setSelectedQuiz({
      ...quiz,
      assignmentID,
      startDate,
      dueDate
    });
    setIsEditModalOpen(true);
  };

  // Handle modal edit submit
  const handleEditModalSubmit = async (formData: {
    quizTitle: string;
    totalMarks: number;
    passingMarks: number;
    quizDuration: number;
    startDate: string;
    dueDate: string;
  }) => {
    if (!selectedQuiz) return;

    try {
      const res = await fetch(`/api/quizzes/${selectedQuiz.quizID}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assignmentID: selectedQuiz.assignmentID
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update quiz');
      }

      // Close modal
      setIsEditModalOpen(false);
      setSelectedQuiz(null);
      
      // Show success message
      alert('✅ Quiz updated successfully!');
      
      // Refresh module details
      if (expandedModule) {
        const resModule = await fetch(`/api/modules/${expandedModule}/details`);
        if (resModule.ok) {
          const moduleData = await resModule.json();
          setModuleDetails(prev => ({
            ...prev,
            [expandedModule]: moduleData
          }));
        }
      }
    } catch (error: any) {
      console.error('Error updating quiz:', error);
      alert('❌ ' + (error.message || 'Failed to update quiz'));
    }
  };

  // Fetch learners
  useEffect(() => {
    if (!courseID || activeTab !== 'learners') return;

    const fetchLearners = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/courses/${courseID}/learners?enrollmentStatus=${enrollmentStatus}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setLearners(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching learners:', error);
        setLearners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearners();
  }, [courseID, activeTab, enrollmentStatus]);

  if (!courseID) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">No Course Selected</h2>
          <button
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 animate-slide-down">
          <button
            onClick={() => router.push('/courses')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Courses</span>
          </button>

          {course && (
            <div className="glass rounded-2xl p-6 shadow-smooth-lg">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold gradient-text mb-2">{course.CTitle}</h1>
                  <p className="text-slate-600 mb-3">{course.Description}</p>
                  {course.CategoryName && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-indigo-600 shadow-smooth">
                      {course.CategoryName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-2 mb-6 shadow-smooth inline-flex gap-2 animate-slide-down" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'modules'
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-smooth-lg'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <BookOpen size={18} />
            Modules
          </button>
          <button
            onClick={() => setActiveTab('learners')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'learners'
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-smooth-lg'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Users size={18} />
            Learners
          </button>
        </div>

        {/* Content */}
        <div className="animate-scale-in">
          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="glass rounded-2xl p-6 shadow-smooth-lg">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : modules.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No modules found</h3>
                  <p className="text-slate-500">This course doesn't have any modules yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module) => {
                    const details = moduleDetails[module.ModuleID];
                    const isExpanded = expandedModule === module.ModuleID;

                    return (
                      <div key={module.ModuleID} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <button
                          onClick={() => handleModuleExpand(module.ModuleID)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                              {module.moduleOrder}
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-slate-800 text-lg">{module.moduleTitle}</h3>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-slate-500 flex items-center gap-1">
                                  <BookOpen size={14} />
                                  {module.lessonCount} lesson{module.lessonCount !== 1 ? 's' : ''}
                                </span>
                                <span className="text-sm text-slate-500 flex items-center gap-1">
                                  <Trophy size={14} />
                                  {module.quizCount} quiz{module.quizCount !== 1 ? 'zes' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="text-slate-400" size={20} />
                          ) : (
                            <ChevronRight className="text-slate-400" size={20} />
                          )}
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                            {!details ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                              </div>
                            ) : details.length === 0 ? (
                              <div className="text-center py-8">
                                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No lessons available in this module</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {details.map((lesson) => (
                                  <div key={lesson.lessonID} className="space-y-2">
                                    {/* Lesson Card */}
                                    <div className="p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                            {lesson.lessonOrder}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <Play size={14} className="text-indigo-600" />
                                              <p className="font-medium text-slate-800">{lesson.lessonTitle}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {lesson.lessonDuration} min
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {canEditCourse && (
                                            <button
                                              onClick={() => handleCreateQuiz(lesson.lessonID, lesson.lessonTitle)}
                                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                              title="Create Quiz for this lesson"
                                            >
                                              <Plus size={18} />
                                            </button>
                                          )}
                                          {lesson.lessonMaterialURL && lesson.lessonMaterialURL !== '#' && (
                                            <a
                                              href={lesson.lessonMaterialURL}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <ExternalLink size={18} />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Associated Assignments (Quiz or Exercise) */}
                                    {lesson.assignments && lesson.assignments.length > 0 && (
                                      <div className="ml-11 space-y-2">
                                        {lesson.assignments.map((assignment) => (
                                          <div key={assignment.assignmentID}>
                                            {/* Quiz Assignment */}
                                            {assignment.quiz && (
                                              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 hover:border-amber-400 transition-all">
                                                <div className="flex items-start justify-between gap-3">
                                                  <button
                                                    onClick={() => router.push(`/quizzes/${assignment.quiz.quizID}`)}
                                                    className="flex-1 text-left"
                                                  >
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <FileText size={14} className="text-amber-600 shrink-0" />
                                                      <p className="font-medium text-slate-800">{assignment.quiz.quizTitle}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600">
                                                      <span className="flex items-center gap-1">
                                                        <Trophy size={11} />
                                                        {assignment.quiz.questionCount} question{assignment.quiz.questionCount !== 1 ? 's' : ''}
                                                      </span>
                                                      <span className="text-slate-400">•</span>
                                                      <span className="flex items-center gap-1">
                                                        <Clock size={11} />
                                                        {assignment.quiz.quizDuration} min
                                                      </span>
                                                      <span className="text-slate-400">•</span>
                                                      <span>Pass: {assignment.quiz.passingMarks}/{assignment.quiz.totalMarks}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                                                      <Calendar size={11} />
                                                      <span>
                                                        {new Date(assignment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                      </span>
                                                    </div>
                                                  </button>
                                                  {canEditCourse && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditQuiz(
                                                          assignment.quiz,
                                                          assignment.assignmentID,
                                                          assignment.startDate,
                                                          assignment.dueDate
                                                        );
                                                      }}
                                                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
                                                      title="Edit Quiz"
                                                    >
                                                      <Edit2 size={16} />
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {/* Exercise Assignment */}
                                            {assignment.exercise && (
                                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <FileText size={14} className="text-blue-600 shrink-0" />
                                                  <p className="font-medium text-slate-800">{assignment.exercise.exerciseTitle}</p>
                                                </div>
                                                <p className="text-xs text-slate-600 line-clamp-2 mb-1.5">{assignment.exercise.exerciseDescription}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                  <Calendar size={11} />
                                                  <span>
                                                    {new Date(assignment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Learners Tab */}
          {activeTab === 'learners' && (
            <div className="glass rounded-2xl p-6 shadow-smooth-lg">
              {/* Filter */}
              <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Enrollment Status:</label>
                <select
                  value={enrollmentStatus}
                  onChange={(e) => setEnrollmentStatus(e.target.value)}
                  className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 cursor-pointer shadow-smooth"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : learners.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No learners found</h3>
                  <p className="text-slate-500">No students are enrolled with {enrollmentStatus} status</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-slate-600">
                      Showing <span className="font-bold text-indigo-600">{learners.length}</span> learner{learners.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Enrollment Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {learners.map((learner, index) => (
                          <tr 
                            key={index}
                            className="border-b border-slate-100 hover:bg-white/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                                  {learner.FullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="font-medium text-slate-800">
                                  {learner.FullName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{learner.Email}</td>
                            <td className="py-3 px-4 text-slate-600">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                {new Date(learner.enrollmentDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[120px]">
                                  <div
                                    className="h-2 rounded-full bg-linear-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                                    style={{ width: `${learner.progressPercentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 min-w-[45px]">
                                  {learner.progressPercentage}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}


        </div>
      </div>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLesson(null);
        }}
        lessonTitle={selectedLesson?.title || ''}
        onSubmit={handleModalSubmit}
      />

      {/* Edit Quiz Modal */}
      {selectedQuiz && (
        <EditQuizModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedQuiz(null);
          }}
          quiz={selectedQuiz}
          onSubmit={handleEditModalSubmit}
        />
      )}
    </div>
  );
}
