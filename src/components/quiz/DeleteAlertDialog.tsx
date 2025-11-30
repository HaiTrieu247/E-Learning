
import { AlertCircle } from "lucide-react";

type DeleteAlertDialogProps = {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAlertDialog({ isOpen, isDeleting, onClose, onConfirm }: DeleteAlertDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="text-red-600 w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Question?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this question? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
