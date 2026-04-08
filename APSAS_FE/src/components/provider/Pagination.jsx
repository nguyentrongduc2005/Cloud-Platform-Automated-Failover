import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-[#202934] bg-[#0f1419] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#131a22] transition"
      >
        <ChevronLeft size={18} />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 rounded-lg border border-[#202934] bg-[#0f1419] text-white hover:bg-[#131a22] transition"
          >
            1
          </button>
          {startPage > 2 && <span className="text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg border transition ${
            currentPage === page
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
              : "border-[#202934] bg-[#0f1419] text-white hover:bg-[#131a22]"
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 rounded-lg border border-[#202934] bg-[#0f1419] text-white hover:bg-[#131a22] transition"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-[#202934] bg-[#0f1419] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#131a22] transition"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
