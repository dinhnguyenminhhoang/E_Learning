"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/services/profile.service";
import type { UserProfile, DailyStat } from "@/Types/profile.types";
import { achievementService } from "@/services/achievement.service";
import type { UserAchievement } from "@/Types/achievement.types";
// --- 1. Import thêm các Icons cần thiết ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter, // Import thêm footer
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Flame,
  Clock,
  BookOpen,
  BarChart3,
  Camera,
  LogOut,
  Bell,
  Volume2,
  Moon,
  Target,
  Zap,
  Award,
  TrendingUp,
  CheckCircle,
  Lock,
  Map, // Icon cho Tab Lộ trình
  ArrowRight,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { userLearningPathService } from "@/services/userLearningPath.service";
import { SimplePath } from "@/types/userPath";
import { learningPathService } from "@/services/learningPath.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// --- 2. Định nghĩa Type nhanh cho UserLearningPath (Tốt nhất nên để file riêng) ---
interface LearningPathDetail {
  _id: string;
  title: string;
  description?: string;
  level: string;
  totalLessons?: number; // Giả sử có trường này hoặc tính từ mảng levels
}

interface UserLearningPathData {
  _id: string;
  learningPath: LearningPathDetail; // Lộ trình hiện tại (Active)
  listPath: LearningPathDetail[]; // Danh sách tất cả lộ trình
  progress: {
    currentLevel: number;
    currentLesson: number;
  };
}

export default function ProfilePage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [availablePaths, setAvailablePaths] = useState<SimplePath[]>([]);
  const [loadingPaths, setLoadingPaths] = useState(false);
  const [assigningPath, setAssigningPath] = useState<string | null>(null);
  // --- 3. State mới cho Lộ trình ---
  const [pathData, setPathData] = useState<UserLearningPathData | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    studyReminder: true,
    soundEffects: true,
    darkMode: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPathModal = async () => {
    setIsPathModalOpen(true);
    if (availablePaths.length > 0) return; // Nếu đã fetch rồi thì không fetch lại

    try {
      setLoadingPaths(true);
      const res = (await learningPathService.getAllPath()) as any;
      if (res.code === 200) {
        setAvailablePaths(res.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách lộ trình");
    } finally {
      setLoadingPaths(false);
    }
  };
  const handleSelectPath = async (pathId: string) => {
    try {
      setAssigningPath(pathId);
      const res = (await learningPathService.assignPathToUser({
        learningPathId: pathId,
      })) as any;

      if (res.code === 200 || res.code === 201) {
        toast.success("Đã thay đổi lộ trình thành công!");
        setIsPathModalOpen(false); // Đóng modal
        fetchData(); // Load lại dữ liệu profile để cập nhật lộ trình mới
      } else {
        toast.error(res.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi khi chọn lộ trình");
    } finally {
      setAssigningPath(null);
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      // --- 4. Gọi API song song (Promise.all) ---
      const [profileRes, statsRes, achievementsRes, pathsRes] =
        await Promise.all([
          profileService.getMyProfile(),
          profileService.getWeeklyStats(),
          achievementService.getMyAchievements(),
          userLearningPathService.getPathsByUser(), // Gọi API lấy lộ trình
        ]);

      if (profileRes.code === 200) {
        setProfile(profileRes.data);
        setEditForm({
          name: profileRes.data.name,
          phoneNumber: profileRes.data.phoneNumber || "",
          bio: profileRes.data.bio || "",
        });
        setSettings({
          studyReminder:
            profileRes.data.learningPreferences?.studyReminder ?? true,
          soundEffects: true,
          darkMode: false,
        });
      }

      if (statsRes.code === 200) {
        setStats(statsRes.data);
      }

      if (achievementsRes.code === 200) {
        setAchievements(achievementsRes.data.achievements || []);
      }

      // --- 5. Xử lý dữ liệu lộ trình ---
      if (pathsRes && pathsRes.code === 200) {
        // Xử lý trường hợp data trả về là mảng hoặc object (dựa trên các câu hỏi trước của bạn)
        const rawData = pathsRes.data;
        const dataToSet = Array.isArray(rawData) ? rawData[0] : rawData;
        setPathData(dataToSet);
      }
    } catch (error) {
      console.error("Failed to fetch profile data", error);
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await profileService.updateProfile(editForm);
      if (res.code === 200) {
        setProfile((prev) => (prev ? { ...prev, ...res.data } : null));
        toast.success("Cập nhật hồ sơ thành công!");
      }
    } catch (error) {
      toast.error("Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsChange = async (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "studyReminder") {
      try {
        await profileService.updateProfile({
          learningPreferences: { studyReminder: value },
        });
        toast.success("Đã cập nhật cài đặt");
      } catch (error) {
        toast.error("Lỗi cập nhật cài đặt");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const completedAchievements = achievements.filter(
    (a) => a.isCompleted
  ).length;
  const totalStudyHours = Math.floor(
    (profile.statistics?.totalStudyTime || 0) / 3600
  );
  const totalStudyMinutes = Math.floor(
    ((profile.statistics?.totalStudyTime || 0) % 3600) / 60
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header Section giữ nguyên */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white shadow-xl cursor-pointer ring-4 ring-blue-100">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  {profile.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors border-2 border-gray-100">
                <Camera className="h-4 w-4 text-gray-600" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-semibold border border-yellow-200 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {profile.rank}
                </span>
                <span className="text-gray-500 text-sm">
                  Tham gia từ{" "}
                  {new Date(profile.joinDate).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Level {profile.level}
                  </span>
                  <span className="text-gray-500">
                    {profile.xp.toLocaleString()} /{" "}
                    {profile.nextLevelXp.toLocaleString()} XP
                  </span>
                </div>
                <Progress
                  value={
                    (profile.progressInLevel / profile.xpNeededForNext) * 100
                  }
                  className="h-2.5 bg-blue-100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs
          defaultValue="overview"
          className="space-y-6"
          onValueChange={setActiveTab}
        >
          {/* Cập nhật TabsList cho responsive hơn nếu thêm tab mới */}
          <TabsList className="grid w-full grid-cols-5 lg:w-[580px] bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>

            {/* --- 6. Tab Trigger Mới --- */}
            <TabsTrigger value="paths" className="gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Lộ trình</span>
            </TabsTrigger>

            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Thành tích</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="gap-2">
              <span className="hidden sm:inline">Chỉnh sửa</span>
              <span className="sm:hidden">Sửa</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <span className="hidden sm:inline">Cài đặt</span>
              <span className="sm:hidden">Cài</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB (Giữ nguyên) */}
          <TabsContent value="overview" className="space-y-6">
            {/* ... (Code cũ của Overview Tab) ... */}
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-orange-200 rounded-full">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-700">
                      {profile.statistics?.currentStreak || 0}
                    </div>
                    <div className="text-xs text-orange-600 uppercase font-semibold">
                      Chuỗi ngày
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-blue-200 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      {profile.statistics?.totalWordsLearned || 0}
                    </div>
                    <div className="text-xs text-blue-600 uppercase font-semibold">
                      Từ vựng
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-green-200 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-700">
                      {totalStudyHours > 0
                        ? `${totalStudyHours}h`
                        : `${totalStudyMinutes}m`}
                    </div>
                    <div className="text-xs text-green-600 uppercase font-semibold">
                      Thời gian học
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-700">
                      {completedAchievements}
                    </div>
                    <div className="text-xs text-purple-600 uppercase font-semibold">
                      Thành tích
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* XP Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.statistics?.totalXP?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-500">Tổng XP</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.statistics?.weeklyXP?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-500">XP tuần này</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.statistics?.monthlyXP?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-500">XP tháng này</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Hoạt động học tập
                </CardTitle>
                <CardDescription>
                  Tiến độ học tập 7 ngày gần nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2 pt-4">
                  {stats.length > 0 ? (
                    stats.map((stat, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2 group"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md relative group-hover:from-blue-600 group-hover:to-blue-500 transition-all duration-300 min-h-[4px]"
                          style={{
                            height: `${Math.max(stat.studyTime * 2, 4)}%`,
                          }}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {stat.studyTime} phút
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(stat.date).toLocaleDateString("vi-VN", {
                            weekday: "short",
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      Chưa có dữ liệu hoạt động
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- 7. NEW: LEARNING PATHS TAB --- */}
          <TabsContent value="paths" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Lộ trình học tập của bạn
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleOpenPathModal}
              >
                <Target className="w-4 h-4" />
                Khám phá thêm
              </Button>
            </div>

            {!pathData ||
            !pathData.listPath ||
            pathData.listPath.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Map className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">
                    Chưa tham gia lộ trình nào
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-sm">
                    Hãy bắt đầu hành trình học tập bằng cách đăng ký một lộ
                    trình phù hợp với bạn.
                  </p>
                  <Link href="/learning-paths">
                    <Button>Khám phá lộ trình</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {pathData.listPath.map((path) => {
                  // Logic kiểm tra lộ trình hiện tại
                  // pathData.learningPath là lộ trình active hiện tại
                  const isActive =
                    pathData.learningPath &&
                    path._id === pathData.learningPath._id;

                  return (
                    <Card
                      key={path._id}
                      className={cn(
                        "relative transition-all duration-300 hover:shadow-md flex flex-col",
                        isActive
                          ? "border-green-500 ring-1 ring-green-500 bg-green-50/30"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                    >
                      {isActive && (
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1 z-10">
                          <Zap className="w-3 h-3" />
                          ĐANG HỌC
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-1 text-blue-700">
                              {path.title}
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-xs font-semibold",
                                  path.level === "BEGINNER"
                                    ? "bg-green-100 text-green-700"
                                    : path.level === "INTERMEDIATE"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                )}
                              >
                                {path.level}
                              </span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              isActive
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            )}
                          >
                            {isActive ? (
                              <BookmarkCheck className="h-6 w-6" />
                            ) : (
                              <Map className="h-6 w-6" />
                            )}
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 mt-2">
                          {path.description ||
                            "Lộ trình toàn diện giúp bạn nâng cao kỹ năng tiếng Anh hiệu quả."}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1">
                        {/* Nếu là active path, hiển thị tiến độ chi tiết hơn từ progress */}
                        {isActive ? (
                          <div className="space-y-3 mt-2 bg-white/60 p-3 rounded-lg border border-green-100">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Tiến độ hiện tại
                              </span>
                              <span className="font-bold text-green-700">
                                Level {pathData.progress?.currentLevel || 1} •
                                Bài {pathData.progress?.currentLesson || 1}
                              </span>
                            </div>
                            {/* Giả lập progress bar (bạn có thể tính % chính xác nếu có totalLessons) */}
                            <Progress value={35} className="h-2 bg-green-200" />
                          </div>
                        ) : (
                          <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                            <p className="text-sm text-gray-500 italic">
                              Chuyển sang lộ trình này để tiếp tục học.
                            </p>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        {isActive ? (
                          <Link href="/learn" className="w-full">
                            <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
                              Tiếp tục học <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full hover:bg-blue-50 hover:text-blue-600 gap-2"
                          >
                            Xem chi tiết
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ACHIEVEMENTS TAB (Giữ nguyên, chỉ rút gọn để đỡ dài code hiển thị ở đây) */}
          <TabsContent value="achievements">
            {/* ... Code cũ của tab achievements ... */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Thành tích của bạn
              </h2>
              <Link href="/achievements">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.slice(0, 6).map((ua) => {
                const achievement = ua.achievement;
                const isCompleted = ua.isCompleted || ua.progress >= 100;

                return (
                  <Card
                    key={achievement?._id}
                    className={cn(
                      "transition-all duration-300",
                      isCompleted
                        ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                        : ua.progress > 0
                          ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                          : "bg-gray-50 opacity-60"
                    )}
                  >
                    <CardContent className="p-4 flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl text-2xl",
                          isCompleted
                            ? "bg-green-100"
                            : ua.progress > 0
                              ? "bg-blue-100"
                              : "bg-gray-200"
                        )}
                      >
                        {achievement?.icon || "🏆"}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900">
                            {achievement?.nameVi || achievement?.name}
                          </h3>
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {!isCompleted && ua.progress === 0 && (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {achievement?.description}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Tiến độ</span>
                            <span>{ua.progress}%</span>
                          </div>
                          <Progress
                            value={ua.progress}
                            className={cn(
                              "h-1.5",
                              isCompleted ? "bg-green-200" : "bg-blue-200"
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* EDIT & SETTINGS TAB (Giữ nguyên) */}
          <TabsContent value="edit">
            {/* ... Code cũ Edit ... */}
            <Card>
              <CardHeader>
                <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={editForm.phoneNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="0123456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email không thể thay đổi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu bản thân</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="Viết vài dòng về bản thân bạn..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {editForm.bio.length}/500
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEditForm({
                        name: profile.name,
                        phoneNumber: profile.phoneNumber || "",
                        bio: profile.bio || "",
                      })
                    }
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            {/* ... Code cũ Settings ... */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt</CardTitle>
                <CardDescription>Quản lý tùy chọn ứng dụng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nhắc nhở học tập</p>
                      <p className="text-sm text-gray-500">
                        Nhận thông báo nhắc nhở học mỗi ngày
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.studyReminder}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("studyReminder", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Volume2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Hiệu ứng âm thanh</p>
                      <p className="text-sm text-gray-500">
                        Phát âm thanh trong bài học
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("soundEffects", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Moon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Chế độ tối</p>
                      <p className="text-sm text-gray-500">
                        Chuyển sang giao diện tối
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("darkMode", checked)
                    }
                  />
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-sm font-medium text-red-600 mb-4">
                    Vùng nguy hiểm
                  </h3>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Xóa tài khoản
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Path selection modal */}
        <Dialog open={isPathModalOpen} onOpenChange={setIsPathModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chọn lộ trình</DialogTitle>
              <DialogDescription>
                Chọn một lộ trình phù hợp để bắt đầu hoặc chuyển đổi.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3 max-h-72 overflow-auto">
              {loadingPaths ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Đang tải lộ trình...</span>
                </div>
              ) : availablePaths && availablePaths.length > 0 ? (
                availablePaths.map((p) => (
                  <Card key={p._id} className="p-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {p.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleSelectPath(p._id)}
                          disabled={!!assigningPath}
                        >
                          {assigningPath === p._id ? "Đang xử lý..." : "Chọn"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-6 text-center text-gray-500">
                  Không có lộ trình nào khả dụng.
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose>
                <Button
                  variant="outline"
                  onClick={() => setIsPathModalOpen(false)}
                >
                  Hủy
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}