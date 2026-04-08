import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock } from "lucide-react";

export default function CourseCard({ id, title, desc, stats, image, badge }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/course/${id}`);
    }
  };

  return (
    <article
      className="bg-[#0f1419] border border-[#202934] rounded-xl overflow-hidden hover:border-emerald-500 transition-all cursor-pointer group"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3
          className="text-white font-bold text-lg line-clamp-2 group-hover:text-emerald-400 transition-colors"
          title={title}
        >
          {title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2" title={desc}>
          {desc}
        </p>
        <div className="flex items-center justify-between text-gray-500 text-sm pt-2 border-t border-[#202934]">
          <span className="flex items-center gap-1">
            <Users size={14} className="text-emerald-500" />
            <span className="text-gray-400">{stats.learners}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-emerald-500" />
            <span className="text-gray-400">{stats.progress}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
