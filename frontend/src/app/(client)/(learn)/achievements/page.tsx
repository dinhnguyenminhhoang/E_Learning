"use client";

import { useState, useEffect } from "react";
import { achievementService } from "@/services/achievement.service";
import type {
    UserAchievement,
    AchievementStats,
    AchievementsByRarity,
} from "@/Types/achievement.types";
import { toast } from "react-hot-toast";
import { Trophy, Lock, CheckCircle, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [stats, setStats] = useState<AchievementStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "completed" | "in_progress" | "locked">("all");
    const [rarityFilter, setRarityFilter] = useState<"all" | "common" | "rare" | "epic" | "legendary">("all");

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            const response = await achievementService.getMyAchievements();
            if (response.code === 200) {
                setAchievements(response.data.achievements);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error loading achievements:", error);
            toast.error("Không thể tải achievements");
        } finally {
            setLoading(false);
        }
    };

    const getRarityColor = (rarity: string) => {
        const colors = {
            common: "bg-gray-100 border-gray-300 text-gray-700",
            rare: "bg-blue-100 border-blue-400 text-blue-700",
            epic: "bg-purple-100 border-purple-400 text-purple-700",
            legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-500",
        };
        return colors[rarity as keyof typeof colors] || colors.common;
    };

    const getRarityBadge = (rarity: string) => {
        const labels = {
            common: "Phổ Thông",
            rare: "Hiếm",
            epic: "Sử Thi",
            legendary: "Huyền Thoại",
        };
        return labels[rarity as keyof typeof labels] || rarity;
    };

    const filteredAchievements = achievements.filter((ua) => {
        const isFullyCompleted = ua.isCompleted || ua.progress >= 100;

        if (filter === "completed" && !isFullyCompleted) return false;
        if (filter === "in_progress" && (isFullyCompleted || ua.progress === 0)) return false;
        if (filter === "locked" && (isFullyCompleted || ua.progress > 0)) return false;

        // Filter by rarity
        if (rarityFilter !== "all" && ua.achievement?.rarity !== rarityFilter) return false;

        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Thành Tích
                            </h1>
                            <p className="text-gray-600 mt-1">Khám phá và mở khóa các thành tích</p>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                                <div className="text-sm text-gray-600">Tổng số</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border-2 border-green-200">
                                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                                <div className="text-sm text-gray-600">Đã hoàn thành</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border-2 border-yellow-200">
                                <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
                                <div className="text-sm text-gray-600">Đang tiến độ</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
                                <div className="text-3xl font-bold text-gray-600">{stats.locked}</div>
                                <div className="text-sm text-gray-600">Đã khóa</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex gap-2">
                        {["all", "completed", "in_progress", "locked"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={cn(
                                    "px-4 py-2 rounded-xl font-medium transition-all",
                                    filter === f
                                        ? "bg-blue-500 text-white shadow-lg"
                                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                                )}
                            >
                                {f === "all" && "Tất cả"}
                                {f === "completed" && "Hoàn thành"}
                                {f === "in_progress" && "Đang làm"}
                                {f === "locked" && "Đã khóa"}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 ml-auto">
                        {["all", "common", "rare", "epic", "legendary"].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRarityFilter(r as any)}
                                className={cn(
                                    "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                                    rarityFilter === r
                                        ? "bg-purple-500 text-white shadow-lg"
                                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300"
                                )}
                            >
                                {r === "all" && "Tất cả"}
                                {r !== "all" && getRarityBadge(r)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAchievements.map((ua) => {
                        const isLocked = !ua.isCompleted && ua.progress === 0;
                        const isInProgress = !ua.isCompleted && ua.progress > 0;
                        const achievement = ua.achievement;

                        // Calculate current value from progress
                        const targetValue = achievement?.criteria?.target || 0;
                        const currentValue = Math.floor((ua.progress / 100) * targetValue);

                        return (
                            <div
                                key={achievement?._id || `temp-${achievement?.name}`}
                                className={cn(
                                    "bg-white rounded-3xl p-6 border-2 transition-all duration-300 relative overflow-hidden",
                                    ua.isCompleted && "shadow-xl border-green-300",
                                    !ua.isCompleted && "hover:shadow-lg",
                                    isLocked && "opacity-70"
                                )}
                            >
                                {/* Rarity background gradient */}
                                {!isLocked && (
                                    <div className="absolute inset-0 opacity-5">
                                        <div className={cn(
                                            "w-full h-full",
                                            achievement?.rarity === "legendary" && "bg-gradient-to-br from-yellow-400 to-orange-500",
                                            achievement?.rarity === "epic" && "bg-gradient-to-br from-purple-400 to-pink-500",
                                            achievement?.rarity === "rare" && "bg-gradient-to-br from-blue-400 to-cyan-500",
                                        )} />
                                    </div>
                                )}

                                {/* Icon & Rarity */}
                                <div className="flex items-start justify-between mb-4 relative">
                                    <div
                                        className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-4 shadow-lg",
                                            getRarityColor(achievement?.rarity || "common")
                                        )}
                                    >
                                        {achievement?.icon || "🏆"}
                                    </div>
                                    {ua.isCompleted && (
                                        <div className="absolute -top-2 -right-2">
                                            <CheckCircle className="w-10 h-10 text-green-500 bg-white rounded-full" />
                                        </div>
                                    )}
                                    {isLocked && <Lock className="w-8 h-8 text-gray-400" />}
                                </div>

                                {/* Title & Rarity Badge */}
                                <div className="mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {achievement?.nameVi || achievement?.name}
                                    </h3>
                                    <span
                                        className={cn(
                                            "inline-block text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide",
                                            getRarityColor(achievement?.rarity || "common")
                                        )}
                                    >
                                        {getRarityBadge(achievement?.rarity || "common")}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    {achievement?.description}
                                </p>

                                {/* Criteria - What to do */}
                                <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-100">
                                    <div className="text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wide">
                                        Yêu cầu hoàn thành
                                    </div>
                                    <div className="text-sm font-bold text-blue-900">
                                        {achievement?.criteria?.target} {achievement?.criteria?.unit}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        {achievement?.type === "streak" && "🔥 Học liên tục"}
                                        {achievement?.type === "words_learned" && "📚 Học từ vựng"}
                                        {achievement?.type === "quiz_score" && "🎯 Điểm quiz"}
                                        {achievement?.type === "sessions" && "⏰ Buổi học"}
                                    </div>
                                </div>

                                {/* Progress Section */}
                                {isInProgress && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-gray-700">Tiến độ</span>
                                            <span className="font-bold text-blue-600">
                                                {currentValue} / {targetValue} {achievement?.criteria?.unit}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative"
                                                    style={{ width: `${ua.progress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="text-xs text-center font-bold text-blue-600 mt-1">
                                                {ua.progress}%
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Locked - Show what to do */}
                                {isLocked && (
                                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                                        <div className="flex items-start gap-2">
                                            <Lock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-sm font-bold text-yellow-900 mb-1">
                                                    Chưa bắt đầu
                                                </div>
                                                <div className="text-xs text-yellow-700">
                                                    Bắt đầu {achievement?.type === "streak" && "học liên tục"}
                                                    {achievement?.type === "words_learned" && "học từ vựng"}
                                                    {achievement?.type === "quiz_score" && "làm quiz"}
                                                    {achievement?.type === "sessions" && "tham gia buổi học"} để mở khóa!
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Points & Type */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-yellow-500" />
                                        <span className="font-bold text-yellow-600">+{achievement?.points} XP</span>
                                    </div>
                                    {ua.isCompleted && ua.unlockedAt && (
                                        <div className="text-xs text-gray-500">
                                            ✅ {new Date(ua.unlockedAt).toLocaleDateString("vi-VN")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredAchievements.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Không có thành tích</h3>
                        <p className="text-gray-600">Thử thay đổi bộ lọc</p>
                    </div>
                )}
            </div>
        </div>
    );
}
