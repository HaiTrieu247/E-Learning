'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Award, Clock, Hash, Calendar } from 'lucide-react';

interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: {
    quizID: number;
    quizTitle: string;
    totalMarks: number;
    passingMarks: number;
    quizDuration: number;
    startDate?: string;
    dueDate?: string;
  };
  onSubmit: (data: {
    quizTitle: string;
    totalMarks: number;
    passingMarks: number;
    quizDuration: number;
    startDate: string;
    dueDate: string;
  }) => void;
}

export default function EditQuizModal({
  isOpen,
  onClose,
  quiz,
  onSubmit
}: EditQuizModalProps) {
  const [formData, setFormData] = useState({
    quizTitle: quiz.quizTitle,
    totalMarks: quiz.totalMarks.toString(),
    passingMarks: quiz.passingMarks.toString(),
    quizDuration: quiz.quizDuration.toString(),
    startDate: quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : '',
    dueDate: quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        quizTitle: quiz.quizTitle,
        totalMarks: quiz.totalMarks.toString(),
        passingMarks: quiz.passingMarks.toString(),
        quizDuration: quiz.quizDuration.toString(),
        startDate: quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : '',
        dueDate: quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : ''
      });
      setErrors({});
    }
  }, [isOpen, quiz]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.quizTitle.trim()) {
      newErrors.quizTitle = 'Quiz title is required';
    }
    
    const totalMarks = parseInt(formData.totalMarks);
    const passingMarks = parseInt(formData.passingMarks);
    const quizDuration = parseInt(formData.quizDuration);
    
    if (isNaN(totalMarks) || totalMarks <= 0) {
      newErrors.totalMarks = 'Total marks must be a positive number';
    }
    
    if (isNaN(passingMarks) || passingMarks <= 0) {
      newErrors.passingMarks = 'Passing marks must be a positive number';
    }
    
    if (isNaN(quizDuration) || quizDuration <= 0) {
      newErrors.quizDuration = 'Duration must be a positive number';
    }
    
    if (passingMarks > totalMarks) {
      newErrors.passingMarks = 'Passing marks cannot exceed total marks';
    }

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) <= new Date(formData.startDate)) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      quizTitle: formData.quizTitle,
      totalMarks,
      passingMarks,
      quizDuration,
      startDate: formData.startDate,
      dueDate: formData.dueDate
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Edit Quiz</h2>
              <p className="text-xs text-slate-500">Quiz ID: {quiz.quizID}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={formData.quizTitle}
              onChange={(e) => handleChange('quizTitle', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.quizTitle
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
              }`}
            />
            {errors.quizTitle && (
              <p className="text-xs text-red-600 mt-1">{errors.quizTitle}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Hash size={16} className="text-slate-500" />
                Total Marks
              </label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => handleChange('totalMarks', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.totalMarks
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
                }`}
                min="1"
              />
              {errors.totalMarks && (
                <p className="text-xs text-red-600 mt-1">{errors.totalMarks}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Award size={16} className="text-slate-500" />
                Passing Marks
              </label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => handleChange('passingMarks', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.passingMarks
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
                }`}
                min="1"
              />
              {errors.passingMarks && (
                <p className="text-xs text-red-600 mt-1">{errors.passingMarks}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Clock size={16} className="text-slate-500" />
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.quizDuration}
              onChange={(e) => handleChange('quizDuration', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.quizDuration
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
              }`}
              min="1"
            />
            {errors.quizDuration && (
              <p className="text-xs text-red-600 mt-1">{errors.quizDuration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              Due Date
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.dueDate
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-400'
              }`}
            />
            {errors.dueDate && (
              <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              Update Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
