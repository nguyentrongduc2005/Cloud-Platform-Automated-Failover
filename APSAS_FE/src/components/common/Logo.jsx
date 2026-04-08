// src/components/common/Logo.jsx
export default function Logo({ color = "text-primary", size = "text-3xl" }) {
  return (
    <div
      className="flex flex-col items-center gap-1 mb-6"
      aria-label="APSAS"
    >
      <div className={`font-extrabold ${size} ${color} select-none`}>
        {`</>`}
      </div>
      <div className={`font-extrabold tracking-wider ${color} text-lg select-none`}>
        APSAS
      </div>
    </div>
  );
}
