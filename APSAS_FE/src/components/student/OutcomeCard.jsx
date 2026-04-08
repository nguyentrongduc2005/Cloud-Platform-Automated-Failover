import React from "react";
import { Check, Circle } from "lucide-react";

export default function OutcomeCard() {
  return (
    <div className="space-y-4">
      <ul className="space-y-2 text-[15px] text-slate-200">
        <li className="flex gap-2 items-start">
          <span className="text-emerald-400 mt-0.5">
            <Check size={16} />
          </span>
          Hiểu cú pháp và cấu trúc cơ bản của Java
        </li>
        <li className="flex gap-2 items-start">
          <span className="text-emerald-400 mt-0.5">
            <Check size={16} />
          </span>
          Áp dụng OOP trong bài toán thực tế
        </li>
        <li className="flex gap-2 items-start">
          <span className="text-emerald-400 mt-0.5">
            <Check size={16} />
          </span>
          Sử dụng IDE như IntelliJ hoặc VSCode
        </li>
        <li className="flex gap-2 items-start">
          <span className="text-emerald-400 mt-0.5">
            <Check size={16} />
          </span>
          Thực hành với bài tập có phản hồi tự động
        </li>
      </ul>

      <div className="h-px bg-white/10" />

      <h4 className="font-semibold text-white">Yêu cầu đầu vào</h4>
      <ul className="space-y-2 text-[15px] text-slate-200">
        <li className="flex gap-2 items-start">
          <span className="text-emerald-400 mt-1">
            <Circle size={8} fill="currentColor" />
          </span>
          Không yêu cầu kiến thức trước
        </li>
        <li className="flex gap-2 items-start">
          <span className="text-emerald-400 mt-1">
            <Circle size={8} fill="currentColor" />
          </span>
          Có máy tính cài Java 17+
        </li>
      </ul>
    </div>
  );
}
