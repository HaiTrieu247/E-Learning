
import { Search, Filter } from "lucide-react";

type QuizToolbarProps = {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  sortOrder: "newest" | "points";
  onSortOrderChange: (order: "newest" | "points") => void;
};

export default function QuizToolbar({
  searchTerm,
  onSearchTermChange,
  sortOrder,
  onSortOrderChange,

}: QuizToolbarProps) {
  return (
    <div className="px-8 mb-6 flex gap-4 items-center flex-wrap">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search question content..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:border-[#007aaa] focus:ring-1 focus:ring-[#007aaa] outline-none transition"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={18} className="text-gray-600" />
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as any)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="points">Sort by: Points</option>
        </select>
      </div>
    </div>
  );
}
