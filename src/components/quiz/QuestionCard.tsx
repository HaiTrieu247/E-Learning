"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, MoreVertical, Star, CheckCircle } from "lucide-react";
import type { Question } from "@/src/types/quiz";

type QuestionCardProps = {
  question: Question;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  showCorrectAnswer?: boolean; // New prop to control answer visibility
};

export default function QuestionCard({ question, index, onEdit, onDelete, showCorrectAnswer = true }: QuestionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // If no edit/delete handlers, hide the menu button
  const hasActions = onEdit || onDelete;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 soft-shadow border border-slate-200/80 flex flex-col transition-all duration-300">
      {/* Header Card */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {/* Quiz Badge */}
          {question.quizTitle && (
            <div className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              {question.quizTitle}
            </div>
          )}
          {/* Points Chip */}
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            <Star size={14} className="fill-amber-500" />
            <span className="text-sm font-bold">{question.points} {question.points > 1 ? 'Points' : 'Point'}</span>
          </div>
        </div>
        
        {/* Actions Menu */}
        {hasActions && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
              title="More options"
            >
              <MoreVertical size={20} />
            </button>
            
            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200/80 z-10 animate-fade-in-sm">
                {onEdit && (
                  <button
                    onClick={() => { onEdit(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 text-left rounded-t-md"
                  >
                    <Edit size={16} /> <span>Edit</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left rounded-b-md"
                  >
                    <Trash2 size={16} /> <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question Content */}
      <h3 className="text-lg text-slate-800 font-semibold mb-5 flex-grow">{question.content}</h3>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {question.options.map(opt => (
          <div
            key={opt.id}
            className={`px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 border
              ${showCorrectAnswer && opt.id === question.correctOptionId
                ? "border-emerald-200 bg-emerald-50/50 text-slate-800"
                : "bg-slate-50/80 border-slate-200/80 text-slate-700"
              }`}
          >
            <span className={`font-bold w-6 text-center
              ${showCorrectAnswer && opt.id === question.correctOptionId ? "text-emerald-600" : "text-slate-500"}
            `}>
              {opt.id}.
            </span>
            <span className="flex-grow">{opt.text}</span>
            {showCorrectAnswer && opt.id === question.correctOptionId && (
              <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
