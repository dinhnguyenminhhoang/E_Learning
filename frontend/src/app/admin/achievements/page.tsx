"use client";

import { useState, useEffect } from "react";
import { achievementAdminService } from "@/services/achievementAdmin.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AchievementsAdminPage() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        nameVi: "",
        description: "",
        icon: "",
        type: "streak",
        criteriaTarget: 0,
        criteriaUnit: "",
        rarity: "common",
        points: 0,
    });

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            const response = await achievementAdminService.getAllAchievements({ limit: 100 });
            if (response.code === 200) {
                setAchievements(response.data || response.achievements || []);
            }
        } catch (error) {
            console.error("Error loading achievements:", error);
            toast.error("Không thể tải achievements");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                name: formData.name,
                nameVi: formData.nameVi,
                description: formData.description,
                icon: formData.icon,
                type: formData.type,
                criteria: {
                    target: formData.criteriaTarget,
                    unit: formData.criteriaUnit,
                },
                rarity: formData.rarity,
                points: formData.points,
                status: "active",
            };

            if (editingId) {
                await achievementAdminService.updateAchievement(editingId, data);
                toast.success("Cập nhật achievement thành công");
            } else {
                await achievementAdminService.createAchievement(data);
                toast.success("Tạo achievement thành công");
            }

            setShowForm(false);
            setEditingId(null);
            resetForm();
            loadAchievements();
        } catch (error: any) {
            console.error("Error saving achievement:", error);
            toast.error(error.response?.data?.message || "Lỗi khi lưu achievement");
        }
    };

    const handleEdit = (achievement: any) => {
        setFormData({
            name: achievement.name,
            nameVi: achievement.nameVi || "",
            description: achievement.description || "",
            icon: achievement.icon || "",
            type: achievement.type,
            criteriaTarget: achievement.criteria?.target || 0,
            criteriaUnit: achievement.criteria?.unit || "",
            rarity: achievement.rarity,
            points: achievement.points || 0,
        });
        setEditingId(achievement._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa achievement này?")) return;

        try {
            await achievementAdminService.deleteAchievement(id);
            setAchievements(prev => prev.filter(a => a._id !== id));
            toast.success("Xóa achievement thành công");
        } catch (error) {
            console.error("Error deleting achievement:", error);
            toast.error("Lỗi khi xóa achievement");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            nameVi: "",
            description: "",
            icon: "",
            type: "streak",
            criteriaTarget: 0,
            criteriaUnit: "",
            rarity: "common",
            points: 0,
        });
    };

    const getRarityColor = (rarity: string) => {
        const colors = {
            common: "bg-gray-100 border-gray-300 text-gray-700",
            rare: "bg-blue-100 border-blue-400 text-blue-700",
            epic: "bg-purple-100 border-purple-400 text-purple-700",
            legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
        };
        return colors[rarity as keyof typeof colors] || colors.common;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold">Quản Lý Achievements</h1>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setEditingId(null);
                        setShowForm(!showForm);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Achievement
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{editingId ? "Sửa" : "Tạo"} Achievement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Tên (English)</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Tên (Tiếng Việt)</Label>
                                    <Input
                                        value={formData.nameVi}
                                        onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Mô tả</Label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Icon (emoji)</Label>
                                    <Input
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="🏆"
                                    />
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="streak">Streak (học liên tục)</SelectItem>
                                            <SelectItem value="login_streak">Login Streak (đăng nhập)</SelectItem>
                                            <SelectItem value="words_learned">Words Learned</SelectItem>
                                            <SelectItem value="quiz_score">Quiz Score</SelectItem>
                                            <SelectItem value="sessions">Sessions</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Rarity</Label>
                                    <Select
                                        value={formData.rarity}
                                        onValueChange={(value) => setFormData({ ...formData, rarity: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="common">Common</SelectItem>
                                            <SelectItem value="rare">Rare</SelectItem>
                                            <SelectItem value="epic">Epic</SelectItem>
                                            <SelectItem value="legendary">Legendary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Target</Label>
                                    <Input
                                        type="number"
                                        value={formData.criteriaTarget}
                                        onChange={(e) =>
                                            setFormData({ ...formData, criteriaTarget: parseInt(e.target.value) })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Unit</Label>
                                    <Select
                                        value={formData.criteriaUnit}
                                        onValueChange={(value) => setFormData({ ...formData, criteriaUnit: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn đơn vị" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="days">days (ngày)</SelectItem>
                                            <SelectItem value="words">words (từ)</SelectItem>
                                            <SelectItem value="percentage">percentage (%)</SelectItem>
                                            <SelectItem value="sessions">sessions (buổi học)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Points</Label>
                                    <Input
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    {editingId ? "Cập nhật" : "Tạo"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        resetForm();
                                    }}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <Card key={achievement._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2",
                                        getRarityColor(achievement.rarity)
                                    )}
                                >
                                    {achievement.icon || "🏆"}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(achievement)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(achievement._id)}
                                        className="hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1">
                                {achievement.nameVi || achievement.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                    {achievement.type} - {achievement.criteria?.target} {achievement.criteria?.unit}
                                </span>
                                <span className="font-semibold text-yellow-600">{achievement.points} XP</span>
                            </div>

                            <div className="mt-3 pt-3 border-t">
                                <span
                                    className={cn(
                                        "text-xs px-2 py-1 rounded-full font-medium",
                                        getRarityColor(achievement.rarity)
                                    )}
                                >
                                    {achievement.rarity}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {achievements.length === 0 && (
                <div className="text-center py-20">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có achievement nào</p>
                </div>
            )}
        </div>
    );
}
