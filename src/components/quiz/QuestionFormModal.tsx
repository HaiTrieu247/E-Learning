
import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import type { Question } from "@/src/types/quiz";

// The data passed to the modal, without internal ID management
export type QuestionFormData = Omit<Question, 'id' | 'createdAt'>;

type QuestionFormModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  editingQuestion: Question | null;
  onClose: () => void;
  onSave: (data: QuestionFormData, id: number | null) => void;
  showNotification: (type: 'error' | 'success', msg: string) => void;
};

const initialFormData: QuestionFormData = {
  content: "",
  options: [
    { id: "A", text: "" }, { id: "B", text: "" },
    { id: "C", text: "" }, { id: "D", text: "" },
  ],
  correctOptionId: "",
  points: 1,
};

export default function QuestionFormModal({
  isOpen,
  isSaving,
  editingQuestion,
  onClose,
  onSave,
  showNotification
}: QuestionFormModalProps) {
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
  
  useEffect(() => {
    if (isOpen && editingQuestion) {
      // If editing, populate form with question data
      setFormData({
        content: editingQuestion.content,
        options: [...editingQuestion.options],
        correctOptionId: editingQuestion.correctOptionId,
        points: editingQuestion.points,
      });
    } else {
      // If creating, reset to initial state
      setFormData(initialFormData);
    }
  }, [isOpen, editingQuestion]);

  const handleValidationAndSave = () => {
    // 1. Validation
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
    // Pass data up to parent to handle the API call
    onSave(formData, editingQuestion ? editingQuestion.id : null);
  };
  
  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-[#007aaa] px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">{editingQuestion ? "Edit Question" : "Create New Question"}</h3>
          <button onClick={onClose} disabled={isSaving}><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Question Text */}
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

          {/* Points */}
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

          {/* Options */}
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
                    name="correctOption"
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
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button 
            onClick={onClose}
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
            {isSaving ? <><Save size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Question</>}
          </button>
        </div>
      </div>
    </div>
  );
}
