"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService, OverviewStats, TrendData, ContentDistribution, RecentActivity } from "@/services/analytics.service";
import {
  Activity,
  BookOpen,
  CreditCard,
  FolderTree,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  FileText,
  ClipboardList,
  Target,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [userTrend, setUserTrend] = useState<TrendData[]>([]);
  const [contentDist, setContentDist] = useState<ContentDistribution | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [trendPeriod, setTrendPeriod] = useState(7);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchUserTrend();
  }, [trendPeriod]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendRes, distRes, activityRes] = await Promise.all([
        analyticsService.getOverviewStats(),
        analyticsService.getUserTrend(trendPeriod),
        analyticsService.getContentDistribution(),
        analyticsService.getRecentActivity(5),
      ]);

      if (overviewRes.code === 200) setOverview(overviewRes.data);
      if (trendRes.code === 200) setUserTrend(trendRes.data.trend);
      if (distRes.code === 200) setContentDist(distRes.data);
      if (activityRes.code === 200) setRecentActivity(activityRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrend = async () => {
    try {
      const res = await analyticsService.getUserTrend(trendPeriod);
      if (res.code === 200) setUserTrend(res.data.trend);
    } catch (error) {
      console.error("Error fetching user trend:", error);
    }
  };

  const stats = overview?.overview ? [
    {
      title: "Tổng người dùng",
      value: overview.overview.totalUsers.toLocaleString(),
      change: overview.changes.usersChange,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Người dùng hoạt động",
      value: overview.overview.activeUsers.toLocaleString(),
      change: 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tổng từ vựng",
      value: overview.overview.totalWords.toLocaleString(),
      change: overview.changes.wordsChange,
      icon: BookOpen,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Danh mục",
      value: overview.overview.totalCategories.toLocaleString(),
      change: 0,
      icon: FolderTree,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Bộ thẻ",
      value: overview.overview.totalCardDecks.toLocaleString(),
      change: 0,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Lộ trình học",
      value: overview.overview.totalLearningPaths.toLocaleString(),
      change: 0,
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Bài học",
      value: overview.overview.totalLessons.toLocaleString(),
      change: overview.changes.lessonsChange,
      icon: GraduationCap,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Bài tập",
      value: overview.overview.totalQuizzes.toLocaleString(),
      change: 0,
      icon: ClipboardList,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-500">Chào mừng trở lại! Đây là tổng quan phân tích của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== 0 && (
                <p className={`text-xs flex items-center mt-1 ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change > 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stat.change > 0 ? '+' : ''}{stat.change}% so với tháng trước
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Registration Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Xu hướng đăng ký người dùng
            </CardTitle>
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(Number(e.target.value))}
              className="text-sm border rounded-lg px-3 py-1 cursor-pointer"
            >
              <option value={7}>7 ngày qua</option>
              <option value={14}>14 ngày qua</option>
              <option value={30}>30 ngày qua</option>
            </select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userTrend}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Words by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Từ vựng theo cấp độ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentDist?.wordsByLevel || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(contentDist?.wordsByLevel || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-purple-600" />
              Danh mục hàng đầu theo từ vựng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentDist?.wordsByCategory?.slice(0, 8) || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lessons by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-pink-600" />
              Bài học theo trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentDist?.lessonsByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(contentDist?.lessonsByStatus || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Words */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600" />
              Từ vựng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.recentWords?.length === 0 ? (
                <p className="text-gray-500 text-sm">Không có từ vựng gần đây</p>
              ) : (
                recentActivity?.recentWords?.map((word: any) => (
                  <div key={word._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-sky-600">
                          {word.word?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{word.word}</p>
                        <p className="text-xs text-gray-500">{word.level}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(word.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Người dùng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.recentUsers?.length === 0 ? (
                <p className="text-gray-500 text-sm">Không có người dùng gần đây</p>
              ) : (
                recentActivity?.recentUsers?.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-pink-600" />
              Bài học gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.recentLessons?.length === 0 ? (
                <p className="text-gray-500 text-sm">Không có bài học gần đây</p>
              ) : (
                recentActivity?.recentLessons?.map((lesson: any) => (
                  <div key={lesson._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{lesson.title}</p>
                        <p className="text-xs text-gray-500">{lesson.status}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
