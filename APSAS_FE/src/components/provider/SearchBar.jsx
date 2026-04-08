import { Search } from "lucide-react";

export default function SearchBar({ keyword, onKeywordChange, onSearch }) {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="search"
          placeholder="Tìm kiếm theo tiêu đề, mô tả, người tạo..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full h-10 pl-10 pr-4 bg-[#0b0f12] border border-[#202934] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 transition"
        />
      </div>
      <button
        onClick={onSearch}
        className="px-6 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
      >
        Tìm kiếm
      </button>
    </div>
  );
}
