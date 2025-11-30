
import { Edit, Trash2 } from "lucide-react";
import type { Question } from "@/src/types/quiz";

type QuestionCardProps = {
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
};

export default function QuestionCard({ question, index, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
      {/* Header Card */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-bold rounded">Q{index + 1}</span>
          <span className="text-sm font-semibold text-[#007aaa]">{question.points} Points</span>
        </div>
      </div>

      {/* Question Content */}
      <h3 className="text-lg text-gray-800 font-medium mb-4">{question.content}</h3>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map(opt => (
          <div
            key={opt.id}
            className={`px-4 py-2 rounded border text-sm flex items-center gap-3
              ${opt.id === question.correctOptionId
                ? "bg-green-50 border-green-200 text-green-800 font-medium"
                : "bg-white border-gray-200 text-gray-600"
              }`}
          >
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs border
               ${opt.id === question.correctOptionId ? "border-green-600 bg-green-600 text-white" : "border-gray-300"}
            `}>
              {opt.id}
            </span>
            {opt.text}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
        <button
          onClick={() => onEdit(question)}
          className="p-2 text-gray-500 hover:text-[#007aaa] hover:bg-blue-50 rounded flex items-center gap-1.5"
          title="Edit"
        >
          <Edit size={16} /> <span className="text-sm font-medium">Edit</span>
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded flex items-center gap-1.5"
          title="Delete"
        >
          <Trash2 size={16} /> <span className="text-sm font-medium">Delete</span>
        </button>
      </div>
    </div>
  );
}
