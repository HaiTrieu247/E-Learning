"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertCircle, CheckCircle, Save, X } from "lucide-react";

import type { Question } from "@/src/types/quiz";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "@/src/services/quizService";

import QuizToolbar from "@/src/components/quiz/QuizToolbar";
import QuestionCard from "@/src/components/quiz/QuestionCard";

// --- FORMS (Previously Modals) ---

// Re-usable Question Form component
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 my-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">{editingQuestion ? "Edit Question" : "Create New Question"}</h3>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question Content <span className="text-red-500">*</span></label>
        <textarea 
          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[#007aaa] focus:border-transparent outline-none"
          rows={3}
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Enter the question text here..."
          disabled={isSaving}
        />
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
         <input 
            type="number" 
            step="0.5"
            value={formData.points}
            onChange={(e) => setFormData({...formData, points: parseFloat(e.target.value) || 0})}
            className="w-32 border border-gray-300 rounded p-2 focus:ring-[#007aaa] outline-none disabled:bg-gray-100"
            disabled={isSaving}
         />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Answers Options <span className="text-red-500">*</span></label>
        <div className="space-y-3">
          {formData.options.map((opt, idx) => (
            <div key={opt.id} className="flex items-center gap-3">
              <div className="w-8 font-bold text-gray-500 text-center">{opt.id}</div>
              <input 
                type="text" 
                value={opt.text}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${opt.id}`}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#007aaa] outline-none disabled:bg-gray-100"
                disabled={isSaving}
              />
              <input 
                type="radio" 
                name={`correctOption-${editingQuestion?.id || 'new'}`}
                checked={formData.correctOptionId === opt.id}
                onChange={() => setFormData({...formData, correctOptionId: opt.id})}
                className="w-5 h-5 text-[#007aaa] cursor-pointer disabled:cursor-not-allowed"
                title="Mark as correct answer"
                disabled={isSaving}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">Click the radio button to select the correct answer.</p>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium disabled:opacity-50"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button 
          onClick={handleValidationAndSave}
          className="px-6 py-2 bg-[#007aaa] text-white rounded hover:bg-[#006288] font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? <><Save size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save</>}
        </button>
      </div>
    </div>
  );
}

// Inline Delete Confirmation
function DeleteConfirmation({ onConfirm, onCancel, isDeleting }: { onConfirm: () => void, onCancel: () => void, isDeleting: boolean }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 flex justify-between items-center">
      <div>
        <h4 className="font-bold text-red-800">Delete Question?</h4>
        <p className="text-sm text-red-700">Are you sure? This action cannot be undone.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function QuizManager() {
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // New state for inline forms
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "points">("newest");
  const [notification, setNotification] = useState<{type: 'success'|'error', msg: string} | null>(null);

  // --- Data Fetching ---
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getQuestions();
      setQuestions(data);
    } catch (e) {
      setError("Failed to load questions. Please try again later.");
      showNotification("error", "Could not fetch questions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // --- Helpers ---
  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const resetState = () => {
      setIsAdding(false);
      setEditingId(null);
      setDeletingId(null);
  }

  // --- Logic: Search & Sort ---
  const filteredQuestions = useMemo(() => {
    let result = questions.filter((q) =>
      q.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === "points") {
      result.sort((a, b) => b.points - a.points);
    } else {
      result.sort((a, b) => b.id - a.id); 
    }
    return result;
  }, [questions, searchTerm, sortOrder]);
  
  // --- CRUD Handlers ---
  const handleSave = async (formData: QuestionFormData, id: number | null) => {
    setIsSaving(true);
    try {
      if (id) { // Update
        await updateQuestion(id, formData);
        showNotification("success", "Question updated successfully!");
      } else { // Create
        await createQuestion(formData as any);
        showNotification("success", "New question added successfully!");
      }
      resetState();
      await fetchQuestions();
    } catch (e) {
       showNotification("error", `Error saving question.`);
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

  // --- Render ---
  return (
    <div className="max-w-7xl mx-auto p-8 font-sans">
        
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz Management</h1>
          <p className="text-sm text-gray-500">Manage questions for the Database Systems quiz.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#007aaa] hover:bg-[#006288] text-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2 transition-colors"
        >
          {isAdding ? <><X size={18}/> Cancel</> : <><Plus size={18} /> Add Question</>}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <QuizToolbar 
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
        />
      </div>

      {/* ADD QUESTION FORM */}
      {isAdding && (
          <QuestionForm
            editingQuestion={null}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={resetState}
            showNotification={showNotification}
          />
      )}

      {/* QUESTION LIST */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-50 rounded-lg shadow-sm">
            <AlertCircle className="mx-auto w-10 h-10 mb-2" />
            {error}
          </div>
        ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
              <p className="font-medium">No Questions Found</p>
              <p className="text-sm">No questions matched your search. Try adding a new question.</p>
            </div>
        ) : (
          filteredQuestions.map((q, index) => (
            <React.Fragment key={q.id}>
              <QuestionCard 
                question={q}
                index={index}
                onEdit={() => { setEditingId(q.id); setDeletingId(null); setIsAdding(false); }}
                onDelete={() => { setDeletingId(q.id); setEditingId(null); setIsAdding(false); }}
              />
              {/* EDIT FORM */}
              {editingId === q.id && (
                  <QuestionForm
                      editingQuestion={q}
                      isSaving={isSaving}
                      onSave={handleSave}
                      onCancel={resetState}
                      showNotification={showNotification}
                  />
              )}
              {/* DELETE CONFIRMATION */}
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
      
      {/* --- TOAST NOTIFICATION --- */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-[50]
          ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
        `}>
          {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}
    </div>
  );
}