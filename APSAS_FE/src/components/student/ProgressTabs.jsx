export default function ProgressTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: "hoat-dong", label: "Hoạt động" },
    { id: "dang-lam", label: "Bài tập đang làm" },
    { id: "hoan-tat", label: "Truyện tích" },
  ];

  return (
    <div className="flex gap-3 border-b border-[#202934]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-medium transition whitespace-nowrap ${
            activeTab === tab.id
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
