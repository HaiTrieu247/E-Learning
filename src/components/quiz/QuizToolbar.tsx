
import { Search, ListFilter } from "lucide-react";

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
    <div className="flex gap-4 items-center flex-wrap">
      {/* Search Bar */}
      <div className="relative flex-grow">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search for questions..."
          className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-transparent rounded-full focus:border-indigo-300 focus-ring-indigo outline-none transition placeholder-slate-400"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-2">
        <ListFilter size={16} className="text-slate-500" />
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as any)}
          className="border border-slate-300/70 rounded-md px-3 py-2 text-sm font-medium text-slate-700 bg-white focus-ring-indigo outline-none"
        >
          <option value="newest">Sort: Newest</option>
          <option value="points">Sort: Highest Points</option>
        </select>
      </div>
    </div>
  );
}
