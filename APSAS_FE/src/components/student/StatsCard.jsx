export default function StatsCard({ value, label, color = "purple" }) {
  const colorClasses = {
    purple:
      "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400",
    emerald:
      "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
    yellow:
      "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-400",
  };

  return (
    <div
      className={`bg-linear-to-br ${colorClasses[color]} border rounded-lg p-4`}
    >
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className={`text-sm ${colorClasses[color].split(" ").pop()}`}>
        {label}
      </div>
    </div>
  );
}
