'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trophy, Loader2, Target, TrendingUp, Award } from 'lucide-react';
import type { StudentQuizPerformance } from '@/src/types/learner';

export default function ModulePerformancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseID = searchParams.get('courseID');
  const moduleID = searchParams.get('moduleID');

  const [performance, setPerformance] = useState<StudentQuizPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minScore, setMinScore] = useState<number>(0);

  // Fetch performance
  useEffect(() => {
    if (!courseID) return;

    const fetchPerformance = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/courses/${courseID}/performance?minScore=${minScore}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setPerformance(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching performance:', error);
        setPerformance([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [courseID, minScore]);

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
            onClick={() => router.push(`/courses/${courseID}?courseID=${courseID}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Course</span>
          </button>

          <div className="glass rounded-2xl p-6 shadow-smooth-lg">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-linear-to-br from-amber-600 to-orange-600 rounded-xl">
                <Trophy size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold gradient-text mb-2">Module Performance</h1>
                <p className="text-slate-600">View student quiz performance and statistics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-6 shadow-smooth-lg animate-scale-in">
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
                      const isPassed = percentage >= 60;
                      
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
      </div>
    </div>
  );
}
