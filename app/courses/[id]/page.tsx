'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Users, Trophy, BookOpen, Loader2, GraduationCap, Calendar, TrendingUp, Award, Target } from 'lucide-react';
import type { Course } from '@/src/types/course';
import type { CourseLearner, StudentQuizPerformance } from '@/src/types/learner';

export default function CourseDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseID = searchParams.get('courseID');

  const [activeTab, setActiveTab] = useState<'overview' | 'learners' | 'performance'>('overview');
  const [course, setCourse] = useState<Course | null>(null);
  const [learners, setLearners] = useState<CourseLearner[]>([]);
  const [performance, setPerformance] = useState<StudentQuizPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minScore, setMinScore] = useState<number>(0);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('active');

  // Fetch course details
  useEffect(() => {
    if (!courseID) return;

    const fetchCourse = async () => {
      try {
        const res = await fetch('/api/courses');
        const courses = await res.json();
        const foundCourse = courses.find((c: Course) => c.courseID === parseInt(courseID));
        setCourse(foundCourse || null);
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    fetchCourse();
  }, [courseID]);

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
        console.log('Learners data:', data);
        
        // Ensure data is an array
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

  // Fetch performance
  useEffect(() => {
    if (!courseID || activeTab !== 'performance') return;

    const fetchPerformance = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/courses/${courseID}/performance?minScore=${minScore}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Performance data:', data);
        
        // Ensure data is an array
        setPerformance(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching performance:', error);
        setPerformance([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [courseID, activeTab, minScore]);

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
                  <h1 className="text-3xl font-bold gradient-text mb-2">{course.courseTitle}</h1>
                  <p className="text-slate-600 mb-3">{course.courseDescription}</p>
                  {course.categoryName && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-indigo-600 shadow-smooth">
                      {course.categoryName}
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
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-smooth-lg'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <BookOpen size={18} />
            Overview
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
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'performance'
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-smooth-lg'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Trophy size={18} />
            Performance
          </button>
        </div>

        {/* Content */}
        <div className="animate-scale-in">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="glass rounded-2xl p-8 shadow-smooth-lg">
              <div className="text-center max-w-2xl mx-auto">
                <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Course Overview</h2>
                <p className="text-slate-600 mb-6">
                  Select the Learners tab to view enrolled students or the Performance tab to see quiz statistics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push(`/quizzes/by-course?courseID=${courseID}`)}
                    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 group border border-indigo-200 hover:border-indigo-400"
                  >
                    <BookOpen className="w-10 h-10 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-slate-800 font-semibold">View Quizzes</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('learners')}
                    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 group border border-emerald-200 hover:border-emerald-400"
                  >
                    <Users className="w-10 h-10 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-slate-800 font-semibold">View Learners</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('performance')}
                    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 group border border-amber-200 hover:border-amber-400"
                  >
                    <Trophy className="w-10 h-10 text-amber-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-slate-800 font-semibold">View Performance</p>
                  </button>
                </div>
              </div>
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
                                  {learner.FNAME[0]}{learner.LNAME[0]}
                                </div>
                                <span className="font-medium text-slate-800">
                                  {learner.FNAME} {learner.LNAME}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{learner.email}</td>
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

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="glass rounded-2xl p-6 shadow-smooth-lg">
              {/* Filter */}
              <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Minimum Score:</label>
                <input
                  type="number"
                  value={minScore}
                  onChange={(e) => setMinScore(parseFloat(e.target.value) || 0)}
                  className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-smooth w-32"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="text-sm text-slate-500">Show students with score ≥ {minScore}</span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : performance.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No performance data</h3>
                  <p className="text-slate-500">No quiz submissions found with minimum score of {minScore}</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-slate-600">
                      Showing <span className="font-bold text-indigo-600">{performance.length}</span> result{performance.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Student</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Quiz</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Score</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Attempts</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performance.map((item, index) => {
                          const percentage = (item.HighestScoreObtained / item.MaxPossibleScore) * 100;
                          const isPassed = percentage >= 60; // Assuming 60% is passing
                          
                          return (
                            <tr 
                              key={index}
                              className="border-b border-slate-100 hover:bg-white/50 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-slate-800">{item.FullName}</p>
                                  <p className="text-xs text-slate-500">@{item.StudentAccount}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-700">{item.quizTitle}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center gap-2">
                                    <Target size={16} className="text-indigo-600" />
                                    <span className="font-semibold text-slate-800">
                                      {item.HighestScoreObtained}/{item.MaxPossibleScore}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <TrendingUp size={16} className="text-slate-400" />
                                  <span className="font-medium text-slate-700">{item.AttemptsCount}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex justify-center">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    isPassed 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    <Award size={14} />
                                    {isPassed ? 'Passed' : 'Need Improvement'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
