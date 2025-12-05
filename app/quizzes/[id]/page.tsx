"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle, CheckCircle, Save, X, Trash2, Palette, ArrowLeft } from "lucide-react";

import type { Question, Quiz } from "@/src/types/quiz";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "@/src/services/quizService";

import QuizToolbar from "@/src/components/quiz/QuizToolbar";
import QuestionCard from "@/src/components/quiz/QuestionCard";

import '../QuizPage.css';

export type QuestionFormData = Omit<Question, 'id' | 'createdAt'>;

const initialFormData: QuestionFormData = {
  content: "",
  options: [ { id: "A", text: "" }, { id: "B", text: "" }, { id: "C", text: "" }, { id: "D", text: "" }, ],
  correctOptionId: "",
  points: 1,
};

function QuestionForm({ 
    editingQuestion,
    isSaving, 
    onSave, 
    onCancel,
    showNotification
} : { 
    editingQuestion: Question | null, 
    isSaving: boolean, 
    onSave: (data: QuestionFormData, id: number | null) => void,
    onCancel: () => void,
    showNotification: (type: 'error' | 'success', msg: string) => void;
}) {
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const optionColors = ["bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700", "bg-amber-100 text-amber-700", "bg-teal-100 text-teal-700"];

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [formData.content]);

  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        content: editingQuestion.content,
        options: [...editingQuestion.options],
        correctOptionId: editingQuestion.correctOptionId,
        points: editingQuestion.points,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingQuestion]);

  const handleValidationAndSave = () => {
    if (!formData.content.trim()) {
      showNotification("error", "Question content cannot be empty.");
      return;
    }
    if (formData.options.some(opt => !opt.text.trim())) {
      showNotification("error", "All 4 options must be filled.");
      return;
    }
    if (!formData.correctOptionId) {
      showNotification("error", "Please select the correct answer.");
      return;
    }
    onSave(formData, editingQuestion ? editingQuestion.id : null);
  };
  
  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="bg-white rounded-2xl soft-shadow border border-slate-200/80 p-8 my-6 space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-800">{editingQuestion ? "Edit Question" : "Create New Question"}</h3>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Question Content <span className="text-rose-500">*</span></label>
        <div className="relative">
            <textarea 
              ref={textareaRef}
              className="w-full border border-slate-300 rounded-lg p-3 focus-ring-indigo auto-resize-textarea"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="e.g., What is the primary key in a relational database?"
              disabled={isSaving}
            />
            <div className="absolute top-2 right-2 flex gap-1 text-slate-400">
                <Palette size={16} />
            </div>
        </div>
      </div>

      <div className="space-y-2">
         <label className="block text-sm font-semibold text-slate-700">Points</label>
         <input 
            type="number" 
            min="0"
            step="0.5"
            value={formData.points}
            onChange={(e) => setFormData({...formData, points: parseFloat(e.target.value) || 0})}
            className="w-32 border border-slate-300 rounded-lg p-2 focus-ring-indigo disabled:bg-slate-100"
            disabled={isSaving}
         />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Answer Options <span className="text-rose-500">*</span></label>
        <div className="space-y-3">
          {formData.options.map((opt, idx) => (
            <div key={opt.id} className={`option-row ${formData.correctOptionId === opt.id ? 'correct' : ''}`}>
              <div className={`w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center font-bold text-sm ${optionColors[idx]}`}>{opt.id}</div>
              <input 
                type="text" 
                value={opt.text}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Answer ${opt.id}`}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 disabled:bg-transparent"
                disabled={isSaving}
              />
              <input 
                type="radio" 
                name={`correctOption-${editingQuestion?.id || 'new'}`}
                checked={formData.correctOptionId === opt.id}
                onChange={() => setFormData({...formData, correctOptionId: opt.id})}
                className="custom-radio"
                title="Mark as correct answer"
                disabled={isSaving}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 text-right">Click the radio button on the right to select the correct answer.</p>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
        <button 
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium disabled:opacity-50 transition-colors"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button 
          onClick={handleValidationAndSave}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          disabled={isSaving}
        >
          {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

function DeleteConfirmation({ onConfirm, onCancel, isDeleting }: { onConfirm: () => void, onCancel: () => void, isDeleting: boolean }) {
  return (
    <div className="bg-white rounded-2xl soft-shadow border border-slate-200/80 p-6 my-6 flex items-start gap-4 animate-fade-in">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-600" />
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-slate-800">Delete Question</h4>
            <p className="text-sm text-slate-600 mt-1">Are you sure you want to permanently delete this question? This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0 self-center">
            <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
            Cancel
            </button>
            <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2 transition-colors active:scale-95"
            >
            {isDeleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    </div>
  );
}

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizID = params.id ? parseInt(params.id as string) : null;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "points">("newest");
  const [notification, setNotification] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!quizID) {
      setError("Invalid quiz ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getQuestions(quizID);
      setQuestions(data);
    } catch (e) {
      setError("Failed to load questions. Please try again later.");
      showNotification("error", "Could not fetch questions.");
    } finally {
      setIsLoading(false);
    }
  }, [quizID]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  };
  
  const resetState = () => {
      setIsAdding(false);
      setEditingId(null);
      setDeletingId(null);
  }

  const filteredQuestions = useMemo(() => {
    let result = questions.filter((q) =>
      q.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === "points") {
      result.sort((a, b) => b.points - a.points);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); 
    }
    return result;
  }, [questions, searchTerm, sortOrder]);
  
  const handleSave = async (formData: QuestionFormData, id: number | null) => {
    if (!quizID) {
      showNotification("error", "Invalid quiz ID");
      return;
    }
    
    setIsSaving(true);
    try {
      if (id) {
        await updateQuestion(id, { ...formData, quizID });
        showNotification("success", "Question updated successfully!");
      } else {
        await createQuestion({ ...formData, quizID } as any);
        showNotification("success", "New question added successfully!");
      }
      resetState();
      await fetchQuestions();
    } catch (e: any) {
       const errorMsg = e.message || "Error saving question";
       showNotification("error", errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      setIsDeleting(true);
      try {
        await deleteQuestion(deletingId);
        showNotification("success", "Question deleted.");
        resetState();
        await fetchQuestions();
      } catch(e) {
        showNotification("error", "Error deleting question.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {notification && (
        <div className={`toast-notification ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {notification.type === 'success' ? <CheckCircle size={22}/> : <AlertCircle size={22}/>}
          <span className="font-semibold">{notification.msg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        <div className="sticky-header mb-6 -mx-4 -mt-4 md:-mx-8 md:-mt-8 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Back to Quizzes</span>
                </button>

                <div className="flex justify-between items-center mb-6">
                    <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quiz Questions</h1>
                    <p className="text-sm text-slate-500 mt-1">Quiz ID: {quizID}</p>
                    </div>
                    <button 
                    onClick={() => { setIsAdding(!isAdding); setEditingId(null); setDeletingId(null); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all duration-200 active:scale-95"
                    >
                    {isAdding ? <><X size={18}/> Cancel</> : <><Plus size={18} /> Add Question</>}
                    </button>
                </div>

                <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 soft-shadow">
                    <QuizToolbar 
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        sortOrder={sortOrder}
                        onSortOrderChange={setSortOrder}
                    />
                </div>
            </div>
        </div>

        {isAdding && (
            <QuestionForm
                editingQuestion={null}
                isSaving={isSaving}
                onSave={handleSave}
                onCancel={resetState}
                showNotification={showNotification}
            />
        )}

        <div className="space-y-5">
            {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="mt-4 font-medium">Loading Questions...</p>
            </div>
            ) : error ? (
            <div className="text-center py-20 text-rose-600 bg-rose-50 rounded-2xl soft-shadow">
                <AlertCircle className="mx-auto w-12 h-12 mb-3" />
                <p className="font-bold text-lg">{error}</p>
                <p className="text-sm mt-1">Please check your connection and try again.</p>
            </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-24 text-slate-500 bg-white rounded-2xl soft-shadow">
                    <h3 className="font-bold text-xl text-slate-700">No Questions Found</h3>
                    <p className="text-sm mt-2">There are no questions matching your criteria. <br/> Why not add a new one?</p>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all duration-200 active:scale-95 mx-auto"
                    >
                        <Plus size={18} /> Add Question
                    </button>
                </div>
            ) : (
            filteredQuestions.map((q, index) => (
                <React.Fragment key={q.id}>
                {editingId === q.id ? (
                    <QuestionForm
                        editingQuestion={q}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={resetState}
                        showNotification={showNotification}
                    />
                ) : (
                    <QuestionCard 
                        question={q}
                        index={index}
                        onEdit={() => { setEditingId(q.id); setDeletingId(null); setIsAdding(false); }}
                        onDelete={() => { setDeletingId(q.id); setEditingId(null); setIsAdding(false); }}
                    />
                )}
                
                {deletingId === q.id && (
                    <DeleteConfirmation 
                        isDeleting={isDeleting}
                        onConfirm={handleDeleteConfirm}
                        onCancel={resetState}
                    />
                )}
                </React.Fragment>
            ))
            )}
        </div>
      </div>
    </>
  );
}
