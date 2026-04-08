export default function AchievementCard({ achievement }) {
  const Icon = achievement.icon;
  const colorClasses = {
    purple: "from-purple-500 to-purple-600 border-purple-500/30",
    blue: "from-blue-500 to-blue-600 border-blue-500/30",
    pink: "from-pink-500 to-pink-600 border-pink-500/30",
  };

  return (
    <div className="bg-[#0f1419] border border-[#202934] rounded-xl p-5 hover:border-emerald-500/50 transition">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-lg bg-linear-to-br ${
            colorClasses[achievement.color]
          } border flex items-center justify-center shrink-0`}
        >
          <Icon size={24} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold mb-1">{achievement.name}</h4>
          <p className="text-gray-400 text-sm mb-2">
            {achievement.description}
          </p>
          <p className="text-gray-500 text-xs">{achievement.date}</p>
        </div>
      </div>
    </div>
  );
}
