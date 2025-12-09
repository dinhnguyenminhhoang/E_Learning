"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userLearningPathService } from "@/services/userLearningPath.service";
import { UserOverview } from "@/types/learning";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function LearnPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOverview();
  }, []);

  const fetchUserOverview = async () => {
    try {
      setLoading(true);
      const response = await userLearningPathService.getUserOverview();

      if (response.code === 200 && response.data) {
        setOverview(response.data);
      } else {
        toast.error("Không thể tải dữ liệu overview");
      }
    } catch (error: any) {
      console.error("Error fetching user overview:", error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!overview?.hasLearningPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Chưa có lộ trình học
          </h2>
          <p className="text-gray-600 mb-8">
            {overview?.message || "Vui lòng hoàn thành onboarding để bắt đầu học"}
          </p>
          <Link
            href="/onboarding"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </div>
    );
  }

  const { user: userInfo, dailyProgress, learningPath, recentLessons, vocabularyStats, quickActions } = overview;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Xin chào, {userInfo?.name || "bạn"}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Hãy tiếp tục hành trình học tiếng Anh của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Progress Card */}
            {dailyProgress && (
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      Tiến độ hôm nay
                    </h2>
                    <p className="text-gray-600">
                      Mục tiêu: {dailyProgress.goal} bài học
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {dailyProgress.completed}
                      </div>
                      <div className="text-sm text-gray-500">/ {dailyProgress.goal}</div>
                    </div>
                    {userInfo?.streak && userInfo.streak > 0 && (
                      <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full">
                        🔥 {userInfo.streak} ngày
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${dailyProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-right text-sm font-medium text-gray-600">
                  {dailyProgress.percentage}% hoàn thành
                </div>
              </div>
            )}

            {/* Learning Path Overview */}
            {learningPath && (
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {learningPath.title}
                    </h2>
                    <p className="text-gray-600">{learningPath.description}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                    Level {learningPath.currentLevel}/{learningPath.totalLevels}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {learningPath.totalLessons}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Tổng bài học</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {learningPath.completedLessons}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Đã hoàn thành</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {learningPath.progressPercentage}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Tiến độ</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${learningPath.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Recently Accessed Lessons */}
            {recentLessons && recentLessons.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Bài học gần đây
                </h2>
                <div className="space-y-4">
                  {recentLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                            {lesson.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">
                              📖 {lesson.topic}
                            </span>
                            <span className="text-sm text-gray-600">
                              • {lesson.skill}
                            </span>
                          </div>
                        </div>
                        {lesson.isCompleted && (
                          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            ✓ Hoàn thành
                          </div>
                        )}
                      </div>

                      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${lesson.progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {lesson.progressPercentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {quickActions && quickActions.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Hành động nhanh
                </h2>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.id}
                      href={action.link}
                      className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <span className="font-semibold">{action.label}</span>
                      <span className="ml-auto group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary Statistics */}
            {vocabularyStats && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Thống kê từ vựng
                </h2>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {vocabularyStats.totalWords}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tổng từ đã học</div>
                </div>

                <div className="space-y-3">
                  {vocabularyStats.byLevel.map((levelStat, index) => {
                    const colors = [
                      "from-green-400 to-green-500",
                      "from-blue-400 to-blue-500",
                      "from-yellow-400 to-yellow-500",
                      "from-orange-400 to-orange-500",
                      "from-purple-400 to-purple-500",
                    ];
                    const bgColors = [
                      "bg-green-50 border-green-200",
                      "bg-blue-50 border-blue-200",
                      "bg-yellow-50 border-yellow-200",
                      "bg-orange-50 border-orange-200",
                      "bg-purple-50 border-purple-200",
                    ];

                    return (
                      <div
                        key={levelStat.level}
                        className={`${bgColors[index]} border rounded-xl p-3`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {levelStat.level}
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {levelStat.count}
                          </span>
                        </div>
                        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-500`}
                            style={{
                              width: `${Math.min(
                                (levelStat.count / (vocabularyStats.totalWords || 1)) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
