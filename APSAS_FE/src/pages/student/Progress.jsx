import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Target, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import progressService from "../../services/progressService";
import ProfileHeader from "../../components/student/ProfileHeader";
import ProgressTabs from "../../components/student/ProgressTabs";
import ActivityChart from "../../components/student/ActivityChart";
import CourseProgressCard from "../../components/student/CourseProgressCard";
import AchievementCard from "../../components/student/AchievementCard";

export default function StudentProgress() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("hoat-dong");
  const [loading, setLoading] = useState(true);

  

  const [stats, setStats] = useState({
    totalCourses: 0,
    completed: 0,
    completionRate: 0,
  });
  const [activityData, setActivityData] = useState([]);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // ==== FETCH DATA TỪ API ====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Chưa có user (chưa login) thì không call
        if (!user?.id) {
          setLoading(false);
          return;
        }

        // 1. Gọi API thật: GET /progress/{studentId} hoặc /progress/{studentId}/current
        const resp = await progressService.getProgress(user.id);

        // `progressService.getProgress` may return either:
        // - an object with { rawProgress, stats, activityData, currentCourses, achievements }
        // - or a plain list of progress items (legacy)
        let raw = [];
        let newStats = { totalCourses: 0, completed: 0, completionRate: 0 };
        let chartData = [];
        let courses = [];
        let achs = [];

        if (resp && typeof resp === "object" && !Array.isArray(resp) && resp.stats) {
          raw = Array.isArray(resp.rawProgress) ? resp.rawProgress : [];
          newStats = resp.stats || newStats;
          chartData = Array.isArray(resp.activityData) ? resp.activityData : progressService.buildChartData(raw);
          courses = Array.isArray(resp.currentCourses) ? resp.currentCourses : [];
          achs = Array.isArray(resp.achievements) ? resp.achievements : [];
        } else if (Array.isArray(resp)) {
          raw = resp;
          newStats = progressService.computeStats(raw);
          chartData = progressService.buildChartData(raw);
          courses = progressService.buildCurrentCourses(raw);
          achs = progressService.buildAchievements(raw);
        } else {
          // unknown response (server error returned non-array/non-object) -> keep defaults
          raw = [];
          newStats = { totalCourses: 0, completed: 0, completionRate: 0 };
          chartData = [];
          courses = [];
          achs = [];
        }

        // Ensure chart data values are numeric and filter invalid points
        const safeChart = (chartData || []).map((d, idx) => ({
          day: d.day ?? d.date ?? `D${idx + 1}`,
          value: Number(d.value ?? d.score ?? 0) || 0,
        }));

        // rawProgress state removed; keep only UI states
        setStats(newStats);
        setActivityData(safeChart);
        setCurrentCourses(courses);
        setAchievements(achs);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Đổi range biểu đồ: gọi API /progress/{id}/scores?from=YYYY-MM-DD&to=YYYY-MM-DD
  const handleDateRangeChange = async (rangeValue) => {
    // Determine days to include (inclusive of today)
    const daysCount = rangeValue === "7days" ? 7 : rangeValue === "30days" ? 30 : 90;

    // to = today, from = today - (daysCount - 1)
    const toDate = new Date();
    const fromDate = new Date(toDate);
    fromDate.setDate(toDate.getDate() - (daysCount - 1));

    const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD

    // Fetch daily scores for the selected range
    try {
      const resp = await progressService.getDailyScores(user.id, fmt(fromDate), fmt(toDate));

      let daily = [];
      if (!resp) {
        daily = [];
      } else if (resp && typeof resp === "object" && Object.prototype.hasOwnProperty.call(resp, "code") && resp.data) {
        // envelope shape { code, message, data }
        daily = Array.isArray(resp.data.dailyScoreDTOList) ? resp.data.dailyScoreDTOList : [];
      } else if (resp && typeof resp === "object" && Array.isArray(resp.dailyScoreDTOList)) {
        daily = resp.dailyScoreDTOList;
      } else if (Array.isArray(resp)) {
        daily = resp;
      } else {
        daily = [];
      }

      // Build chart data ensuring numeric values. Fill missing dates with 0 if needed.
      const chartData = daily.map((d, idx) => ({
        day: d.date ?? d.day ?? fmt(new Date(new Date(fromDate).getTime() + idx * 24 * 60 * 60 * 1000)),
        value: Number(d.score ?? d.value ?? 0) || 0,
      }));

      setActivityData(chartData);
    } catch (error) {
      console.error("Error fetching daily scores:", error);
    }
  };

  // Map icon cho achievements
  const achievementsWithIcons = achievements.map((achievement) => ({
    ...achievement,
    icon:
      achievement.icon === "Award"
        ? Award
        : achievement.icon === "Zap"
        ? Zap
        : Target,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với avatar + stats */}
      <ProfileHeader
        user={user}
        stats={stats}
        onEditClick={() => navigate("/profile")}
      />

      {/* Tabs */}
      <ProgressTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab hoạt động */}
      {activeTab === "hoat-dong" && (
        <ActivityChart
          data={activityData}
          onDateRangeChange={handleDateRangeChange}
        />
      )}

      {/* Tab đang làm */}
      {activeTab === "dang-lam" && (
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">
            Bài tập / khóa học đang học
          </h3>
          {currentCourses.map((course) => (
            <CourseProgressCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Tab hoàn tất */}
      {activeTab === "hoan-tat" && (
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg mb-4">
            Thành tích gần đây
          </h3>
          {achievementsWithIcons.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Bạn chưa hoàn thành khóa học nào.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsWithIcons.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
