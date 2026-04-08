import { useRef } from "react";

export default function OTPInput({ length = 6, onChange }) {
  const refs = useRef([]);
  
  const onInput = (i, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 1);
    e.target.value = v;
    if (v && refs.current[i + 1]) refs.current[i + 1].focus();
    onChange?.(refs.current.map(r => r.value).join(""));
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !e.target.value && refs.current[i - 1]) {
      refs.current[i - 1].focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center my-6">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          onInput={(e) => onInput(i, e)}
          onKeyDown={(e) => onKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          className="w-12 h-12 text-center text-xl font-semibold bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
        />
      ))}
    </div>
  );
}
